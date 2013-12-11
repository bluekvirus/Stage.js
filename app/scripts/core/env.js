/**
 * The Web Application Environment Setup
 *
 * @author Tim.Liu
 * @created 2013.04.01
 * @updated 2013.11.08
 */

/**
 * ================================
 * Global VARs Creation
 * ================================
 */

//0-1 Create the global Application var for modules to be registered on.
window.Application = new Backbone.Marionette.Application();

//0-2 Create the global Template var for views to easily define templates.
window.Template = window.Template || {};
window.Template.extend = function (name, tplStrArray){
	var tpl = tplStrArray.join('');
	$('head').append(['<script type="text/tpl" id="',name,'">',tpl,'</script>'].join(''));
}
window.Template.extend('_blank', [' ']); //blank sheet template.

/**
 * ================================
 * Application Config Loading
 * ================================
 */
$.ajax({
    url: 'scripts/config.js',
    dataType: 'script',
    async: false
});

/**
 * ================================
 * Lib Activation/Overriden (Global n Permanent)
 * ================================
 */

//1-1 Hook up additional Handlebars helpers.
Swag.registerHelpers();

//1-2 Override to use Handlebars templating engine with Backbone.Marionette
Backbone.Marionette.TemplateCache.prototype.compileTemplate = function(rawTemplate) {
  return Handlebars.compile(rawTemplate);
};

//1-3 Override Backbone.Sync
// Backbone.sync
// -------------

// Override this function to change the manner in which Backbone persists
// models to the server. You will be passed the type of request, and the
// model in question. By default, makes a RESTful Ajax request
// to the model's `url()`. Some possible customizations could be:
//
// * Use `setTimeout` to batch rapid-fire updates into a single request.
// * Send up the models as XML instead of JSON.
// * Persist models via WebSockets instead of Ajax.
//
// Turn on `Backbone.emulateHTTP` in order to send `PUT` and `DELETE` requests
// as `POST`, with a `_method` parameter containing the true HTTP method,
// as well as all requests with the body as `application/x-www-form-urlencoded`
// instead of `application/json` with the model in a param named `model`.
// Useful when interfacing with server-side languages like **PHP** that make
// it difficult to read the body of `PUT` requests.
  Backbone.sync = function(method, model, options) {

    // Default options, unless specified.
    _.defaults(options || (options = {}), {
      emulateHTTP: Backbone.emulateHTTP,
      emulateJSON: Backbone.emulateJSON
    });

    // For older servers, emulate JSON by encoding the request into an HTML-form.
    if (options.emulateJSON) {
      params.contentType = 'application/x-www-form-urlencoded';
      params.data = params.data ? {model: params.data} : {};
    }

    // For older servers, emulate HTTP by mimicking the HTTP method with `_method`
    // And an `X-HTTP-Method-Override` header.
    if (options.emulateHTTP && (type === 'PUT' || type === 'DELETE' || type === 'PATCH')) {
      params.type = 'POST';
      if (options.emulateJSON) params.data._method = type;
      var beforeSend = options.beforeSend;
      options.beforeSend = function(xhr) {
        xhr.setRequestHeader('X-HTTP-Method-Override', type);
        if (beforeSend) return beforeSend.apply(this, arguments);
      };
    }

    // Don't process data on a non-GET request.
    if (params.type !== 'GET' && !options.emulateJSON) {
      params.processData = false;
    }

    // If we're sending a `PATCH` request, and we're in an old Internet Explorer
    // that still has ActiveX enabled by default, override jQuery to use that
    // for XHR instead. Remove this line when jQuery supports `PATCH` on IE8.
	var noXhrPatch =
		typeof window !== 'undefined' && !!window.ActiveXObject &&
	  		!(window.XMLHttpRequest && (new XMLHttpRequest).dispatchEvent);
	  		
    if (params.type === 'PATCH' && noXhrPatch) {
      params.xhr = function() {
        return new ActiveXObject("Microsoft.XMLHTTP");
      };
    }

    // Make the request, allowing the user to override any Ajax options.
    var xhr = options.xhr = Backbone.ajax(_.extend(params, options));
    model.trigger('request', model, xhr, options);
    return xhr;
  };


