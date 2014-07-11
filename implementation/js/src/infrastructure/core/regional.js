/**
 * This is a registry for saving 'named' regional view definitions.
 * 
 * [We moved the static regional view listing from the Marionette.Layout class]
 *
 * @author Tim.Liu
 * @create 2014.03.11
 */
;(function(app, _, M){

	var definition = app.module('Core.Regional');
	var map = {};

	_.extend(definition, {

		create: function(config){
			if(!config.name) throw new Error('DEV::Core.Regional::You must give this regional view a name...');
			if(map[config.name]) console.warn('DEV::Core.Regional::You have overriden regional view \'', config.name, '\'');
			
			map[config.name] = M[config.type || 'Layout'].extend(config);
			return map[config.name];
			
		},

		get: function(name, options){
			var Def = map[name];
			if(options) return new Def(options);
			return Def;
		}

	});

})(Application, _, Marionette);