/**
 * This is the template builder/registry util, making it easier to create new templates for View objects.
 *
 * Note: use build() for local templates and remote() for remote ones
 *
 * Usage (name as id)
 * -----
 * app.Util.Tpl.build(name, [</>, </>, ...]) / ([</>, </>, ...]) / ('</></>...</>')
 * app.Util.Tpl.remote(name, base) - default on using app.config.viewTemplates as base
 *
 * @author Tim Lauv
 * @create 2013.12.20
 * @updated 2014.10.25
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
			//if(arguments.length === 0 || _.string.trim(name) === '') return {id:'#_blank', tpl: ' '};
			if(arguments.length === 1) {
				//if(_.string.startsWith(name, '#')) return {id: name};
				tplString = name;
				name = null;
				//name = _.uniqueId('tpl-gen-');
				//if(!_.isArray(tplString)) tplString = [tplString];
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
		//load individual tpl into (Note: that tplName can be name or path to html) 
		remote: function(name, base){
			var that = this;
			if(_.string.startsWith(name, '@'))
				name = name.substr(1);
			if(!name) throw new Error('DEV::Util.Tpl::remote() your template name can NOT be empty!');

			var url = (base || app.config.viewTemplates) + '/' + name;
			var result = '';
			if(_.string.endsWith(name, '.json')){
				//load all from preped .json
				
				$.ajax({
					url: url,
					dataType: 'json', //force return data type.
					async: false
				}).done(function(tpls){
					result = tpls;
					_.each(result, function(t, n){
						Template.cache.make(n, t);
					});
				});//.json can be empty or missing.
				return result;
			}else {
				//individual tpl
				$.ajax({
					url: url,
					dataType: 'html',
					async: false
				}).done(function(tpl){
					result = tpl;
					Template.cache.make(name, tpl);
				}).fail(function(){
					throw new Error('DEV::Util.Tpl::remote() Can not load template...' + url + ', re-check your app.config.viewTemplates setting');
				});
				return result;
			}
		}

	};

	app.Util.Tpl = Template;

})(Application);
