/*
 * This is the Remote data interfacing core module of this application framework.
 * (Replacing the old Data API module)
 *
 * options:
 * --------
 * a. url string
 * or 
 * b. object:
 * 	1. + _entity[_id][_method] - string
 *  2. + params(alias:querys) - object
 *  3. + payload - object (payload._id overrides _id)
 *  4. $.ajax options (without -data, -type, -processData, -contentType)
 *
 *  Global CROSSDOMAIN Settings - *Deprecated*: set this in a per-request base or use server side proxy
 *  see MDN - https://developer.mozilla.org/en-US/docs/HTTP/Access_control_CORS
 *  If you ever need crossdomain in development, we recommend that you TURN OFF local server's auth layer/middleware. 
 *  To use crossdomain ajax, in any of your request, add this option:
 *  xdomain: {
 *  	protocol: '', //https or not? default: '' -> http
 *   	host: '127.0.0.1', 
 *   	port: '5000',
 *   	headers: {
 *   		'Credential': 'user:pwd'/'token',
 *   		...
 *  }
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
		_.extend(options, restOpt || {}, {
			type: undefined,
			data: undefined,
			processData: false,
			contentType: 'application/json; charset=UTF-8', // req format
			dataType: 'json', //res format
			timeout: app.config.timeout,
		});

		//process _entity[_id][_method] and strip off options.querys(alias:params)
		if(options.entity || options._entity){
			var entity = options.entity || options._entity;
			options.url = entity;
		}
		if(options.payload && options.payload._id){
			options._id = options.payload._id;
		}
		if(options._id || options._method){
			var url = app.uri(options.url);
			options.url = url.path(_.compact([url.path(), options._id, options._method]).join('/')).toString();
		}
		options.params = _.extend(options.params || {}, options.querys);
		if(options.params){
			options.url = (app.uri(options.url)).search(options.params).toString();
		}

		app.trigger('app:ajax', options);		
		return options;
	}

	_.extend(definition, {

		//GET
		get: function(options, restOpt){
			options = fixOptions(options, restOpt);
			options.type = 'GET';
			app.trigger('app:remote-pre-get', options);
			return $.ajax(options);
		},

		//POST(no payload._id)/PUT/DELETE(payload = {_id: ...})
		change: function(options, restOpt){
			options = fixOptions(options, restOpt);
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
			return $.ajax(options);
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


	//Global ajax fail handler (common)
	app.ajaxFailed = function(jqXHR, settings, e){
		throw new Error('DEV::Ajax::' + e + ' ' + settings.url);
	};

	//Ajax Options Fix: (baseAjaxURI, CORS and cache)
	app.onAjax = function(options){

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
			options.headers = _.extend(options.headers || {}, crossdomain.headers);
			// Using another way of setting withCredentials flag to skip FF error in sycned CORS ajax - no cookies tho...:(
			// options.beforeSend = function(xhr) {
			// 	xhr.withCredentials = true;
			// };
		}

		//cache:[disable it for IE only]
		if(Modernizr.ie)
			options.cache = false;
	
	};
	

})(Application, _, jQuery);