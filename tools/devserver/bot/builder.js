/**
 * The server stack building bot (static webroots, middleware/services, routers)
 *
 * Warning
 * -------
 * Make sure the middlewares are built with their factory methods before use...
 *
 * @author Tim Lauv
 * @created 2014.04.20
 * @updated 2014.07.31
 */
var express = require('express'),
path = require('path'),
_ = require('underscore'),
http = require('http'),
cors = require('cors'),
httpProxy = require('http-proxy'),
errorhandler = require('errorhandler'),
colors = require('colors');

module.exports = function(server){

	var profile = server.get('profile');

	//mount different clients (static web.roots)
	console.log('[web roots]', 'processing...');
	//fix web root(s)' path(s)
	_.each(profile.clients, function(filePath, uriName){
		profile.clients[uriName] = profile.resolve(filePath);
	});
	_.each(profile.clients, function(filePath, uriName){
		server.use(uriName, express.static(profile.clients[uriName]));
		console.log('[www root]', uriName.yellow, '[', profile.clients[uriName], ']');
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
		config.path = config.path || uri;

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
		//header injection
		proxy.on('proxyReq', function(proxyReq, req, res, options){
			_.each(config.headers, function(val, key){
				req.headers[key] = val;
			});
		});
		proxy.on('proxyRes', function(res){
			console.log('[Forwarding]'.yellow, res.req.path, '=>', target, config.path);
		});
		proxy.on('error', function(e){
			console.warn('[Forwarding Error]'.red, e);
		});
		server.all(uri + '/*', function(req, res){
			//Warning: Don't use req.path here, it is read-only and will not contain query params.
			req.url = req.url.replace(uri, config.path);
			proxy.web(req, res);
		});
		console.log('[Proxied API]:'.yellow, uri, '-->', target, config.path);
	});	

	//mount customized (developer added) middlewares, see /middlewares/inject.js
	console.log('[middlewares]', 'processing...', '[customized]'.grey);
	server.middlewares.inject(server);
	console.log('[middlewares]', 'injected.');

	//mount routers
	_.each(server.get('routers'), function(router, mountPath){
		server.use(mountPath, router);
		console.log('[router]', mountPath.yellow);
	});
	console.log('[routers]', 'mounted.');

	//mount websockets, client msg = {channel: '..:..', payload: {...}};
	server.websockets = {};
	///////////////work-around////////////////
	serverPlus = http.createServer(server);
	server.listen = function(){
		return serverPlus.listen.apply(serverPlus, arguments);
	};
	//////////////////////////////////////////
	var channels = server.get('channels');
	_.each(profile.websockets, function(socketPath){
		server.websockets[socketPath] = new (require('ws').Server)({
			server: serverPlus, //use the work-around http wrapper (*required!*)
			path: socketPath
		});
		//serverSock events: 'listening', 'error', 'connection', 'headers'
		server.websockets[socketPath].on('connection', function sockHandler(clientSock){
			//+clientSock.json(obj)
			clientSock.json = function(data){
				this.send(JSON.stringify(data));
			};
			//clientSock events: 'open', 'error', 'close', 'message'
			clientSock.on('message', function(msg){
				var data = JSON.parse(msg);
				//use handlers registered by server.turnTo(), under /channels
				if(channels[socketPath][data.channel]) //no wild-card channel support yet.
					channels[socketPath][data.channel](data.channel, data.payload, clientSock, server.websockets[socketPath]);
			});
			//give this clientSock an ID? serverSock.clients is an Array atm.
		});
		//+serverSock.broadcast(obj)
		server.websockets[socketPath].broadcast = function(data){
			server.websockets[socketPath].clients.forEach(function(clientSock){
				clientSock.json(data);
			});
		};
		server.websockets[socketPath].once('listening', function(){
			console.log('[websocket]', socketPath.yellow);
		});
	});
	console.log('[websockets]', 'processed.');

	//overall error errorhandler
	if(profile.errorpage){
		server.use(errorhandler());
		console.log('[Error Page: enabled]'.yellow, 'use next(err) in routes and middlewares'.grey);
	}
	
};