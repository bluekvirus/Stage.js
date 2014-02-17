//1-2 Override to use Handlebars templating engine with Backbone.Marionette
Backbone.Marionette.TemplateCache.prototype.compileTemplate = function(rawTemplate) {
  return Handlebars.compile(rawTemplate);
};