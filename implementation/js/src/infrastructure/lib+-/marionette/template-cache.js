;(function(app){

	//1 Override the default raw-template retrieving method
	//We allow both #id or @*.html(remote) and template html string(or string array) as parameter.
	Backbone.Marionette.TemplateCache.prototype.loadTemplate = function(idOrTplString){
		if(_.string.startsWith(idOrTplString, '#')) return $(idOrTplString).html();
		if(_.string.startsWith(idOrTplString, '@')) {
			//search the local templates cache:
			var tpl = app.Util.Tpl.get(idOrTplString.substr(1));
			if(tpl) return tpl;
			//fetch from remote:
			app.remote({
				url: app.config.viewTemplates + '/' + idOrTplString.substr(1),
				async: false
			}).done(function(remoteTpl){
				tpl = remoteTpl;
			}).error(function(){
				tpl = false;
			});
			if(tpl)
				return app.Util.Tpl.build(idOrTplString.substr(1), tpl).string;
			throw new Error('DEV::View Template::Can not load template...' + idOrTplString + ', re-check your app.config.viewTemplates setting');

		}
		if(_.isArray(idOrTplString)) return idOrTplString.join('');
		return idOrTplString; //this can NOT be null or empty since Marionette.Render guards it so don't need to use idOrTplString || ' ';
	};

	//2 Override to use Handlebars templating engine with Backbone.Marionette
	Backbone.Marionette.TemplateCache.prototype.compileTemplate = function(rawTemplate) {
	  return Handlebars.compile(rawTemplate);
	};

})(Application);
