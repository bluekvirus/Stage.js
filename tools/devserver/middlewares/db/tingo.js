/**
 * TingoDB middleware script, expressjs 4.0+
 *
 * @author Tim.Liu
 * @created 2014.06.11
 */

var path = require('path'),
fs = require('fs-extra'),
tingo = require('tingodb')();

module.exports = function(server){

	var profile = server.get('profile');

	//call this function to return your middleware;
	return function(options){

		//prepare your middleware according to options
		var dbFile = (options && options.path) || path.join(profile.root, profile.db.tingo.path);
		fs.ensureDirSync(dbFile); //db path must be a folder
		var db = new (tingo.Db)(dbFile, {});

		return function(req, res, next){

			//you customized code here, req.app for application server
			req.db = db;
			next(); // or error out

		};

	};

};