/**
 * The router creation helper method
 *
 * @author Tim.Liu
 * @created 2014.04.20
 */

var express = require('express'),
path = require('path'),
_ = require('underscore');
_.str = require('underscore.string');

module.exports = function(server){

	var reg = server.set('routers', {}).get('routers'),
	profile = server.get('profile');

	//register routers
	server.mount = function(routerFile, customURI){
		var router = express.Router();

		//register
		var routerPath = customURI;
		if(!routerPath) {
			routerPath = routerFile.location.split(path.sep); //so the path -> uri won't get screwed by Windows...
			routerPath.shift(); //push out 'routers' folder name;
		}else
			routerPath = routerPath.split('/');

		_.each(profile.clients, function(webroot, uri){
			var mountpath = _.compact(uri.split('/').concat(routerPath)).join('/');
			reg['/' + mountpath] = router;
		});

		//empty non-secured router .token() stub
		router.token = function(){ return function(req, res, next){ next(); };};
		//alias: router.permission()
		router.permission = router.token;

		return router;
	};

};