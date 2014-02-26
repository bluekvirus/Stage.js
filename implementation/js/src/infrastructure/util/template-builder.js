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
	var Template = {

		build: function (name, tplStrArray){
			if(arguments.length === 0 || _.string.trim(name) === '') throw new Error('DEV::Util.Tpl::Please assign a template string');
			if(arguments.length === 1) {
				if(_.string.startsWith(name, '#')) return {id: name};
				tplStrArray = name;
				name = _.uniqueId('tpl-gen-');
				if(!_.isArray(tplStrArray))	tplStrArray = [tplStrArray];
			}

			if(map[name]) throw new Error('DEV::APP.Util.Template::Conflict! You have already named a template with id:' + name);

			var tpl = tplStrArray.join('');
			$('head').append(['<script type="text/tpl" id="',name,'">',tpl,'</script>'].join(''));
			map[name] = true;
			return {
				id: '#' + name,
				string: tpl
			};
		},

		get: function(name){
			if(map[name]) return $('head').find('#'+name).html();
			return false;
		},

		list: function(){
			return _.keys(map);
		},

	}

	Application.Util.Tpl = Template;

})(Application);
