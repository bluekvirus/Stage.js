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
				var mountpath = path.normalize([uri, routerFile.name].join('/'));
				reg[mountpath] = router;
			});
		}
		return router;
	}

}