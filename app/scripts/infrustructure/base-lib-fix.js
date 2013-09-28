/**
 * ==========================
 * Base Libs Warmup & Hacks
 * ==========================
 *
 * @author Tim.Liu
 * @create 2013.09.11
 */
;(function(window, Swag, Backbone, Handlebars){

	//Hook up additional Handlebars helpers.
	Swag.registerHelpers();

	//Override to use Handlebars templating engine with Backbone.Marionette
	Backbone.Marionette.TemplateCache.prototype.compileTemplate = function(rawTemplate) {
	  return Handlebars.compile(rawTemplate);
	};


})(window, Swag, Backbone, Handlebars);