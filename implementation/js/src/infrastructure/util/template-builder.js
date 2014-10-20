/**
 * This is the template builder/registry util, making it easier to create new templates for View objects.
 *
 * Usage (name as id)
 * -----
 * app.Util.Tpl.build (name, [</>, </>, ...]) / ([</>, </>, ...]) / ('</></>...</>') / () or (#id)
 *
 * @author Tim.Liu
 * @create 2013.12.20
 */

;(function(app){

	var map = {};
	var namefix = /[\.\/]/;
	var Template = {

		//Note that 'name' can be 'name' or 'path to .html'
		build: function (name, tplString, override){
			if(arguments.length === 0 || _.string.trim(name) === '') return {id:'#_blank', tpl: ' '};
			if(arguments.length === 1) {
				if(_.string.startsWith(name, '#')) return {id: name};
				tplString = name;
				name = _.uniqueId('tpl-gen-');
				if(!_.isArray(tplString))	tplString = [tplString];
			}

			//process name to be valid id string, use String() to force type conversion before using .split()
			name = String(name).split(namefix).join('-');

			if(map[name] && !override) throw new Error('DEV::APP.Util.Template::Conflict! You have already named a template with id:' + name);
			if(!map[name]) override = false;

			var tpl = _.isArray(tplString)?tplString.join(''):tplString;
			if(override){
				$('head > script[id="' + name + '"]').html(tpl);
				Backbone.Marionette.TemplateCache.clear();//!important (clear all yes, since individual tpl id used by TemplateCache is not 'name')
			} else
				$('head').append(['<script type="text/tpl" id="',name,'">',tpl,'</script>'].join(''));
			map[name] = true;
			return {
				id: '#' + name,
				string: tpl
			};
		},

		get: function(name){
			if(!name) return false;
			//process name to be valid id string
			name = String(name).split(namefix).join('-');

			//this is only called for each View def once
			if(map[name]) return $('head').find('#'+name).html();
			return false;
		},

		list: function(){
			return _.keys(map);
		},

		//load all prepared/combined templates from server (*.json without CORS)
		//or
		//load individual tpl into (Note: that tplName can be name or path to html) 
		load: function(url, override, tplName){
			if(_.string.endsWith(url, '.json')){
				//load all from preped .json
				$.ajax({
					url: url,
					dataType: 'json', //force return data type.
					async: false
				}).done(function(tpls){
					_.each(tpls, function(tpl, name){
						app.Util.Tpl.build(name, tpl, override);
					});
				});
			}else {
				//individual tpl
				var result = '';
				$.ajax({
					url: url,
					dataType: 'html',
					async: false
				}).done(function(tpl){
					result = app.Util.Tpl.build(tplName || url, tpl, override);
				}).fail(function(){
					throw new Error('DEV::View Template::Can not load template...' + url + ', re-check your app.config.viewTemplates setting');
				});
				return result; //{id: ..., string: ...}
			}
		}

	};

	app.Util.Tpl = Template;

})(Application);
