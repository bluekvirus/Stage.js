/**
 * The Role collection data record schema using Joi
 *
 * Used in
 * -------
 * routers.role
 *
 * @author Tim Liu
 * @created 2014.10.30
 */

var joi = require('joi');

module.exports = function(server){

	console.log('[schema]', 'Role'.yellow);

	return joi.object().keys({

		name: joi.string().min(3).max(36).required(),
		'api-token-map': joi.object().pattern(/.*/, joi.boolean()).unknown(true)

	}).with('name', 'api-token-map');
};