/**
 * Optional utility for securing a router's apis using token based authorization (opinionized)
 * 
 * [Suggestion: you might also need csrf and bot blocking middlewares]
 *
 * user spaces: (supported)
 * ------------
 * 	| void (system) -- 3 (single)
 *  | superadmin -- 2 (single)
 *  | admin -- 1 (multiple)
 *  - - - - - - - - - - -
 *  | user -- 0 (multiple)
 *
 * [The Space Rule - object only sees data/doc on or below its level.] - (not implemented)
 * 
 * user session format: (supported)
 * --------------------
 * {
 * 		username,
 * 		userspace, -- (string)
 * 		api-token-map,
 * 		expire/refresh,
 * 		
 * 		data (everything else)
 * }
 *
 * mutex rules: (when userspace === 'user' under the same api token) - (not implemented)
 * ------
 * user level mutex 1: (simple version: owner and others)
 * private - owner only
 * public - others can see, owner can modify
 *
 * user level mutex 2: (complicated: owner, others, collaborators, subscribers)
 * ... (omitted)
 *
 * api tokens (supported)
 * -----------
 * possible tokens:
 * create -> record +owner, +(userspace or userspace - 1) => space
 * list/read -> userspace >(=) record space, consult mutex
 * modify -> update/delete, consult mutex, 
 * comment -> ...
 * execute -> ...
 * ...
 *
 * entity-record - (not implemented)
 * -------------
 *  (besides data)
 * 	+owner
 *  +collaborator
 *  +subscriber/watcher
 *  +space -- the record space (number)
 *  +timestamps
 *
 * overall
 * --------
 * user (api-token-map + userspace) + entity-record ([mutex rules] + space) = authorization
 * 4 important bits in this design
 * a. login (get session established);
 * b. api hit, access token check;
 * c. query, space (user) - space (record) (space rule apply to all spaces)
 * d. query or post-query, mutex rules (user space only)
 *
 * warning:
 * --------
 * Only api-token checker and userspace is implemented. We will set `req.mutex = true` for you to indicate that mutex is required.
 * The ACTUAL mutex enforcing mech needs to be implemented in the api route by you. (e.g mutex(record, req.session))
 * 
 * @author Tim Liu
 * @created 2013.10.25 (based on 0.13.x)
 */

var express = require('express'),
path = require('path'),
_ = require('underscore');
_.str = require('underscore.string');

module.exports = function(server){

	var apiTokenMap = server.set('api-token-map', {}).get('api-token-map'),
	profile = server.get('profile');

	//by calling this, the router (entity) tokens will appear in the global access token map
	server.secure = function(router /*, and token1, token2, ...*/){
		
		apiTokenMap[router.meta.entity] = apiTokenMap[router.meta.entity] || {};
		var atm = apiTokenMap[router.meta.entity];

		var tokens = _.toArray(arguments).slice(1).concat(['create', 'list', 'read', 'modify']);
		_.each(tokens, function(t){
			atm[t] = false;
		});

		//give router a token checker to be used when defining the routes (apis)
		//e.g router.get('url..', router.token(...), function(req, res, next){...});
		router.token = function(/*token1, token2, ...*/){
			if(!profile.auth || !profile.auth.enabled) return function(req, res, next){next();};

			var tokens = _.toArray(arguments);
			return function(req, res, next){
				if(req.session && req.session.username){
					if(req.session.userspace === 'superadmin') return next();
					//within the user & admin space, check api-access-token first
					var pass = true;
					var map = req.session['api-token-map'] && req.session['api-token-map'][router.meta.entity];
					if(map){
						for(var t in tokens){
							if(!map[tokens[t]]) {
								pass = false;
								break;
							}
						}
				    }else
				    	pass = false;
					if(pass) {
						if(req.session.userspace === 'user') req.mutex = true;
						return next();
					/////////////////////////////////////////////////////////////////////
					//Don't forget to apply the space, mutex rule(s) in the guarded api//
					/////////////////////////////////////////////////////////////////////
					}
					return res.status(403).json({error: 'Authorization'}); 
				}else {
					return res.status(401).json({error: 'Authentication'});
				}
			};
		};

		return router;

	};
};