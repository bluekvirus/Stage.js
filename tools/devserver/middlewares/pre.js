/**
 * The shared middleware stack used in bot.stack-build.js 
 * (between statics and routers)
 *
 * **Warning**
 * -----------
 * Since express.js 4.0+ you can also use middleware per router, so DON'T put router specific ones here!
 *
 *
 * Possible shared middlewares
 * ---------------------------
 * gzip, favicon, logger, cookie, session, csrf, body-parser[urlencoded, json], method-override, multiparty...
 * 
 *
 * @author Tim Lauv
 * @created 2014.05.30
 */

var express = require('express'),
_ = require('underscore'),
colors = require('colors'),
morgan = require('morgan'),
bodyParser = require('body-parser'),
busboy = require('connect-busboy'),
session = require('express-session'),
cors = require('cors'),
fs = require('fs-extra');

module.exports = function(server){

	var profile = server.get('profile');

	return function(server){
		
		if(profile.crossdomain){
			server.use(cors());
			console.log('[CORS: enabled]'.yellow);
		}
		server.use(morgan('short')); //logging
		server.use(bodyParser.urlencoded({extended: true}));
		server.use(bodyParser.json());
		server.use(busboy({limits:{fileSize: profile.upload.size * 1024 * 1024}})); //multipart form & file upload
		server.use(session(profile.session || {secret: 'unknown...'}));

		//fix web root(s)' path(s)
		_.each(profile.clients, function(filePath, uriName){
			if(_.isArray(filePath)){
				while(filePath.length && !fs.existsSync(server.resolve(filePath[0])))
					filePath.shift();
				filePath = filePath[0];
			}
			if(filePath)
				profile.clients[uriName] = server.resolve(filePath);
			else
				delete profile.clients[uriName];
		});
		//mount web roots (static)
		_.each(profile.clients, function(filePath, uriName){
			server.use(uriName, express.static(profile.clients[uriName]));
			console.log('[www root]', uriName.yellow, '[', profile.clients[uriName], ']');
		});
		
		//respond content as file through ?asfile=[local filename]
		server.use(server.middlewares.unit.replyAsFile());

		//server sent event
		server.use(server.middlewares.unit.sse());
		
		//+server.use(server.middlewares.unit.your-middleware-factory())
		//...

	};

};