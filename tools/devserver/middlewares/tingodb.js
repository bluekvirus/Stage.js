/**
 * Middleware that injects TingoDB ref to req
 *
 * @author Tim.Liu
 * @created 2014.09.03
 */

module.exports = function(server){

	var profile = server.get('profile');

	//call this function to return your middleware;
	return function(options){

		//prepare your middleware according to options

		return function(req, res, next){

			//you customized code here, req.app for application server
	
			next(); // or error out

		};

	};

};