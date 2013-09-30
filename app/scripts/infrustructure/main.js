/**
 * The main application module. 
 * 
 * Everything starts here. 
 * 	- Kicks start the application and modules.
 * 	- Managing app level region and layouts.
 * 	- Hook up global routes and routing event trigger. (event name: 'app.navigate-to-module', on Application)
 *
 * Global Application Events:
 * app:switch-context (contextName, naviFragment)
 * app:navigate-to-module (moduleName, regionName)
 * 
 * 
 * @author Tim.Liu
 * @update 2013.09.11
 */

//When page is ready...

;jQuery(document).ready(function($) {
	// Stuff to do as soon as the DOM is ready. Use $() w/o colliding with other libs;
	
	//Config application regions for views:
	//Note that these regions selectors must already be on the index.html page (through loaded layout.html by theme roller.)
	Application.addRegions({
		//TBI:: auto-pickup from layouts?
		main: '.application-container',
		banner: '.application-container > .banner',
		body: '.application-container > .body',
		footer: '.application-container > .footer',

	});

	//Application init: Global listeners
	Application.addInitializer(function(options){
		//Context switching utility
		function switchContext(context, triggerNavi){
			var targetContext = Application.Context.get(context);
			if(Application.currentContext === targetContext) return;
			
			Application.currentContext = targetContext;
			if(Application.currentContext.requireLogin && !Application.touch()){
				Application.currentContext = Application.Context.get('Login');
				Application.currentContext.cachedRedirect = window.location.hash;
				window.location.assign('#'); //must clear the hash before switching to Context.Login (+ another route history page)
			}	
			if(!Application.currentContext) throw new Error('DEV::MainApp::You must have the requred context module ' + context + ' defined...'); //see - special/registry/context.js
			Application.body.show(new Application.currentContext.View.Default());
			if(triggerNavi){
				Application.router.navigate(triggerNavi, {trigger:true}); //trigger: true, let the route controller re-evaluate the uri fragment.
			}
		};		
		
		Application.listenTo(Application, 'app:switch-context', function(context, triggerNavi){
			switchContext(context, triggerNavi);
		});
	});	

	//Application init: Region Views (marionette layouts)
	//init menu,(banner, footer) and dashboard/welcome view.
	Application.addInitializer(function(options){

		//1.Auto-detect and init context (view that replaces the body region). see the Context.Login
		var context = Application.config.appContext; //go to default app context.
		Application.trigger('app:switch-context', context);

		//2.Show the shared UI modules, since these might depend on the Context.Login.Account.user
		var shared = {
			banner: Application.Context.get('Shared.Banner'),
			footer: Application.Context.get('Shared.Footer')
		}
		_.each(shared, function(UI, region){
			if(UI) Application.getRegion(region).show(new UI.View.Default());
		});	
	});

	//Application init: Routes (can use href = #navigate/... to trigger them)
	Application.on("initialize:after", function(options){
		//init client page router and history:
		var Router = Backbone.Marionette.AppRouter.extend({
			appRoutes: {
				'(navigate)(/:module)(/:region)' : 'navigateToModule', //navigate to a module's default view from certain region. (optional, use with caution...)
			},
			controller: {
				navigateToModule: (function(){
					var currentModule = '';
					return function(module, region){
							appRegion = Application.body.currentView.regionManager.get(region) || Application.body.currentView.regionManager.get(Application.currentContext.defaults.region);
							var target = Application.currentContext[module] || Application.currentContext[Application.currentContext.defaults.module];
							if(target && appRegion){
								if(currentModule !== module){
									appRegion.show(new target.View.Default());
									Application.currentModule = currentModule = module;
									Application.trigger('app:navigate-to-module', module, region);
								}
							}else
								//fallback to default, if that fails show error
								Application.error('Applicaton Routes Error', 'The module','<em class="label">', module,'</em>','you requested in context', Application.currentContext.name, 'can NOT be shown on region', region);
						}
				})(),
			}
		});

		Application.router = new Router();
		if(Backbone.history)
			Backbone.history.start();

	});

	//Kick start the application
	Application.start();

});

