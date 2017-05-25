/**
 * This is the template builder util, making it easier to load/create new templates for View objects.
 * (used by M.TemplateCache* in template-cache.js)
 *
 * Note: use build() for local templates and remote() for remote ones, both will affect template caches.
 *
 * Usage (name as id)
 * -----
 * app.Util.Tpl.build(name, [</>, </>, ...]) / ([</>, </>, ...]) / ('</></>...</>')
 * app.Util.Tpl.remote(url, sync) - default on using app.config.viewTemplates as base before url, use '/' as start to skip
 *
 * @author Tim Lauv
 * @create 2013.12.20
 * @updated 2014.10.25
 * @updated 2016.03.24
 * @updated 2017.05.25
 */

;(function(app){

	var namefix = /[\.\/]/;
	var Template = {

		Cache: Backbone.Marionette.TemplateCache,
		//Caveat: use .has() instead to check on availability since this is a getOrMake() instead of a pure get();
		get: function(){
			return this.Cache.get.apply(this.Cache, arguments);
		},
		has: function(templateId){
			return this.Cache.templateCaches[templateId]? true : false;
		},
		clear: function(){
			return this.Cache.clear.apply(this.Cache, arguments);
		},

		//build a template from string or string array (view-less), cache if got name, used by Cache.loadTemplate().
		build: function (name, tplStrings){
			if(!tplStrings){
				tplStrings = name;
				name = undefined;
			}
			var tpl = _.isArray(tplStrings) ? tplStrings.join('') : tplStrings;

			//only caching named template
			if(name)
				this.Cache.make(name, tpl);
			
			return tpl;
		},

		//load all prepared/combined templates from server (*.json without CORS, like all.json)
		//or
		//load individual tpl
		//
		//all loaded tpl will be stored in cache (app.Util.Tpl.Cache.templateCaches)
		remote: function(name, sync){
			var that = this;
			if(!name) throw new Error('DEV::Util.Tpl::remote() your template name can NOT be empty!');

			var originalName = name;
			if(_.string.startsWith(name, '@'))
				name = name.slice(1);
			var base = app.config.viewTemplates;
			if(_.string.startsWith(name, '/')){
				name = name.slice(1);
				base = '.';
			}
			var url = base + '/' + name;
			if(_.string.endsWith(url, '.json')){
				//load all from preped .json
				return $.ajax({
					url: url,
					dataType: 'json', //force return data type.
					async: !sync
				}).done(function(tpls){
					_.each(tpls, function(t, n){
						Template.Cache.make(n, t || ' ');
					});
				});//.json can be empty or missing.
			}else {
				//individual tpl
				return $.ajax({
					url: url,
					dataType: 'html',
					async: !sync
				}).done(function(tpl){
					Template.Cache.make(originalName, tpl || ' ');
				}).fail(function(){
					throw new Error('DEV::Util.Tpl::remote() Can not load template...' + url + ', re-check your app.config.viewTemplates setting');
				});
			}
		}
	};

	app.Util.Tpl = Template;

})(Application);
