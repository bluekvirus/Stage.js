/**
 * This is the Remote data interfacing core module of this application framework.
 * (Replacing the old Data API module)
 *
 * options:
 * --------
 * a. url string
 * or 
 * b. object:
 * 	1. + entity[_id][_method] - string
 *  2. + params(alias:querys) - object
 *  3. + payload - object (payload._id overrides _id)
 *  4. $.ajax options (without -data, -type, -processData, -contentType)
 *
 * events:
 * -------
 * app:ajax - change global ajax options here
 * app:success - notify
 * app:error - notify
 * app:ajax-start - progress
 * app:ajax-stop - progress
 * app:remote-pre-get - fine grind op stub
 * app:remote-pre-change - fine grind op stub
 * 
 * @author Tim.Liu
 * @created 2014.03.24
 */

;(function(app, _, $){

	var definition = app.module('Core.Remote');

	function fixOptions(options){
		if(!options) throw new Error('DEV::Core.Remote::options empty, you need to pass in at least a url string');
		if(_.isString(options)) 
			options	= { 
				url: options,
				type: 'GET'
			};
		else {
			//default options
			_.extend(options, {
				type: undefined,
				data: undefined,
				processData: false,
				contentType: 'application/json; charset=UTF-8'
			});
			//process entity[_id] and strip off options.querys(alias:params)
			if(options.entity){
				var entity = options.entity;
				options.url = entity;
			}
			if(options.payload && options.payload._id){
				if(options._id) console.warn('DEV::Core.Remote::options.payload._id', options.payload._id,'overriding options._id', options._id);
				options._id = options.payload._id;
			}
			if(options._id || options._method){
				var url = new URI(options.url);
				options.url = url.path(_.compact([url.path(), options._id, options._method]).join('/')).toString();
			}
			options.params = options.querys || options.params;
			if(options.params){
				options.url = (new URI(options.url)).search(options.params).toString();
			}
		}
		app.trigger('app:ajax', options);		
		return options;
	}

	function notify(jqXHR){
		jqXHR
		.done(function(data, textStatus, jqXHR){
			app.trigger('app:success', {
				data: data, 
				textStatus: textStatus,
				jqXHR: jqXHR,
			});
		})
		.fail(function(jqXHR, textStatus, errorThrown){
			app.trigger('app:error', {
				errorThrown: errorThrown,
				textStatus: textStatus,
				jqXHR: jqXHR
			});
		});
		return jqXHR;
	}

	_.extend(definition, {

		//GET
		get: function(options){
			options = fixOptions(options);
			options.type = 'GET';
			app.trigger('app:remote-pre-get', options);
			return notify($.ajax(options));
		},

		//POST(no payload._id)/PUT/DELETE(payload = {_id: ...})
		change: function(options){
			options = fixOptions(options);
			if(!options.payload) throw new Error('DEV::Core.Remote::payload empty, please use GET');
			if(options.payload._id && _.size(options.payload) === 1) options.type = 'DELETE';
			else {
				if(!_.isObject(options.payload)) options.payload = { payload: options.payload };
				if(!options.payload._id) options.type = 'POST';
				else options.type = 'PUT';
			}

			if(options.type !== 'DELETE'){
				//encode payload into json data
				options.data = JSON.stringify(options.payload);
			}

			app.trigger('app:remote-pre-change', options);
			return notify($.ajax(options));
		}

	});

	//Global ajax event triggers
	$document.ajaxStart(function() {
		app.trigger('app:ajax-start');
	});
	$document.ajaxStop(function() {
		app.trigger('app:ajax-stop');
	});
	

})(Application, _, jQuery);