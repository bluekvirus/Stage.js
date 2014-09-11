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
 * @author Tim.Liu
 * @created 2014.05.30
 */

var morgan = require('morgan'),
bodyParser = require('body-parser');

module.exports = function(server){

	var profile = server.get('profile');

	return function(server){

		//+server.use...
		//...
		server.use(morgan('short'));
		server.use(bodyParser.urlencoded({extended: true}));
		server.use(bodyParser.json());
		//+server.use...
		//server.use(server.middlewares.your-middleware-factory())
		//...

	};

};