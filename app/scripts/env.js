/**
 * The Environment Configuration File.
 * All the data/msg are rewired here.
 *
 * @author Tim.Liu
 * @update 2013.03.28
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
	        this.datagridMode = options.schema.mode;
	    },

	    render: function() {
	        //this.setValue(this.value);

	        if(this.model.id){
	        //delegating the datagrid display
	        	this.delegatedEditor = new this.moduleRef.View.EditorLayout({
		        	data: this.value, //this is the subDoc/refDoc array [NOT YET a collection].
		        	apiUrl: this.model.urlRoot+'/'+this.model.id+'/'+this.key, //collection url.
		        	datagridMode: this.datagridMode,
		        });
		        this.delegatedEditor.listenTo(this.form, 'close', this.delegatedEditor.close);
		        this.$el.html(this.delegatedEditor.render().el);
		    }else {
		    	this.$el.addClass('alert alert-info edit-later-info');
		    	this.$el.html("Once you've created this record, you can come back to edit this field.");
		    }

	        return this;
	    },

	    getValue: function() {
	    	if(this.delegatedEditor)
	    		return this.delegatedEditor.collectionRef.toJSON(); //return the collection.
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
	 * [Backbone] req/res trans
	 * =========================
	 */
	


	/**
	 * ================================
	 * Application universal downloader
	 * ================================
	 */

	var _downloader = function(server, ticket){
        var drone = $('#hiddenframe');
        if(drone.length > 0){
        }else{
            $('body').append('<iframe id="hiddenframe" style="display:none"></iframe>');
            drone = $('#hiddenframe');
        }
        drone.attr('src', server+'?name='+ticket.name+'&file='+ticket.file+'&type='+ticket.type);
	};

	Application.downloader = function(ticket){
		return _downloader('/download', ticket);
	}


	/**
	 * ============================
	 * Theme detector/roller
	 * ============================
	 */
    var _themeRoller = function(theme){
	    $('#theme-roller').attr('href', 'themes/'+theme+'/styles/main.css');
	    $.ajax({
	    	url: 'themes/'+theme+'/layout.html',
	    	async: false,
	    	success: function(layout){
	    		$('.application-container').replaceWith(layout);
	    	},
	    	error: function(msg){
	    		if(theme!=='_default')
	    			_themeRoller('_default');
	    		Application.error('::Theme Error::','<span class="label">', theme, '</span> is not available...switching back to default theme.');
	    	}
	    });
    };	

    var themeCatcher = new RegExp('theme=([\\d\\w]*)');
    var theme = themeCatcher.exec(location.search);
    if(!theme){
    	theme = ['','_default'];
    }
    //1st time upload app loading.
    _themeRoller(theme[1]);

    //Can expose the api to the Application
    //To be considered...
	/*Application.rollTheme = function(theme){
		TODO:: re-render after theme re-apply.
    	_themeRoller(theme);
    }*/


	/**
	 * ==============================
	 * Try/Patch scripts/css loading:
	 * ==============================
	 */
	
	//worker function [all shorthands extend from this one]
	var _patch = function(server, payload, type){
        var path = payload;
        $.ajax({
            url: server,
            async: false, //sync or else the loading won't occure before page ready.
            data: {payload: path, type: type},
            dataType: 'json',
            success: function(json, textStatus) {
              //optional stuff to do after success
              if(json.files){
                _.each(json.files, function(f, index){
                    $('body').append('<script type="text/javascript" src="'+path+'/'+f+'"/>');
                });
              }else{
                Application.error('Auto Loader Error', json.error);
              }
            }
        });
	}

	//shorthand methods
	Application.patchScripts = function(){
		_patch('/try/scripts', 'scripts/_try', 'js');
	} 

})();