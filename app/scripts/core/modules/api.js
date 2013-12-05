/**
 * This is the RESTful API core module to replace the old DataUnits.
 * We've re-designed the remote api interfacing in this API module for better application structure.
 *
 * Design
 * ------
 * We no longer use the Backbone.Model/Collection to handle remote data interfacing for us.
 * Backbone.Model/Collection are now only used when there is a need to render a View through data.
 * The RESTful API module will help populating the content of a passed in Model/Collection instance.
 * We will trigger our own events on the Model/Collection instance once the data is prepared.
 * We still use the data reset/changed/removed/added events the Model/Collection provides.
 *
 * Register
 * --------
 * Application.API.register('Entity[.Category][.Method]', options);
 * 		- options: {
 * 			type: POST/GET/UPDATE/DELETE
 * 			url: string or function(http_type, data, params)
 * 		 	parse: string key, array of key or function(response [,[model], [collection]])	
 * 		}
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
 *   		- (these will be filled already)
 *   		url
 *   		type
 *   		data
 *   		contentType
 *   		processData
 *   		success
 *   		
 *   		+ (these will be supported like new options which in turn affect the prepared ajax options)
 *   		success: function(result) - this will be called after parse in the prepared success callback;
 *   		model: the model to save the result in;
 *   		collection: the collection to save the result in;
 *
 * 			the reset of possible options are still supported (e.g type: 'POST', notify: true)
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
 * E.C.M -> E.C -> E -> _Default_
 * This means you can register an api using E.C as namespace to deal with everything that is called using 'E.C.x'
 * Use Category for Method grouping purposes. Whenever you felt like using 'E.C.Group.M....' please refactor your design...
 *
 * Warning
 * -------
 * You can NOT override (url, http method type and how to parse(returned val)) upon calling the api call. You must code the variations into the url function upon registeration;
 *
 *
 * @author Tim.Liu
 * @created 2013.12.05
 */