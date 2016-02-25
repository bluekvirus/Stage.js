;(function($, _, Swag, underscoreString, Marionette){

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
	 * 3rd party lib init
	 * ---------------------------------
	 */
	Swag.registerHelpers();
	
	_.isPlainObject = function(o){
		return _.isObject(o) && !_.isFunction(o) && !_.isArray(o) && !_.isElement(o);
	};
	_.string = underscoreString;

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
	 * 		  |Context
	 * 		  |Regional (View)
	 * 		  |Widget
	 * 		  |Editor
	 * 		Remote (RESTful)
	 * 		Lock
	 */
	window.app = window.Application = new Marionette.Application();
	_.each(['Core', 'Util'], function(coreModule){
		Application.module(coreModule);
	});

})(jQuery, _, Swag, s, Marionette);
