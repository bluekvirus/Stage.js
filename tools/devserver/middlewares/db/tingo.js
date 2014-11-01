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

	if(!profile.db.tingo) return function(req, res, next){ next('Missing TingoDB configure in profile...'); };

	//1. connect to db according to profile
	var dbFile = path.join(profile.root, profile.db.tingo.path);
	fs.ensureDirSync(dbFile); //db path must be a folder
	var db = new (tingo.Db)(dbFile, {});
	server.set('db', db);

	//2. init db (check & create superadmin if profile.auth is enabled)
	//TBI
	
	//3. provide general server.crud() for serving basic entity crud
	//Note: the basic crud support can be overridden in individual router by putting route before server.crud()
	server.crud = function(router, entity, hooks){
		entity = entity || router.meta.entity;
		var collection = db.collection(entity);

		////////////////////////////////////////////////////
		router.route('/')
		.get(router.token('list'), function(req, res, next){
			//TBI: +skip, limit, field filter and search query 
			collection.find().toArray(function(err, docs){
				if(err) return next(err);
				if(hooks.list) 
					return hooks.list(docs, req, res, next); //hook.list
				return res.json(docs);
			});
		})
		.post(router.token('create'), function(req, res, next){
			var docs = req.body;
			if(!_.isArray(docs)) docs = [docs];
			//validate them first
			var schema = server.schemas[router.name];
			if(schema){
				for (var i in docs) {
					var result = schema.validate(docs[i]);
					if(result.error) return res.status(400).json({msg: result.error, rejected: docs[i]});
					else docs[i] = result.value;
				}
			}
			if(hooks.create)
				return hooks.create(docs, req, res, next); //hook.create
			collection.insert(docs, function(err, result){
				if(err) return next(err);
				return res.json({msg: result});
			});
		});

		////////////////////////////////////////////////////
		router.route('/:id')
		.get(router.token('read'), function(req, res, next){
			collection.findOne({_id: req.param('id')}, function(err, doc){
				if(err) return next(err);
				if(hooks.read) return hooks.read(doc, req, res, next); //hook.read
				return res.json(doc);
			});
		})
		.put(router.token('read', 'modify'), function(req, res, next){
			var doc = req.body;
			//validate them first
			var schema = server.schemas[router.name];
			if(schema){
				var result = schema.validate(doc);
				if(result.error) return res.status(400).json({msg: result.error, rejected: doc});
				else doc = result.value;
			}
			if(hooks.modify)
				return hooks.modify(doc, req, res, next); //hook.modify (update)
			collection.update({_id: req.param('id')}, doc, function(err, result){
				if(err) return next(err);
				return res.json({msg: result});
			});
		})
		.delete(router.token('read', 'modify'), function(req, res, next){
			collection.remove({_id: req.param('id')}, function(err, result){
				if(err) return next(err);
				if(hooks.modify) 
					return hooks.modify(req.param('id'), req, res, next); //hook.modify (remove)
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