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

//Create the global Application var for modules to be registered on.
window.Application = new Backbone.Marionette.Application();
//Override to use Handlebars templating engine with Backbone.Marionette
Backbone.Marionette.TemplateCache.prototype.compileTemplate = function(rawTemplate) {
  return Handlebars.compile(rawTemplate);
};


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
	
	//Kick start the application
	Application.start();

	//a little test here.
	Application.content.show(new Application.Field.View.Form({model:new Application.Field.Model()}));

});
