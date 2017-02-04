/**
 * Environment setup (global)
 *
 * @author Tim Lauv
 */

;(function($, _, underscoreString, Marionette){

	/**
	 * Global shortcuts
	 * ----------------
	 * $window
	 * $document
	 * $head
	 * $body
	 */
	_.each(['document', 'window'], function(coreDomObj){
		window['$' + coreDomObj] = $(window[coreDomObj]);
	});
	_.each(['body', 'head'], function(coreDomWrap){
		window['$' + coreDomWrap] = $(coreDomWrap);
	});

	/**
	 * Define top level module containers
	 * ----------------------------------
	 * 				App
	 * 				 |
	 * 			   -----
	 * 			  /     \
	 * 			Core    Util
	 * 			 |       |
	 * 			 |      ...
	 * 		Resuable
	 * 		  |Context|
	 * 		  |Widget | --fallback--> View (Regional)
	 * 		  |Editor |
	 * 		Remote (RESTful)
	 * 		Lock
	 */
	window.app = window.Application = new Marionette.Application();
	_.each(['Core', 'Util'], function(coreModule){
		Application.module(coreModule);
	});

})(jQuery, _, s, Marionette);
