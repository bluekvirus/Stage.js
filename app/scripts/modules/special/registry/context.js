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
 * app.Context.create('name', factory) - factory should return a object that has View.Default(layout), name, default module and region defined.
 * app.Context.module('name') - create a context's sub-module.
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
			}, factory(ctx));
		}

	});

})(Application, _);


/**
 * ====================
 * Pre-Defined Contexts
 * ====================
 */

Application.Context.create('Login', function(context){

	Template.extend(
		'application-context-login-tpl',
		[
			'<div class="container content"></div>'
		]
	);
	
	return {
		defaults: {
			region: 'content',
			module: 'Account'
		},
		View: {
			Default: Backbone.Marionette.Layout.extend({
				template: '#application-context-login-tpl',
				regions: {
					content: '.content'
				}
			})
		},
		API: {
			/**
			 * [isLoggedIn check with application server to see if the user is logged in or not...]
			 * @return {Boolean} see application server routes/landing/page.js
			 */
			isLoggedIn: function(){
				var result = false;
				$.ajax({
					url: '/login',
					notify: false,
					async: false,
					success: function(){
						result = true;
					}
				});
				return result;			
			}
		}
		//Do NOT need to use onShow() here, since the defaults config will put 'Account' module on page.
	}

});

Application.Context.create('Admin', function(context){

	Template.extend(
		'application-context-admin-tpl',
		[
	        '<div class="default row-fluid">',
	            '<div class="sidebar span2"></div>',
	            '<div class="content span10"></div>',
	        '</div>'
		]
	);

	return {
		defaults: {
			region: 'content',
			module: 'Dashboard'
		},
		View: {
			Default: Backbone.Marionette.Layout.extend({
				template: '#application-context-admin-tpl',
				regions: {
					sidebar: '.sidebar',
					content: '.content',
				},
				onShow: function(){
					this.sidebar.show(new context.Menu.View.Default());
				}
			})
		}
	} 
});