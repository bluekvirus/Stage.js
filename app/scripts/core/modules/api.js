/**
 * This is the RESTful API core module to replace the old DataUnits.
 * We've re-designed the remote api interfacing in this API module for better application structure.
 *
 * Design
 * ------
 * We no longer use the Backbone.Model/Collection to handle remote data interfacing for us.
 * Backbone.Model/Collection are now only used when there is a need to render a View through data.
 * The RESTful API module will help populating the content of a passed-in Model/Collection instance.
 * We will trigger our own events on the Model/Collection instance once the data is prepared.
 * We still use the data reset/changed/removed/added events the Model/Collection provides.
 *
 * Register
 * --------
 * Application.API.register('Entity[.Category][.Method]', config);
 * 		- config: {
 * 			type: GET[/POST/UPDATE/DELETE]
 * 			url: string or function(namespace, options)
 * 		 	parse: string key, array of keys or function(response, options), - return nothing instead of data to take over the data storage process inside parse()
 *     		[optional] fn: (namespace, data, params, options) - note that params is an object, call $.param() to encode it into url query.
 * 		}
 * 		Note that registering an api without config.fn will indicate using a standard (pre-defined) method structure;
 * 		If you want the full power of method customization, use the fn option when register.
 * 		
 * Usage
 * -----
 * Application.API.call('Entity.Category.Method', data, params, options);
 * 		- Entity: the remote data entity name, like User;
 *   	- Category: the operation category, e.g data/file/logic...;
 *   	- Method: the method name, e.g create/update/read/delete/run/upload/download...;
 *   	- data: the data that need to be sent to server;
 *   	- param: the ?params in url; (this object will be converted to the encoded url counterpart by $.param(), note that $.param() will not accept empty param)
 *   	- options: {
 *   		$.ajax options
 *   		
 *   		- (these will be filled already, so don't bother passing them in)
 *   		url
 *   		type
 *   		data
 *   		contentType: application/json (this means that we will always send json formatted data to server)
 *   		processData: false
 *   		success
 *   		
 *   		+ (these will be supported like new options which in turn affect the prepared ajax options)
 *   		success: function(parsed data, model/collection, response) - optional customized cb, this will be called after parse in the prepared success callback;
 *   		or just
 *   		model: the model to save the result in; - will trigger a api:data:preped event
 *   		collection: the collection to save the result in; - will trigger a api:data:preped event
 *
 * 			Note that:
 * 			If your config.parse() didn't return data, this means you want to have total control over the data storage process; success will still be called but without data;
 * 			If you pass in a success callback when calling the api, it will be called in the end. (after parse, [after set model/collection data]);
 *
 * 			the reset of possible options are still supported (e.g async, dataType, timeout, error, notify...)
 *   	}
 *
 * Default Categories and Methods
 * ------------------------------
 * These are pre-implemented methods:
 * 		- data: create/update/read/delete
 * 		- file: upload/read/delete
 *
 * You can register the apis (url, http method type and how to parse(returned val))
 * or 
 * You can trigger the default api behaviour by using pre-defined Category.Method name with ANY Entity name
 *
 * Fallback Seq
 * ------------
 * Entity.Category.Method -> E.C -> E -> _Default_.C.M -> _Default_.C -> _Default_
 * This means you can register an api using E.C as namespace to deal with everything that is called using 'E.C.x'
 * Use Category for Method grouping purposes. Whenever you felt like using 'E.C.Group.M....' please refactor your design...
 *
 * Warning
 * -------
 * You can NOT override (url, http method type and how to parse(returned val)) upon calling the a certain api.
 *
 * Related
 * -------
 * This module serves as a data interfacing layer and provides implementation to the overriden Backbone.sync method under core/env.js, thus
 * 	- model (fetch, save, destroy) 
 * 	- collection (fetch) 
 * will be using the registered api config instead of the default Backbone one.
 *
 * Pagination Support
 * ------------------
 * The call() method will also take care of the pagination support for collections if they have pagination enabled.
 * 
 *
 * @author Tim.Liu
 * @created 2013.12.05
 */

