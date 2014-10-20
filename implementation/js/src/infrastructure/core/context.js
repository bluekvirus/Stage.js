/**
 * This is the Application context registry. 
 * A context defines the scope of a group of modules that represent a phase/mode/page of the Application. 
 * (e.g. Login, Admin, AppUser, AppPublic(can be the same thing as Login) ...etc.)
 *
 * 
 * Design
 * ------
 * Context switch can be triggered by 
 * 	a. use event on app app:navigate (path);
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
 *      guard: function(){
 *      	return undefined/''/false for pass
 *      	return error msg/object for blocking - triggers app:context-guard-error on app with the error returned
 *      }
 * });
 * or
 * app.context('name', {config});
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
 * @updated 2014.07.18 (1.5.0)
 */

;(function(app, _){

	var def = app.module('Core.Context');
	var map = {};

	_.extend(def, {
		create: function(config){
			_.extend(config, {
				name: config.name || 'Default',
				className: 'context context-' + _.string.slugify(config.name) + ' ' + (config.className || ''),
				isContext: true
			});

			return this.set(config.name, Backbone.Marionette.Layout.extend(config));
		},

		set: function(name, Layout){
			if(map[name]) console.warn('DEV::Core.Context::You have overriden context \'', name, '\'');
			map[name] = Layout;
			return Layout;
		},

		get: function(name){
			if(!name) return _.keys(map);
			return map[name];
		}

	});

})(Application, _);


