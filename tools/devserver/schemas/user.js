/**
 * The User collection data record schema using Joi
 *
 * @author Tim Liu
 * @created 2014.10.30
 */

var joi = require('joi');

module.exports = function(server){

	console.log('[schema]', 'User'.yellow);

	return joi.object().keys({

		username: joi.string().alphanum().min(3).max(36).required(),
		password: joi.string().min(6).max(36), //will be hashed by salt later
		
		//salt: -- auto-generated in routers.user to hash the password
		//profile: -- [optional child schema]
		

	}).with('username', 'password');

}