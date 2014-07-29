/**
 * The server stack mounting bot (static webroots, middleware/services, routers)
 *
 * @author Tim.Liu
 * @created 2014.04.20
 */
var express = require('express'),
path = require('path'),
_ = require('underscore'),
cors = require('cors'),
httpProxy = require('http-proxy'),
colors = require('colors');

module.exports = function(server){

	var profile = server.get('profile');

	//compression, logger
	//not used in this simple version of api-box

	//mount different clients (static web.roots)
	_.each(profile.clients, function(filePath, uriName){
		server.use(uriName, express.static(profile.clients[uriName]));
		console.log('[static/public]', uriName.yellow, '[', profile.clients[uriName], ']');
	});

	//mount pre-defined middlewares
	console.log('[middlewares]', 'processing...', '[pre-defined]'.grey);
	//1. cors
	if(profile.crossdomain){
		server.use(cors());
		console.log('[CORS: enabled]'.yellow);
	}

	//2. proxied data services (routes proxy)
	_.each(profile.proxied, function(config, uri){
		if(!config.enabled) return;

		var target = [
				'http', 
				(config.https?'s':''),
				'://',
				(config.username?([config.username, config.password].join(':') + '@'):''),
				config.host, ':', config.port || 80
			].join('');		
		var proxy = httpProxy.createProxyServer({
			target: target
		});
		///////////////NOT WORKING ATM (see work-around)///////////
		proxy.on('proxyReq', function(proxyReq, req, res, options){
			console.log('???');
		});
		///////////////////////////////////////////////////////////
		proxy.on('proxyRes', function(res){
			console.log('[Forwarding]'.yellow, res.req.path, '=>', target);
		});
		proxy.on('error', function(e){
			console.warn('[Forwarding Error]'.red, e);
		});
		server.all(uri + '/*', function(req, res){
			///////////////work-around////////////////
			_.each(config.headers, function(val, key){
				req.headers[key] = val;
			});
			//////////////////////////////////////////
			proxy.web(req, res);
		});
		console.log('[Proxied API]:'.yellow, uri, '-->', target);
	});	

	//mount customized (developer added) middlewares, see /middlewares/inject.js
	console.log('[middlewares]', 'processing...', '[customized]'.grey);
	server.middlewares.inject(server);
	console.log('[middlewares]', 'injected.');

	//mount routers
	_.each(server.get('routers'), function(router, mountpath){
		server.use(mountpath, router);
		console.log('[router]', mountpath.yellow);
	});

};