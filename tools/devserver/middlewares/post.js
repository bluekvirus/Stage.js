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

var errorhandler = require('errorhandler'),
colors = require('colors'),
_ = require('underscore');

module.exports = function(server){

	var profile = server.get('profile');

	return function(server){

		//api (already in routes) -> json (xml, yaml, md) -> mock -> 404 fallback
		_.each(profile.clients, function(filePath, uriName){ 
			server.use(uriName, server.middlewares.unit.apiJsonMock404());
		});

		//overall error errorhandler
		if(profile.errorpage){
			server.use(errorhandler());
			console.log('[Error Page: enabled]'.yellow, 'use next(err) in routes and middlewares'.grey);
		}

		//+server.use(server.middlewares.unit.your-middleware-factory())
		//...

	};

};