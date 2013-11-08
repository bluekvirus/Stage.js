/**
 * =========================
 * RESTful data interfacing:
 * [Backbone] req/res trans
 *
 * $.ajaxPrefilter()
 * $.ajaxSetup()
 * $.ajaxTransport()
 *
 * For instrumenting a global behavior on the ajax calls according to app.config
 * e.g:
 * 1. base uri is ?q=/.../... instead of /.../... directly
 * 2. crossdomain ajax support
 *
 * 
 * @author Tim.Liu
 * @created 2013.04.01
 * @updated 2013.11.08
 * =========================
 */
;(function(){

	$.ajaxPrefilter('json', function(options){

		//base uri:
		var baseURI = Application.config.baseURI;
		if(baseURI){
			options.url = baseURI + options.url;
		}

		//crossdomain:
		var crossdomain = Application.config.crossdomain;
		if(crossdomain.enabled){
			options.url = (crossdomain.protocol || 'http') + '://' + (crossdomain.host || 'localhost') + ((crossdomain.port && (':'+crossdomain.port)) || '') + (/^\//.test(options.url)?options.url:('/'+options.url));
			options.crossDomain = true;
			options.xhrFields = _.extend(options.xhrFields || {}, {
				withCredentials: true //persists session cookies.
			});
		}

		//cache:[for IE]
		options.cache = false;

	});

})();