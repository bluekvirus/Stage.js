/**
 * This is the template builder/registry util, making it easier to create new templates for View objects.
 * (used by M.TemplateCache* in template-cache.js)
 *
 * Note: use build() for local templates and remote() for remote ones
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
 */

;(function(app){

	var namefix = /[\.\/]/;
	var Template = {

		//normalize the tpl names so they can be used as html tag ids.
		normalizeId: function(name){
			return String(name).split(namefix).join('-');
		},

		cache: Backbone.Marionette.TemplateCache,

		build: function (name, tplString){
			if(arguments.length === 1) {
				tplString = name;
				name = null;
			}
			var tpl = _.isArray(tplString)?tplString.join(''):tplString;

			if(name) {
				//process name to be valid id string, use String() to force type conversion before using .split()
				var id = this.normalizeId(name);
				var $tag = $('head > script[id="' + id + '"]');
				if($tag.length > 0) {
					//override
					$tag.html(tpl);
					this.cache.clear('#' + name);
					console.warn('DEV::Overriden::Template::', name);
				}
				else $('head').append(['<script type="text/tpl" id="', id, '">', tpl, '</script>'].join(''));
			}

			return tpl;
		},

		//load all prepared/combined templates from server (*.json without CORS)
		//or
		//load individual tpl
		//all loaded tpl will be stored in cache (app.Util.Tpl.cache.templateCaches)
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
						Template.cache.make(n, t);
					});
				});//.json can be empty or missing.
			}else {
				//individual tpl
				return $.ajax({
					url: url,
					dataType: 'html',
					async: !sync
				}).done(function(tpl){
					Template.cache.make(originalName, tpl);
				}).fail(function(){
					throw new Error('DEV::Util.Tpl::remote() Can not load template...' + url + ', re-check your app.config.viewTemplates setting');
				});
			}
		}
	};

	app.Util.Tpl = Template;

})(Application);
