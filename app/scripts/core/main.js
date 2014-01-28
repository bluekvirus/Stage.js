/**
 * The main application module. 
 * 
 * Everything starts here. 
 * 	- Kicks start the application with content routing (context + module navigation).
 *
 * Global Application Events:
 * login context.form fires:
 * 		app:user-changed - user will be stored at app.user (app.user === undefined means user has logged out see Context.Shared.User)
 * app listens to >>>
 *   	app:navigate (contextName, moduleName) this is used to invoke app.router.navigate method.
 * app fires >>>
 *   	app:context-switched (contextName)
 *   	context:navigate-to-module (moduleName)
 * 
 * 
 * @author Tim.Liu
 * @update 2013.09.11
 * @update 2014.01.28 
 * - refined/simplified the router handler and context-switch with module navigation support
 * - use app:navigate (contextName, moduleName) at all times.

 */

//When page is ready...

;jQuery(document).ready(function($) {
	// Stuff to do as soon as the DOM is ready. Use $() w/o colliding with other libs;
	
	//Config application regions for views:
	//Note that these regions selectors must already be on the index.html page (through loaded layout.html by theme roller.)
	Application.addRegions({
		//TBI:: auto-pickup from layouts?
		main: '.application-container',
		banner: '.application-container > [region="banner"]',
		body: '.application-container > [region="body"]',
		footer: '.application-container > [region="footer"]',

	});

	//Application init: Hook-up Default RESTful Data APIs (from config.js)
	Application.addInitializer(function(options){
		Application.API.registerAll(Application.config.api);
	});

	//Application init: Global listeners
	Application.addInitializer(function(options){
		//Context switching utility
		function navigate(context, module){
			var targetContext = Application.Context.get(context);
			if(Application.currentContext !== targetContext) {
				Application.currentContext = targetContext;
				if(!Application.currentContext) throw new Error('DEV::MainApp::You must have the requred context ' + context + ' defined...'); //see - special/registry/context.js

				//if the context requires user to login but he/she didn't, we remember the navi hash path and switch to the 'Login' context.				
				if(Application.currentContext.requireLogin && !Application.touch()){
					Application.currentContext = Application.Context.get('Login');
				}				
				Application.body.show(new Application.currentContext.View.Default());
				//fire a notification round to the sky.
				Application.trigger('app:context-switched', Application.currentContext.name);
			}			
			Application.currentContext.trigger('context:navigate-to-module', module);
		};		
		
		Application._navigate = navigate; //this is in turn hooked with the app router, see below Application init: Routes
		Application.listenTo(Application, 'app:navigate', function(context, module){
			Application.router.navigate(_.string.rtrim(['#navigate', context, module].join('/'), '/'), true);
		});
	});	

	//Application init: Region Views (marionette layouts)
	//init menu,(banner, footer) and dashboard/welcome view.
	Application.addInitializer(function(options){

		//1.Show the shared UI modules, since these might depend on the Context.Login.Account.user
		var shared = {
			banner: Application.Context.get('Shared.Banner'),
			footer: Application.Context.get('Shared.Footer')
		}
		_.each(shared, function(UI, region){
			Application.getRegion(region).ensureEl();
			if(UI) Application.getRegion(region).show(new UI.View.Default());
		});

		function trackAppHeight(){
			//keeps track of context (body region) view port height. This is only useful for full-window web apps (no scroll on <html> or <body>).
			Application.fullScreenContextHeight = {
				window: this.innerHeight,
				noHeader: this.innerHeight - Application.getRegion('banner').$el.outerHeight(true),
				bodyOnly: this.innerHeight - Application.getRegion('banner').$el.outerHeight(true) - Application.getRegion('footer').$el.outerHeight(true)
			}
			Application.trigger('view:resized');
		};
		trackAppHeight();
		$(window).on('resize', _.debounce(trackAppHeight, 200));
		
		if(Application.config.fullScreen){
			$('body').css('overflow', 'hidden');
		}

		//2.Auto-detect and init context (view that replaces the body region). see the Context.Login
		if(!window.location.hash){
			window.location.hash = ['#navigate', Application.config.defaultContext].join('/');
		}
	});

	//Application init: Routes (can use href = #navigate/... to trigger them)
	Application.on("initialize:after", function(options){
		//init client page router and history:
		var Router = Backbone.Marionette.AppRouter.extend({
			appRoutes: {
				'(navigate)(/:context)(/:module)' : 'navigateToModule', //navigate to a module's default view within a context
			},
			controller: {
				navigateToModule: function(context, module){
					Application._navigate(context, module);
				},
			}
		});

		Application.router = new Router();
		if(Backbone.history)
			Backbone.history.start();

	});

	//Kick start the application
	Application.start();

});

