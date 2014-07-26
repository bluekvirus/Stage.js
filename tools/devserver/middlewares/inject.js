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

var cors = require('cors');

module.exports = function(server){

	var profile = server.get('profile');

	return function(server){

		if(profile.crossdomain){
			server.use(cors());
			console.log('[CORS: enabled]'.yellow);
		}
		
		//server.use...
		//server.use...

	};

};