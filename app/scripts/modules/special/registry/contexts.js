/**
 * This is the application context registry. 
 * A context defines the scope of a group of modules that represent a phase of the application. (e.g. Login, Admin, AppUser, AppPublic(can be the same thing as Login) ...etc.)
 *
 * ======
 * Design
 * ======
 * A context is a module that has a View.Default for basic layout management, but it also serves a registry for the sub-modules of that phase of the application.
 * A context is important for the application router, since the router will only search for modules and regions within the 'current' context. 
 * Switching of contexts should be signaled by the server. Thus when a 401 occurs the client side can switch the user back to the login phase.
 * A context will also have its name and default module and region defined.
 *
 * ======
 * Usage
 * ======
 * app.Context.create('name', [factory]) - factory should return a object that has View.Default(layout), name, default module and region defined.
 * app.Context.module('name') - create a context's sub-module.
 *
 * a context factory function should return at least an object that contains {
 *
 * 	requireLogin: true | false,
 * 	defaults: {
 * 		region: 'content',
 * 		module: 'Dashboard'
 * 		},
 * 	View: {
 * 		Default: ...
 * 	}
 * 
 * }
 * 
 * @author Tim.Liu
 * @created 2013.09.21
 */

;(function(app, _){

	var context = app.module('Context');
	_.extend(context, {

		get: function(dotedName){
			var path = dotedName.split('.');
			var result = this;
			while(path.length > 0){
				result = result[path.shift()];
			}
			if(result === this) return;
			return result;
		},

		create: function(name, factory){
			var ctx = app.module('Context.' + name); //create new context module as sub-modules.
			_.extend(ctx, {
				name: name,
				module: function(subModName){
					return app.module(['Context', name, subModName].join('.'));
				}
			}, factory && factory(ctx)); //note that we allow non-UI context for module grouping purposes.
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

