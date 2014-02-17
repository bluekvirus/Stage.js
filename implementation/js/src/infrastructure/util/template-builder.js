/**
 * This is the template builder/registry util, making it easier to create new templates for View objects.
 *
 * @author Tim.Liu
 * @create 2013.12.20
 */

;(function(app){

	if(window.Template) throw new Error('DEV::Core.Util.Template::Conflict! You need to move window.Template into a new global var...');

	var map = {};
	var Template = {
		extend: function (name, tplStrArray){
			if(map[name]) throw new Error('DEV::Core.Util.Template::Conflict! You have already named a template with id:' + name);

			var tpl = tplStrArray.join('');
			$('head').append(['<script type="text/tpl" id="',name,'">',tpl,'</script>'].join(''));
			map[name] = true;
		},

		get: function(name){
			if(map[name]) return $('head').find('#'+name).html();
			return false;
		},

		list: function(){
			return _.keys(map);
		}
	}

	window.Template = Template;

})(Application);

/**
 * Pre-defined Global Templates
 */
Template.extend('_blank', [' ']); //blank sheet template.