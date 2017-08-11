/**
 * Optional utility for securing a router's apis using token based authorization (opinionized)
 * 
 * [Suggestion: you might also need csrf and bot blocking middlewares]
 *
 * System security levels:
 * ------------
 * 	| void (system) -- 3 (single)
 *  | superadmin -- 2 (single)
 *  | admin -- 1 (multiple)
 *  - - - - - - - - - - -
 *  | user -- 0 (multiple)
 *
 * [The Space Rule - object only sees data/doc on or below its level.]
 * 
 * user session format:
 * --------------------
 * {
 * 		username,
 * 		permissions, (tokens, honored in routes)
 * 		expire,
 * 		
 * 		[data] (everything else)
 * }
 *
 * data record fields: - (for supporting permission implementations)
 * -------------
 *  (besides data)
 * 	+owner (= created_by)
 *  +collaborator (+ updated_by)
 *  +subscriber
 *  +timestamps (= created_at, updated_at)
 *
 * overall (in User router)
 * --------
 * a. login (get session established);
 * b. api hit, access token check, extend session expire time (with exceptions);
 * c. logout (destroy session);
 * d. touch (check session info);
 *
 * 
 * @author Tim Lauv
 * @created 2013.10.25 (based on 0.13.x)
 * @updated 2015.10.06
 */

var path = require('path'),
_ = require('underscore');
_.str = require('underscore.string');

module.exports = function(server){

	var profile = server.get('profile');

	//by calling this, the router (entity) tokens will appear in the global access token map
	server.secure = function(router, interpretations){
		interpretations = interpretations || {}; //allow { 'token': fn(req){ return true/false; }, ...} customized checking.
		
		//give router a token checker to be used when defining the routes (apis)
		//e.g router.get('url..', router.token(...), function(req, res, next){...});
		router.token = function(/*token1, token2, ...*/){
			if(!profile.auth || !profile.auth.enabled) return function(req, res, next){next();};

			var tokens = _.toArray(arguments);
			return function(req, res, next){
				var permissions;
				//fetch permissions from req.token or req.session
				//fetch from token
				if(req.token){
					permissions = req.token.permissions;
				}
				//fetch from session
				else if(req.session && req.session.username){
					permissions = req.session.permissions;
				}
				//unauthenticated
				else{
					return res.status(401).json({msg: 'Unauthenticated'});
				}
				
				//check permissions scope
				//with permissions, check permission of the user
				if(permissions === 'all') return next();
				if(permissions === 'none' || !permissions || _.isEmpty(permissions)) return res.status(403).json({msg: 'Unauthorized'});

				var pass = true;
				if(_.isArray(permissions))
					permissions = _.object(permissions, permissions);
				for(var t in tokens){
					if(!permissions[tokens[t]]) {
						pass = false;
						break;
					}
					if(interpretations[tokens[t]] && !interpretations[tokens[t]](req)) {
						pass = false;
						break;
					}
				}
				if(pass) return next();
				return res.status(403).json({msg: 'Unauthorized'});
			};
		};
		//alias: router.permission()
		router.permission = router.token;

		return router;

	};
};