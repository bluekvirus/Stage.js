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

		build: function (name, tplString){
			if(arguments.length === 0 || _.string.trim(name) === '') return {id:'#_blank', tpl: ' '};
			if(arguments.length === 1) {
				if(_.string.startsWith(name, '#')) return {id: name};
				tplString = name;
				name = _.uniqueId('tpl-gen-');
				if(!_.isArray(tplString))	tplString = [tplString];
			}

			//process name to be valid id string
			name = name.split(namefix).join('-');

			if(map[name]) throw new Error('DEV::APP.Util.Template::Conflict! You have already named a template with id:' + name);

			var tpl = _.isArray(tplString)?tplString.join(''):tplString;
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
			name = name.split(namefix).join('-');
			
			if(map[name]) return $('head').find('#'+name).html();
			return false;
		},

		list: function(){
			return _.keys(map);
		},

		//load the prepared/combined templates package from server (without CORS)
		load: function(url){
			$.ajax({
				url: url,
				async: false
			}).done(function(tpls){
				_.each(tpls, function(tpl, name){
					app.Util.Tpl.build(name, tpl);
				});
			});
		}

	};

	app.Util.Tpl = Template;

})(Application);
