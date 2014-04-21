/**
 * The routes mounting bot (webroots, routers, services)
 *
 * @author Tim.Liu
 * @created 2014.04.20
 */
var express = require('express'),
path = require('path'),
_ = require('underscore');

module.exports = function(server){

	var profile = server.get('profile');
	//mount different clients (static web.roots)
	_.each(profile.clients, function(filePath, uriName){
		server.use(uriName, express.static(profile.clients[uriName]));
		console.log('[Web root]', uriName.yellow, '[', profile.clients[uriName], ']');
	});

	//mount middlewares (compress[before static?], logger, cookie, session, csrf, body-parser[urlencoded, json], method-override, multiparty...)

	//mount routers
	_.each(server.get('routers'), function(router, mountpath){
		//console.log(mountpath);
		server.use(mountpath, router);
	});

}