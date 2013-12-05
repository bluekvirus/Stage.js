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


