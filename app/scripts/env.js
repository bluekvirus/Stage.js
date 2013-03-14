/**
 * The Environment Configuration File.
 * All the data/msg are rewired here.
 *
 * @author Tim.Liu
 * @update 2013.03.08
 */

(function(){

	/**
	 * ============================
	 * Application & Global Events:
	 * ============================
	 */
	//Create the global Application var for modules to be registered on.
	window.Application = new Backbone.Marionette.Application();
	


	/**
	 * =========================
	 * Overriden and Extensions:
	 * =========================
	 */
	//Override to use Handlebars templating engine with Backbone.Marionette
	Backbone.Marionette.TemplateCache.prototype.compileTemplate = function(rawTemplate) {
	  return Handlebars.compile(rawTemplate);
	};

	//New Backbone.Form editor 'CUSTOM_GRID'
	Backbone.Form.editors['CUSTOM_GRID'] = Backbone.Form.editors.Base.extend({

	    className: 'custom-form-editor-datagrid',

	    events: {
	        'change': function() {
	            // The 'change' event should be triggered whenever something happens
	            // that affects the result of `this.getValue()`.
	            this.trigger('change', this);
	        },
	        'focus': function() {
	            // The 'focus' event should be triggered whenever an input within
	            // this editor becomes the `document.activeElement`.
	            this.trigger('focus', this);
	            // This call automatically sets `this.hasFocus` to `true`.
	        },
	        'blur': function() {
	            // The 'blur' event should be triggered whenever an input within
	            // this editor stops being the `document.activeElement`.
	            this.trigger('blur', this);
	            // This call automatically sets `this.hasFocus` to `false`.
	        }
	    },

	    initialize: function(options) {
	        // Call parent constructor
	        Backbone.Form.editors.Base.prototype.initialize.call(this, options);

	        // Custom setup code.
	        // Need to delegate the EditorLayout(Datagrid) view to the module later in render.
	        this.moduleRef = Application[options.schema.moduleRef];

	    },

	    render: function() {
	        //this.setValue(this.value);

	        if(this.model.id){
	        //delegating the datagrid display
		        this.$el.html(new this.moduleRef.View.EditorLayout({
		        	collection: this.value //should be a collection passed by Backbone.Relationals
		        }).render().el)
		    }else {
		    	this.$el.addClass('alert alert-info edit-later-info');
		    	this.$el.html("Once you've created this record, you can come back to edit this field.");
		    }

	        return this;
	    },

	    getValue: function() {
	    	return this.value; //return the collection.
	    },

	    setValue: function(value) {
	        //this.$el.val(value);
	    },

	    focus: function() {
	        if (this.hasFocus) return;

	        // This method call should result in an input within this edior
	        // becoming the `document.activeElement`.
	        // This, in turn, should result in this editor's `focus` event
	        // being triggered, setting `this.hasFocus` to `true`.
	        // See above for more detail.
	        this.$el.focus();
	    },

	    blur: function() {
	        if (!this.hasFocus) return;

	        this.$el.blur();
	    }
	});



	/**
	 * ========================
	 * Message & Notifycations:
	 * ========================
	 */
	console = window.console || {log:function(){},error:function(){}};

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
				layout: 'bottom',
				dismissQueue: true,
			});
		};

		/**
		 * Prompt the user if they are sure about this...
		 */
		Application.prompt = function(question, type, okCb, cancelCb){

			//TODO:: Mask/Disable user interactions first.

			noty({
				text: question,
				type: type,
				layout: 'center',
				buttons: [
					{addClass: 'btn btn-primary', text: 'Yes', onClick:function($noty){
						$noty.close();
						okCb();
					}},
					{addClass: 'btn', text: 'Cancel', onClick:function($noty){
						$noty.close();
						if(cancelCb)
							cancelCb();
					}}
				]
			});
		}


	}



	/**
	 * =========================
	 * RESTful data interfacing:
	 * =========================
	 */

})();