/**
 * The User collection data record schema using Joi (depends on a specific db middleware)
 *
 * How to define
 * -------------
 * server.model(this, {schema}); //use Joi to define your schema
 *
 * Events
 * ------
 * 'read' (in list, read)
 * 'validate' (in create, update, before model.validate)
 * 'pre-save' (in create, update, after model.validate)
 * 'post-save' (in create, update)
 * 'pre-delete' (in delete)
 * 'post-delete' (in delete)
 *
 * Used in
 * -------
 * routers.user
 * 
 * @author Tim Liu
 * @created 2013.10.30
 */

var joi = require('joi');

module.exports = function(server){

	//1. check & create superadmin if profile.auth is enabled
	
	//2. definition:
	var m = server.model(this, joi.object().keys({

		username: joi.string().alphanum().min(3).max(36).required(),
		password: joi.string().min(6).max(36), //will be hashed by salt later
		email: joi.string().email(), //for account activation, retrieval.
		suspended: joi.boolean().default(false),
		//profile: -- additional info about this user [optional child schema]
		//------------------------------------------------------------
		//salt: -- auto-generated in routers.user to hash the password
		//------------------------------------------------------------
		userspace: joi.string().valid('user', 'admin').default('user'),
		//space: -- record space, imposed upon record saving
		//------------------------------------------------------------
		//roles: -- role names, all roles (api-tokens) combined together = user api permission
		//------------------------------------------------------------
		
		//last_logon: timestamp
		//created_at: timestamp
		//updated_at: timestamp
		

	}).with('username', 'password'));

	return m;

};