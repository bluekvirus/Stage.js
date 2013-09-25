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

	//We no longer use Backbone.PageableCollection for pagination anymore.
	//We priorities model's collection url before a model's urlRoot
	Backbone.PageableCollection = Backbone.Collection;
	Backbone.Model = Backbone.Model.extend({
	    url: function() {
	      var base = _.result(this.collection, 'url') || _.result(this, 'urlRoot') || urlError();
	      if (this.isNew()) return base;
	      return base + (base.charAt(base.length - 1) === '/' ? '' : '/') + encodeURIComponent(this.id);
	    },
	});

})(window, Swag, Backbone, Handlebars);