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
tingo = require('tingodb')();

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
	server.crud = function(router, entity, mutex){
		entity = entity || router.meta.entity;
		var collection = db.collection(entity);

		router.route('/')
		.get(router.token('read'), function(req, res, next){
			//TBI
			next('Not implemented yet...');
		})
		.post(router.token('create'), function(req, res, next){
			//TBI
			next('Not implemented yet...');
		});

		router.route('/:id')
		.get(router.token('read'), function(req, res, next){
			//TBI
			next('Not implemented yet...');
		})
		.put(router.token('read', 'modify'), function(req, res, next){
			//TBI
			next('Not implemented yet...');
		})
		.delete(router.token('read', 'modify'), function(req, res, next){
			//TBI
			next('Not implemented yet...');
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