;(function(app){

	var module = app.module('API');
	module.map = {};

	function lookup(namespace){
		//return the config registered - see Fallback Seq section in the above code comment.
		var spaces = namespace.split('.');
		if(spaces.length > 3 || spaces.length === 0) throw new Error('DEV::App.API::You can NOT resolve a namespace with no level or more than 3 levels!');

		var config = module.map[namespace];
		var noimp = false;
		while (!config || _.isEmpty(config)){
			spaces.pop();
			if(spaces.length === 0){
				if(!noimp){
					noimp = true;
					spaces = ['_Default_'].concat(namespace.split('.').slice(1));
					config = module.map[spaces.join('.')];
				}else
					throw new Error('DEV::App.API::You do not have a fallback call for this namespace ' + namespace);
			}else {
				config = module.map[spaces.join('.')];
			}
		}

		return config;
	}

	_.extend(module, {

		register: function(namespace, config){
			var spaces = namespace.split('.');
			if(spaces.length > 3 || spaces.length === 0) throw new Error('DEV::App.API::You can NOT register a namespace with no level or more than 3 levels!');
			module.map[namespace] = config;
		},

		registerAll: function(pack){
			function isConfig(obj){
				if(obj.type || obj.url || obj.parse || obj.fn)
					return true;
				return false;
			}

			_.each(pack, function(ePack, entity){
				if(isConfig(ePack)) module.register(entity, ePack);
				else
					_.each(ePack, function(cPack, category){
						if(isConfig(cPack)) module.register([entity, category].join('.'), cPack);
						else
							_.each(cPack, function(config, method){
								module.register([entity, category, method].join('.'), config);
							});
					});
			});
		},

		call: function(namespace, data, params, options){
			var config = lookup(namespace);
			if(_.isFunction(config.fn)){ //for total control take-over.
				return config.fn(namespace, data, params, options);
			}
			//1. prepare type, url(with params), data(with data in json), contentType, processData, success(using config.parse and options.success and options.model/collection) into ajax options
			if(config.parse){
				var parse;
				if(_.isString(config.parse)){
					parse = function(data){
						return data[config.parse];
					}
				}else if(_.isArray(config.parse)){
					parse = function(data){
						return _.pick(data, config.parse);
					}
				}else if(_.isFunction(config.parse)){
					parse = config.parse;
				}else {
					throw new Error('DEV::App.API::You must pass in a valid parse config (string, array of keys, function)!');
				}
			}
			var prepedOpt = {
				type: config.type || 'GET',
				url: _.isString(config.url)?config.url:config.url(namespace, options) + (params ? ('?' + $.param(params)) : ''),
				data: JSON.stringify(data),
				contentType: 'application/json',
				processData: false,
				success: function(response, status, jqXHR){
					//0. process the data:
					if(parse) data = parse(response, options);
					else data = response;

					//1. take care of the collection pagination setup
					if(options.collection && options.collection.pagination){
						var collection = options.collection;
		        		switch(collection.pagination.mode){
		        			case 'client':
				        		collection._cachedResponse = data || [];
				        		collection.totalRecords = collection._cachedResponse.length;
				        		var page = collection.currentPage || 1;
				        		data = data.slice((page-1) * collection.pagination.pageSize, page * collection.pagination.pageSize); 
				        		//return only one page of data if the collection is current set to paginate in client mode.
				        	case 'server':
				        		if(response.total)
				        			collection.totalRecords = response.total;
				        		else
				        			collection.pagination.cache = true; //automatically switch to infinite mode.
				        			//Note that, in cached server mode (e.g like 'infinity', we don't use this totalRecord at all, so the server doesn't have to return it)				        	
						        break;
		        		}						
					}

					//2. set data into model/collection (model will always have higher priority over collection)
					var target = options.model || options.collection;
					if(target && data) target.set(data, options);

					//3. call the program supplied success callback 
					if(options.success){
						options.success(data, target, response);
					}
				}
			};
			//2. extend options with prep-ed ajax options in 1;
			return $.ajax(_.extend({}, options, prepedOpt));
		}

	});

})(Application);