/**
 * This is the Data object registry.
 *
 * ======
 * Design
 * ======
 * We need this module to automatically create our models (with or without collections) by giving it just a name. (e.g Blog)
 * We also want to refer to our models and collections by their names. (to use and to extend...)
 * Use without init will cause the model/collection to be created using our application defaults. (apiBase config in env.js involved.)
 * A partial/total override can happen through the .extend or = (direct assignment) operation, tho total override is NOT recommended.
 * 
 * ======
 * Usage
 * ======
 * app.DataUnits.init([...]) or ('...single name...', options)
 * 		- options: {
 * 			modelOnly: false - only create model for given name(s).
 * 			backboneOpts: {
 * 				model: {},
 * 				collection: {}
 * 			} - for models and collections creation using pre-set options. see lib [Backbone.js, Backbone.Paginator.js]
 * 		}
 * app.DataUnits.get('...data object name...').Model or .Collection (as designed, it will also infer a hidden creation using app config defaults)
 *
 * ===============
 * As a Dependency
 * ===============
 * It is used as a base for the Admin layer to have validation, schema(form), columns(datagrid) hooked up with each model definitions.
 *
 *
 * @author Tim.Liu
 * @created 2013.09.14
 */

;(function(app, Backbone, _){

	var module = app.module('DataUnits');
	module.map = {};

	function create(name, options){
		options = options || {};
		//1. define model
		module.map[name] = {
			//general model definition
			Model: Backbone.Model.extend(_.extend({
				name: name, //this is our extention
				idAttribute : '_id',
		        //**EXTREMELY IMPORTANT**
		        //backbone.model.save (thus backbone.collection.create) will use this to merge server response back to the model! SO YOU MUST SET THIS ONE !!
		        //this behaviour is not even optional...We really don't want the model to have this pre-set behaviour...
		        parse: function(response) {
		            if (response.payload) {
		            	if (_.isArray(response.payload)) return response.payload[0];
		                return response.payload;
		            }
		            return response;
		        }				
			}, options.backboneOpts && options.backboneOpts.model))
		};
		//2. define collection and data url
		var dataURL = ((app.config.apiBase && app.config.apiBase.data) || '/data') + '/' + name;
		if(!options.modelOnly){
			//general collection definition
			module.map[name].Collection = Backbone.Collection.extend(_.extend({
				model: module.map[name].Model,
				url: dataURL,
				initialize: function(options){
					this.enablePagination(); //see - infrustructure/base-lib-fix.js
				},
		        parse: function(response) {
		        	if(this.pagination && this.pagination.mode === 'client'){
		        		this._cachedResponse = response.payload || [];
		        		this.totalRecords = this._cachedResponse.length;
		        		var page = this.currentPage || 1;
		        		return this._cachedResponse.slice((page-1) * this.pagination.pageSize, page * this.pagination.pageSize); //return only one page of data.
		        	}
		        	this.totalRecords = response.total; //in cached server mode (e.g like 'infinity', we don't use this totalRecord at all, so the server doesn't have to return it)
		            return response.payload; //payload is the default server data field.
		        }
			}, options.backboneOpts && options.backboneOpts.collection));
		}else {
			module.map[name].Model = module.map[name].Model.extend({
				urlRoot: dataURL, //this is to ignore collection's url, since it doesn't belong to one.
	    	});
		}

		return module.map[name];
	}

	module.init = function(names, options){
		names = _.isArray(names)?names : [names];
		_.each(names, function(name){
			create(name, options);
		});
	}

	module.get = function(name){
		var target = module.map[name];
		if(target) return target;
		return create(name);
	}

})(Application, Backbone, _);