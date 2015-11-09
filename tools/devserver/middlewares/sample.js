/**
 * Sample custom middleware script, expressjs 4.0+
 *
 * @author Tim Lauv
 * @created 2014.06.11
 */

module.exports = function(server){

	var profile = server.get('profile');

	//1. setup something here upon middleware loading
	//e.g db/store connection, global server vars...


	//2.a return a factory function to further config your middleware; [suggested]
	//2.b skip this factory function and return the middleware directly; [optional, zero-configuration]
	return function(options){

		//prepare your middleware according to options

		return function(req, res, next){

			//you customized code here, req.app for application server
	
			next(); // or error out

		};

	};

};