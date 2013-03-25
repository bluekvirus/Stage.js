/**
 *
 * The main application module. 
 * 
 * 
 * Everything starts here. 
 * 	- Exposing the Application var
 * 	- Kicks start the application and modules.
 * 	- Managing app level region and layout within. 
 *
 * 
 * @module Application
 * @author Tim.Liu
 */


//When page is ready...

jQuery(document).ready(function($) {
	// Stuff to do as soon as the DOM is ready. Use $() w/o colliding with other libs;
	
	//Config application regions for views:
	//Note that these regions selectors must already be on the index.html page.
	Application.addRegions({
		main: '.application-container',
		banner: '.application-container .banner',
		body: '.application-container .body',
		sidebar: '.application-container .body .sidebar',
		content: '.application-container .body .content',
		footer: '.application-container .footer',

	});

	//Application init:1 
	Application.addInitializer(function(options){
		//init menu,(banner, footer) and dashboard/welcome view.
		Application.sidebar.show(new Application.Menu.View.AccordionView());
	});

	//Application init:2
	Application.on("initialize:after", function(options){
		//init client page router and history:
		var _Router_ = Backbone.Marionette.AppRouter.extend({
			appRoutes: {
				'config/:module': 'navigateToModule', //navigate to this module's default view.
			},
			controller: {
				navigateToModule: (function(){
					var currentModule = '';
					return function(module){
							//console.log(module);
							if(Application[module]){
								if(currentModule !== module){
									Application.content.show(new Application[module].View.Default());
									currentModule = module;
									Application.trigger('navigateToModule', module);
								}
							}else
								Application.error('Applicaton Routes Error', 'The module','<em class="label">', module,'</em>','you requested does not exist');
						}
				})(),
			}
		});

		new _Router_();
		if(Backbone.history)
			Backbone.history.start();

	});

	
	//Kick start the application
	Application.start();

});
