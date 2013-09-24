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
				idAttribute : '_id'
			}, options.backboneOpts && options.backboneOpts.model))
		};
		//2. define collection and data url
		var dataURL = ((app.config.apiBase && app.config.apiBase.data) || '/data') + '/' + name;
		if(!options.modelOnly){
			//general collection definition
			module.map[name].Collection = Backbone.Collection.extend(_.extend({
				model: module.map[name].Model,
				url: dataURL,
		        parse: function(response) {
		            return response.payload; //payload is the default server data field.
		        }
			}, options.backboneOpts && options.backboneOpts.collection));
		}else {
			module.map[name].Model = module.map[name].Model.extend({
				urlRoot: dataURL, //this is to ignore collection's url, since it doesn't belong to one.
		        //backbone.model.save will use this to merge server response back to model ??
		        //this behaviour is not even optional...We really don't want the model to have this pre-set behaviour...
		        parse: function(response) {
		            if (response.payload) {
		            	if (_.isArray(response.payload)) return response.payload[0];
		                return response.payload;
		            }
		            return response;
		        }
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