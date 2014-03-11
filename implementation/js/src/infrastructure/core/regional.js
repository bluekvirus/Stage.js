/**
 * This is a registry for saving 'named' regional view definitions.
 * 
 * Note: ignore config.name will return a instance of defined View. Since no name means to use it anonymously, which in turn creates it right away.
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
			if(map[config.name]) console.warn('DEV::Core.Regional::You have overriden regional view \'', config.name, '\'');
			
			var View = M[config.type || 'Layout'].extend(config);
			if(config.name)
				map[config.name] = View;
			//no name means to use it anonymously, which in turn creates it right away.
			else return new View();
			return View;
			
		},

		get: function(name){
			return map[name];
		}

	});

})(Application, _, Marionette);