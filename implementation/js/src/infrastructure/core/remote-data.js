/*
 * This is the Remote data interfacing core module of this application framework.
 * (Replacing the old Data API module)
 *
 * options:
 * --------
 * a. url string
 * or 
 * b. object:
 *  1. + params(alias:querys) - object
 *  2. + payload - object (payload.id determines non GET call types)
 *  3. $.ajax options (without -data, -type, -processData, -contentType)
 *  	- headers - object (custom http headers)
 *  	- async - boolean
 *  	- success/error/complete - fn (you should be using .done/fail/always() after .remote())
 *
 *  Global CROSSDOMAIN Settings - *Deprecated*: set this in a per-request base or use server side proxy
 *  see MDN - https://developer.mozilla.org/en-US/docs/HTTP/Access_control_CORS
 *  If you ever need crossdomain in development, we recommend that you TURN OFF local server's auth layer/middleware. 
 *  To use crossdomain ajax, in any of your request, add this option:
 *  xdomain: {
 *  	protocol: '', //https or not? default: '' -> http
 *   	host: '127.0.0.1', 
 *   	port: '5000',
 *  } 
 *  Put additional headers for xdomain just in options.headers (same lvl as options.xdomain).
 *  Again, it is always better to use server side proxy/forwarding instead of client side x-domain.
 *
 * events:
 * -------
 * app:ajax - change global ajax options here
 * app:ajax-success - single progress
 * app:ajax-error - single progress
 * app:ajax-start - single progress
 * app:ajax-stop - single progress
 * app:ajax-active - overall
 * app:ajax-inactive - overall
 * app:remote-pre-get - fine grind op stub
 * app:remote-pre-change - fine grind op stub
 * 
 * @author Tim Lauv
 * @created 2014.03.24
 * @updated 2017.07.20
 */ 

;(function(app, _, $){

	var definition = app.module('Core.Remote');

	function fixOptions(options, restOpt){
		if(!options) throw new Error('DEV::Core.Remote::options empty, you need to pass in at least a url string');
		if(_.isString(options))
			options	= _.extend(restOpt || {}, { 
				url: options
			});

		//default options
		options = _.extend({
			timeout: app.config.timeout,
		}, options, restOpt || {}, {
			type: undefined,
			data: undefined,
			processData: false,
			contentType: 'application/json; charset=UTF-8', // req format
			//**Caveat**: we do NOT assume a json format response.---------------------------------------
			//dataType: 'json', //need 'application/json; charset=utf-8' in response Content-Type header.
			//-------------------------------------------------------------------------------------------
		});

		//fix url?query params (merge with alias querys, +payload.id as ?id=)
		options.params = _.extend(options.params || {}, options.querys);
		if(options.payload && options.payload.id) options.params.id = options.payload.id;
		options.url = app.uri(options.url).addSearch(options.params).toString();

		//app.config.baseAjaxURI
		if(app.config.baseAjaxURI)
			options.url = options.url.match(/^[\/\.]/)? options.url : [app.config.baseAjaxURI, options.url].join('/');	

		//crossdomain:
		var crossdomain = options.xdomain;
		if(crossdomain){
			options.url = (crossdomain.protocol || 'http') + '://' + (crossdomain.host || 'localhost') + ((crossdomain.port && (':'+crossdomain.port)) || '') + (/^\//.test(options.url)?options.url:('/'+options.url));
			options.crossDomain = true;
			options.xhrFields = _.extend(options.xhrFields || {}, {
				withCredentials: true //persists session cookies.
			});
			// Using another way of setting withCredentials flag to skip FF error in sycned CORS ajax - no cookies tho...:(
			// options.beforeSend = function(xhr) {
			// 	xhr.withCredentials = true;
			// };
		}

		//+ header: csrf token (standard: Django, for ajax calls to pass through since they already had same origin sandbox check in client browser) 
		//get csrftoken value from cookie and set to header. (don't forget to set for $.fileupload editor x2 as well)
		options.headers = options.headers || {};
		if(app.config.csrftoken && !options.headers[app.config.csrftoken.header])
			options.headers[app.config.csrftoken.header] = app.cookie.get(app.config.csrftoken.cookie) || 'NOTOKEN';

		//+ header: jwt token (standard: https://jwt.io/introduction)
		//honor app.config.jwttoken.value as is.
		if(app.config.jwttoken && !options.headers[app.config.jwttoken.header]){
			options.headers[app.config.jwttoken.header] = app.config.jwttoken.schema + ' ' + (app.config.jwttoken.value || 'NOTOKEN');
		}

		app.trigger('app:ajax', options);		
		return options;
	}

	_.extend(definition, {
		//MOCK check
		mock: function(options){
			//intercept by ?mock=true in app
			if(app.param('mock') !== 'true') return;

			var schema = app._mockSchema[options.url.split('?')[0]];
			if(schema){ //url lvl schemas
				schema = schema[options.type] || schema['*']; //http method lvl schema record
				return $.Deferred().resolve(app.mock(schema.schema, schema.provider));
			}
		},

		//GET
		get: function(options, restOpt){
			options = fixOptions(options, restOpt);
			options.type = 'GET';

			app.trigger('app:remote-pre-get', options);
			return this.mock(options) || $.ajax(options);
		},

		//POST(no payload.id)
		//PUT(payload = {id: , ...}
		//DELETE(payload = {id:})
		change: function(options, restOpt){
			options = fixOptions(options, restOpt);
			if(!options.payload) throw new Error('DEV::Core.Remote::payload empty, please use GET');

			if(options.payload.id && _.size(options.payload) === 1) options.type = 'DELETE';
			else {
				if(!_.isObject(options.payload)) options.payload = { payload: options.payload };
				if(!options.payload.id) options.type = 'POST';
				else options.type = 'PUT';
			}

			if(options.type !== 'DELETE'){
				//encode payload into json data
				options.data = JSON.stringify(options.payload);
			}

			app.trigger('app:remote-pre-change', options);
			return this.mock(options) || $.ajax(options);
		}

	});

	//Global jQuery ajax event mappings to app:ajax-* events.
	//swapped!
	$document.ajaxSend(function(e, jqXHR, ajaxOptions) {
		app.trigger('app:ajax-start', e, jqXHR, ajaxOptions);
	});
	//swapped!
	$document.ajaxComplete(function(e, jqXHR, ajaxOptions) {
		app.trigger('app:ajax-stop', e, jqXHR, ajaxOptions);
	});
	//same
	$document.ajaxSuccess(function(e, jqXHR, ajaxOptions, data){
		app.trigger('app:ajax-success', e, jqXHR, ajaxOptions, data);
	});
	//same
	$document.ajaxError(function(e, jqXHR, ajaxOptions, error){
		app.trigger('app:ajax-error', e, jqXHR, ajaxOptions, error);
	});
	//new name!
	$document.ajaxStart(function() {
		app.trigger('app:ajax-active');
	});
	//new name!
	$document.ajaxStop(function() {
		app.trigger('app:ajax-inactive');
	});


	

})(Application, _, jQuery);