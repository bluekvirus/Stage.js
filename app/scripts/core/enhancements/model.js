/**
 * This is the Backbone.Model enhancements.
 *
 * 1. +bindToEntity/getEntityName to hookup with Application.API through Backbone.sync override (core/env.js)
 *
 * @author Tim.Liu
 * @created 2013.12.12
 */

_.extend(Backbone.Model.prototype, {

	//Support Backbone.sync overriden code
	getEntityName: function(){
		return this._entity;
	},

	bindToEntity: function(entity){
		if(!this.getEntityName())
			this._entity = entity;
		else
			throw new Error('DEV::Enhancement.Collection::You have already bound this model to entity ' + this.getEntityName());
		return this;
	}

});