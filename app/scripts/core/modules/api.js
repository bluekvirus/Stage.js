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
 * 			url: string or function(namespace, data, params, options)
 * 		 	parse: string key, array of keys or function(response),
 *     		[optional] fn: (namespace, data, params, options)
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
 *   	- param: the ?params in url; (this object will be converted to the encoded url counterpart by $.param())
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
 *   		success: function(result or model/collection) - optional customized cb, this will be called after parse in the prepared success callback;
 *   		or just
 *   		model: the model to save the result in; - will trigger a api:data:preped event
 *   		collection: the collection to save the result in; - will trigger a api:data:preped event
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

		call: function(namespace, data, params, options){
			var config = lookup(namespace);
			//1. prepare type, url(with params), data(with data in json), contentType, processData, success(using config.parse and options.success and config.model/collection) into ajax options
			var prepedOpt = {
				type: config.type,
				url: _.isString(config.url)?(config.url + '?' + $.param(params)):config.url(namespace, data, params, options),
				data: JSON.stringify(data),
				contentType: 'application/json',
				processData: false,
				success: function(data, status, jqXHR){
					//TBI
				}
			};
			//2. extend options with prep-ed ajax options in 1;
		}

	});

})(Application);