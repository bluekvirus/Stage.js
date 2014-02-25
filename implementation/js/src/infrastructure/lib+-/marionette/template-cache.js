//1 Override the default raw-template retrieving method
//We allow both #id and template html string(or string array) as parameter.
Backbone.Marionette.TemplateCache.prototype.loadTemplate = function(idOrTplString){
	if(_.string.startsWith(idOrTplString, '#')) return $(idOrTplString).html();
	if(_.isArray(idOrTplString)) return idOrTplString.join('');
	return idOrTplString || ' ';
};

//2 Override to use Handlebars templating engine with Backbone.Marionette
Backbone.Marionette.TemplateCache.prototype.compileTemplate = function(rawTemplate) {
  return Handlebars.compile(rawTemplate);
};