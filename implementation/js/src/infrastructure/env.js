;(function($, _, Swag, Marionette){

	/**
	 * Global shortcuts
	 * ----------------
	 * $document
	 * $window
	 */
	_.each(['document', 'window'], function(coreDomObj){
		window['$' + coreDomObj] = $(window[coreDomObj]);
	});	

	/**
	 * 3rd party lib init
	 * ---------------------------------
	 */
	Swag.registerHelpers();
	_.isPlainObject = function(o){
		return _.isObject(o) && !_.isFunction(o) && !_.isArray();
	};

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
	 * 		  |Regional
	 * 		  |Widget
	 * 		  |Editor
	 * 		Remote (RESTful)
	 * 		Lock
	 */
	window.app = window.Application = new Marionette.Application();
	_.each(['Core', 'Util'], function(coreModule){
		Application.module(coreModule);
	});

})(jQuery, _, Swag, Marionette);
