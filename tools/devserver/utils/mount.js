/**
 * The router creation helper method
 *
 * @author Tim.Liu
 * @created 2014.04.20
 */

var express = require('express'),
path = require('path'),
_ = require('underscore');

module.exports = function(server){

	var reg = server.set('routers', {}).get('routers'),
	profile = server.get('profile');

	//register routers
	server.mount = function(routerFile, uri){
		var router = express.Router();

		//register
		if(uri) reg[uri] = router;
		else {
			_.each(profile.clients, function(webroot, uri){

				var routerPath = routerFile.location.split(path.sep); //so the path -> uri won't get screwed by Windows...
				routerPath.shift(); //push out 'routers' folder name;

				var mountpath = _.compact(uri.split('/').concat(routerPath)).join('/');
				reg['/' + mountpath] = router;
			});
		}
		return router;
	}

}