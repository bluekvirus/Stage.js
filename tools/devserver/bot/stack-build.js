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
	//not used in this simple version of ajax-box


	//mount different clients (static web.roots)
	_.each(profile.clients, function(filePath, uriName){
		server.use(uriName, express.static(profile.clients[uriName]));
		console.log('[Web root]', uriName.yellow, '[', profile.clients[uriName], ']');
	});


	//mount shared middlewares (cookie, session, csrf, body-parser[urlencoded, json], method-override, multiparty...)
	server.middleware.shared(server);
	

	//mount routers
	_.each(server.get('routers'), function(router, mountpath){
		//console.log(mountpath);
		server.use(mountpath, router);
	});

}