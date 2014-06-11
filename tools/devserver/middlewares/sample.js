/**
 * Sample custom middleware script, expressjs 4.0+
 *
 * @author Tim.Liu
 * @created 2014.06.11
 */

module.exports = function(app){

	return function(req, res, next){

		//you customized code here, req.app for application
	
		next(); // or error out

	}

}