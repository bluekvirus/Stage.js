;(function(app){

	//1 Override the default raw-template retrieving method
	//We allow both #id or @*.html(remote) and template html string(or string array) as parameter.
	Backbone.Marionette.TemplateCache.prototype.loadTemplate = function(idOrTplString){
		//local tpl
		if(_.string.startsWith(idOrTplString, '#')) return $(idOrTplString).html();
		//remote tpl (with local stored map cache)
		if(_.string.startsWith(idOrTplString, '@')) {
			var name = idOrTplString.substr(1);
			//search the local templates cache:
			var tpl = app.Util.Tpl.remote.get(name);
			if(tpl) return tpl;
			//fetch from remote: (might need server-side CORS support)
			return app.Util.Tpl.remote.load(name);

		}
		//string and string array
		return app.Util.Tpl.build(idOrTplString);
		//this can NOT be null or empty since Marionette.Render guards it so don't need to use idOrTplString || ' ';
	};

	//2 Override to use Handlebars templating engine with Backbone.Marionette
	Backbone.Marionette.TemplateCache.prototype.compileTemplate = function(rawTemplate) {
	  return Handlebars.compile(rawTemplate);
	};

})(Application);
