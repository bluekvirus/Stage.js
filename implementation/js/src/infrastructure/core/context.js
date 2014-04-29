/**
 * This is the Application context registry. 
 * A context defines the scope of a group of modules that represent a phase/mode/page of the Application. 
 * (e.g. Login, Admin, AppUser, AppPublic(can be the same thing as Login) ...etc.)
 *
 * 
 * Design
 * ------
 * A context is an Application sub-module that has a name and a layout template defined.
 * Since it is a module itself it also serves as a registry for the sub-modules of that context of the Application.
 * Context switch can be triggered by 
 * 	a. use app:navigate (contextName, subPath) event;
 *  b. click <a href="#/navigate/[contextName][/subPath]"/> tag;
 *
 * 
 * Usage
 * -----
 * ###How to define one? 
 * app.Core.Context.create({
 * 		name: 'name of the context',
 * 		template: 'html template of the view as in Marionette.Layout',
 * 							- region=[] attribute --- mark a tag to be a region container
 * 							- view=[] attribute --- mark this region to show an new instance of specified view definition (in context.Views, see context.create below)
 * 	    onNavigateTo: function(module or path string) - upon getting the context:navigate-to event,
 * 	    ...: other Marionette Layout options.
 * });
 *
 * or use the unified API entry point:
 * app.create('Context', {...});
 *
 * ###How to populate the context with regional views?
 * app.create('Regional', {...});
 *
 * ###How to swap regional view on a region?
 * use this.[region name].show()
 * or
 * use this.[region name].trigger('region:load-view', [view name])
 *
 * **Note** that this refers to the context module not the layout view instance.
 * 
 * @author Tim.Liu
 * @created 2013.09.21
 * @updated 2014.02.21 (1.0.0-rc1)
 */

;(function(app, _){

	var def = app.module('Core.Context');
	_.extend(def, {
		create: function(config){
			config.name = config.name || 'Default';
			config.className = 'context context-' + _.string.slugify(config.name) + ' ' + (config.className || '');
			if(def[config.name]) console.warn('DEV::Core.Context::You have overriden context \'', config.name, '\'');

			def[config.name] = Backbone.Marionette.Layout.extend(config);
			
			return def[config.name];
		}

	});

})(Application, _);


/**
 * ====================
 * Pre-Defined Contexts
 * ====================
 */
//Application.create('Context', {name: 'Shared'});

