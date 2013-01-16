/**
 *
 * The main application module. Everything starts here. Exposing the Application var
 * to all the module definitions.
 *
 * 
 * @module Application
 * @author Tim.Liu
 */

window.Application = new Backbone.Marionette.Application();

jQuery(document).ready(function($) {
	// Stuff to do as soon as the DOM is ready. Use $() w/o colliding with other libs;
	
	//Kick start the application
	Application.start();

	//a little test here.
	var form = new Backbone.Form({
		model: new Application.Field.Model()
	}).render();
	$('.container').append(form.el);

});
