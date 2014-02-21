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
 * 	a. use app:navigate (contextName, moduleName) event;
 *  b. click <a href="#/navigate/[contextName][/moduleName]"/> tag;
 *
 * 
 * Usage
 * -----
 * ###How to define one? 
 * app.Context.create({
 * 		name: 'name of the context',
 * 		layout/template: 'html template of the view as in Marionette.Layout',
 * 							- region=[] attribute --- mark a tag to be a region container
 * 							- view=[] attribute ---mark this region to show an new instance of specified view definition
 * 	    requireLogin: 'true' | 'false'
 * });
 *
 * ###How to populate the context with sub-modules?
 * context.create({
 * 		[region]: ,
 * 		[name]: ,
 * 		layout/template: '',
 * 		[type]: Marionette View type [ItemView(default), Layout, CollectionView, CompositeView]
 * 		... rest of the config to the View definition?
 * }) - create a context's regional sub-module.
 *
 * 
 * @author Tim.Liu
 * @created 2013.09.21
 * @updated 2014.02.21 (1.0.0-rc1)
 */

;(function(app, _){

	var definition = app.module('Context');
	_.extend(definition, {

		//TODO::
		create: function(name, factory){
			var ctx = app.module('Context.' + name); //create new context module as sub-modules.
			_.extend(ctx, {
				name: name,
				create: function(subModName){
					return _.extend(app.module(['Context', name, subModName].join('.')), {
						name: subModName
					});
				}
			}, factory && factory(ctx)); //note that we allow non-UI context for module grouping purposes.
			return ctx;
		}

	});

})(Application, _);


/**
 * ====================
 * Pre-Defined Contexts
 * ====================
 *
 * see modules/context/[specific context folder]/context.js
 */

