/**
 * The main application module. 
 * 
 * Everything starts here. 
 * 	- Kicks start the application and modules.
 * 	- Managing app level region and layouts.
 * 	- Hook up global routes and routing event trigger. (event name: 'app.navigate-to-module', on Application)
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
		sidebar: '.application-container > .body .sidebar', //optional
		content: '.application-container > .body .content', //optional
		footer: '.application-container > .footer',

	});

	//Application init: Global listeners
	Application.addInitializer(function(options){
		//...
	});	

	//Application init: Region Views (marionette layouts)
	//init menu,(banner, footer) and dashboard/welcome view.
	Application.addInitializer(function(options){
		//TBI:: auto-detect and init from configuration? (login, admin or app layout module)
		Application.sidebar.show(new Application.Menu.View.Default());
	});

	//Application init: Routes (can use href = #navigate/... to trigger them)
	Application.on("initialize:after", function(options){
		//init client page router and history:
		var Router = Backbone.Marionette.AppRouter.extend({
			appRoutes: {
				'navigate/:module': 'navigateToModule', //navigate to a module's default view.
				'navigate/:module/:region' : 'navigateToModule', //navigate to a module's default view from certain region. (optional, use with caution...)
			},
			controller: {
				navigateToModule: (function(){
					var currentModule = '';
					return function(module, region){
							appRegion = Application.getRegion(region) || Application.getRegion('content');
							// console.log(module);
							var target = Application[module] || (Application.Admin && Application.Admin[module]);
							if(target && appRegion){
								if(currentModule !== module){
									appRegion.show(new target.View.Default());
									Application.currentModule = currentModule = module;
									Application.trigger('app:navigate-to-module', module, region);
								}
							}else
								Application.error('Applicaton Routes Error', 'The module','<em class="label">', module,'</em>','you requested can NOT be shown on region', region);
						}
				})(),
			}
		});

		new Router();
		if(Backbone.history)
			Backbone.history.start();

	});

	//Kick start the application
	Application.start();

});
