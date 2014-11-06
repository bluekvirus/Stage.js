/**
 * Utility function for creating model with validation schema and accepts events.
 *
 * @author Tim Liu
 * @created 2014.11.05
 */

var EventEmitter = require('events').EventEmitter,
util = require('util'),
_ = require('underscore');
_.str = require('underscore.string');

module.exports = function(server){

	server.model = function(modelFile, schema){

		console.log('[model]', _.str.classify(modelFile.name).yellow);

		var M = function(schema){
			this.schema = schema;
			EventEmitter.call(this);
			if(this.schema) this.validate = this.schema.validate;
			else this.validate = function(vals){return {value: vals}};
		}

		util.inherits(M, EventEmitter);
		return new M(schema);
	}

}