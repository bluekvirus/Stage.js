/**
 * TingoDB middleware script, expressjs 4.0+
 *
 * Standard DB middleware init
 * ---------------------------
 * 1. connect to db with profile setting
 * 2. init db according to profile setting (optional)
 * 3. provide basic entity crud op to server.crud(router [, entity name, mutex]) (optional)
 * 4. assign req.db and return db middleware
 *
 * Relates to
 * ----------
 * server.routers
 * server.models
 *
 * If non-NoSQL db is used, then the routers and the models need to be coded again.
 * 
 *
 * @author Tim.Liu
 * @created 2014.06.11
 */

var path = require('path'),
fs = require('fs-extra'),
tingo = require('tingodb')(),
_ = require('underscore');

module.exports = function(server){

	var profile = server.get('profile');
	server.crud = function(){};

	//do not load this middleware definition if don't want to use tingodb.
	if(!profile.db || !profile.db.tingo) return function(req, res, next){ next('Missing TingoDB configure in profile...'); };

	//1. connect to db according to profile
	var dbFile = path.join(profile.root, profile.db.tingo.path);
	fs.ensureDirSync(dbFile); //db path must be a folder
	var db = new (tingo.Db)(dbFile, {});
	server.set('db', db);

	//2. init db (optional, can be delayed into model def)
	
	//3. provide general server.crud() for serving basic entity crud
	//Note: the basic crud support can be overridden in individual router by putting route before server.crud()
	server.crud = function(router, entity){
		entity = entity || router.meta.entity;
		var collection = db.collection(entity);
		var model = server.models[router.meta.name];

		////////////////////////////////////////////////////
		router.route('/')
		//read all
		.get(router.token('list'), function(req, res, next){
			//TBI: +skip, limit, field filter and search query 
			collection.find().toArray(function(err, docs){
				if(err) return next(err);
				if(model) {
					_.each(docs, function(d){
						model.emit('read', d);
					});
				}
				return res.json(docs);
			});
		})
		//create one*
		.post(router.token('create'), function(req, res, next){
			var docs = req.body;
			if(!_.isArray(docs)) docs = [docs];

			var rejected = [];
			if(model) {
				for (var i in docs) {
					model.emit('validate', docs[i]);
					var result = model.validate(docs[i]);
					if(result.error){
						rejected.push({doc: docs[i], reason:result.error});
						docs[i] = null;
					} 
					//return res.status(400).json({msg: result.error, rejected: docs[i]});
					else docs[i] = result.value;
					model.emit('pre-save', docs[i], collection, 'create');
				}
			}
			if(rejected.length > 0)
				docs = _.compact(docs);
			collection.insert(docs, function(err, result){
				if(err) return next(err);
				if(model) {
					_.each(docs, function(d){
						model.emit('post-save', d, collection, 'create');
					});
				}
				return res.json({created: result, rejected:rejected});
			});
		});

		////////////////////////////////////////////////////
		router.route('/:id')
		//read one
		.get(router.token('read'), function(req, res, next){
			collection.findOne({_id: req.param('id')}, function(err, doc){
				if(err) return next(err);
				if(model) model.emit('read', doc);
				return res.json(doc || {});
			});
		})
		//update one
		.put(router.token('read', 'modify'), function(req, res, next){
			var doc = req.body;

			if(model) {
				model.emit('validate', doc);
				var result = model.validate(doc);
				if(result.error) return res.status(400).json({msg: result.error, rejected: doc});
				else doc = result.value;
				model.emit('pre-save', doc, collection, 'update');
			}
			collection.update({_id: req.param('id')}, doc, function(err, result){
				if(err) return next(err);
				if(model) model.emit('post-save', doc, collection, 'update');
				return res.json({msg: result});
			});
		})
		//delete one
		.delete(router.token('read', 'modify'), function(req, res, next){
			var id = req.param('id');
			if(model) model.emit('pre-delete', id, collection);
			collection.remove({_id: id}, function(err, result){
				if(err) return next(err);
				if(model) model.emit('post-delete', id, collection);
				return res.json({msg: result});
			});
		});
	};

	//4. expose req.db in middleware
	console.log('[DB: Tingo]'.yellow);

	return function(req, res, next){

		//you customized code here, req.app for application server
		req.db = db;
		next(); // or error out

	};


};