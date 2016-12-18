/**
 * Custom middleware script for api to respond content as file, expressjs 4.0+
 *
 * Use ?asfile=[local filename] to trigger this middleware.
 *
 * @author Tim Lauv
 * @created 2016.12.14
 */

module.exports = function(server){

	var profile = server.get('profile');

	return function(options){

		//prepare your middleware according to options

		return function(req, res, next){

			if(req.query.asfile)
				res.set('Content-Disposition', 'attachment; filename="' + (req.query.asfile || 'noname.any') + '"');

			next();

		};

	};

};