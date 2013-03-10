/**
 * The Environment Configuration File.
 * All the data/msg are rewired here.
 *
 * @author Tim.Liu
 * @update 2013.03.08
 */

(function(){

	//Create the global Application var for modules to be registered on.
	window.Application = new Backbone.Marionette.Application();
	//Override to use Handlebars templating engine with Backbone.Marionette
	Backbone.Marionette.TemplateCache.prototype.compileTemplate = function(rawTemplate) {
	  return Handlebars.compile(rawTemplate);
	};	

	//Message & Notifycations:
	var console = console || {log:function(){},error:function(){}};

	if(noty){
		if(window.error) console.log('!!WARNING::error notification function conflict!!');
		/**
		 * Notify the user about application error.
		 *
		 * @arguments Error Type
		 * @arguments Messages ,...,
		 */
		Application.error = function(){
			noty({
				text: '<span class="label label-inverse">'+arguments[0]+'</span> '+_.toArray(arguments).slice(1).join(' '),
				type: 'error',
				layout: 'bottom'
			});
		};


	}

	//RESTful data interfacing

})();