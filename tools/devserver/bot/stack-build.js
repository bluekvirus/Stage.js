/**
 * The server stack mounting bot (static webroots, middleware/services, routers)
 *
 * @author Tim.Liu
 * @created 2014.04.20
 */
var express = require('express'),
path = require('path'),
_ = require('underscore');

module.exports = function(server){

	var profile = server.get('profile');

	//compression, logger
	//not used in this simple version of api-box


	//mount different clients (static web.roots)
	_.each(profile.clients, function(filePath, uriName){
		server.use(uriName, express.static(profile.clients[uriName]));
		console.log('[static/public]', uriName.yellow, '[', profile.clients[uriName], ']');
	});


	//mount shared middlewares, see /middlewares/inject.js
	server.middlewares.inject(server);
	console.log('[middlewares]', 'injected');

	//mount routers
	_.each(server.get('routers'), function(router, mountpath){
		server.use(mountpath, router);
		console.log('[router]', mountpath.yellow);
	});

}