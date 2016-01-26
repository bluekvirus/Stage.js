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
var _ = require('underscore'),
http = require('http'),
httpProxy = require('http-proxy'),
colors = require('colors');

module.exports = function(server){

	var profile = server.get('profile');

	//1. prepare proxied data services (into routes)
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

	//2 mount pre-routes middlewares, add more to /middlewares/pre.js
	console.log('[middlewares - pre routes]', 'injecting...');
	server.middlewares.pre(server);

	_.each(server.get('routers'), function(router, mountPath){
		server.use(mountPath, router);
		console.log('[router]', mountPath.yellow);
	});

	//3 mount post-routes middlewares, add more to /middlewares/post.js
	console.log('[middlewares - post routes]', 'injecting...');
	server.middlewares.post(server);

	//4 mount websockets, client msg {channel: '..:..', payload: {...}};
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
};