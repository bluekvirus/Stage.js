/**
 * The Environment Configuration File.
 * All the data/msg are rewired here.
 *
 * @author Tim.Liu
 * @update 2013.04.01
 */

(function(){

	/**
	 * ================================
	 * Application Container Creation
	 * ================================
	 */
	//Create the global Application var for modules to be registered on.
	window.Application = new Backbone.Marionette.Application();
	

	/**
	 * ================================
	 * Global Configure
	 * ================================
	 */
	$.ajax({url: '/loadappconfig',async: false,timeout: 200,
		success: function(cfg){
			Application.config = cfg;
		}
	})
	Application.config = _.extend(Application.config || {}, {

		crossdomain: {
			//enabled: true,
			/*CROSSDOMAIN ONLY*/
			protocol: '', //https or not? default: '' -> http
			host: '127.0.0.1', 
			port: '4000',
			/*----------------*/
		},

		/*Override ONLY IF 
			A: want to use a query param for server side routing
			B: the server application lives in sub-folder of your WEB_ROOT like /admin
		*/
		baseURI: '', //can be /?dispatch= if server doesn't support URI-REWRITE by default.

		/*Override Web API - defaults came from the server side config*/ 
		//apiBase: {},

	});

	/**
	 * ================================
	 * Global Events
	 * ================================
	 */
	

	/**
	 * =========================
	 * Overriden and Extensions:
	 * =========================
	 */
	//Override to use Handlebars templating engine with Backbone.Marionette
	Backbone.Marionette.TemplateCache.prototype.compileTemplate = function(rawTemplate) {
	  return Handlebars.compile(rawTemplate);
	};
	//To be used with ItemView tpl in CollectionView where collection is made from
	//a ['a', 'b', 'c'] alike array directly.
	Handlebars.registerHelper('valueOf', function(){
		return _.keys(this)[0];
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
			arguments = _.toArray(arguments);
			var cb = arguments.pop();
			if(!_.isFunction(cb)){
				arguments.push(cb);
				cb = undefined;
			} 
			noty({
				text: '<span class="label label-inverse">'+arguments[0]+'</span> '+arguments.slice(1).join(' '),
				type: 'error',
				layout: 'bottom',
				dismissQueue: true,
				callback: {
					afterClose: cb || function(){}
				}
			});
		};

		/** 
		 * Notify the user about successful data submission.
		 */
		Application.success = function(msg, cb){
			if(_.isFunction(msg)){
				cb = msg;
				msg = undefined;
			}
			noty({
				text: '<span>' + (msg || 'Operation Complete' ) + '</span>',
				type: 'success',
				layout: 'center',
				timeout: 800,
				dismissQueue: true,
				callback: {
					afterClose: cb || function(){}
				}				
			});
		}

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


		/**
		 * Default SUCCESS/ERROR reporting on ajax op globally.
		 * Success Notify will only appear if ajax options.notify = true
		 */
		$(document).ajaxSuccess(function(event, jqxhr, settings){
			if(settings.notify)
				Application.success();
		});

		$(document).ajaxError(function(event, jqxhr, settings, exception){
			try{
				var errorStr = $.parseJSON(jqxhr.responseText).error;
			}catch(e){
				var errorStr = errorStr || exception;
			}
				Application.error('Server Communication Error', settings.type, settings.url.split('?')[0], '|', errorStr);
		});
	}


	/**
	 * =========================
	 * RESTful data interfacing:
	 * [Backbone] req/res trans
	 *
	 * $.ajaxPrefilter()
	 * $.ajaxSetup()
	 * $.ajaxTransport()
	 * =========================
	 */
	$.ajaxPrefilter('json', function(options){

		//base uri:
		var baseURI = Application.config.baseURI;
		if(baseURI){
			options.url = baseURI + options.url;
		}

		//crossdomain:
		var crossdomain = Application.config.crossdomain;
		if(crossdomain.enabled){
			options.url = (crossdomain.protocol || 'http') + '://' + (crossdomain.host || 'localhost') + ((crossdomain.port && (':'+crossdomain.port)) || '') + (/^\//.test(options.url)?options.url:('/'+options.url));
			options.crossDomain = true;
		}

	});


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
        drone.attr('src', (ticket.url || server)+'?name='+ticket.name+'&file='+ticket.file+'&type='+ticket.type);
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
	    		Application.currentTheme = theme;
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
	 * Try/Patch scripts loading:
	 * ==============================
	 */
	
	//worker function [all shorthands extend from this one]
	var $body = $('body');
	var _patch = function(server, payload, silent){
        var path = payload;
        $.ajax({
            url: server,
            async: false, //sync or else the loading won't occure before page ready.
            timeout: 4500,
            global: !(silent || false),  
            data: {payload: path, type: 'js'}, //Compatibility:: 0.9 server still need 'type' param
            success: function(json, textStatus) {
				//optional stuff to do after success
				var count = 0
				_.each(['modules', 'extensions', 'others'], function(type){
					_.each(json[type], function(f, index){
					    $body.append('<script type="text/javascript" src="'+path+'/'+f+'"/>');
					    count++;
					});
				})
				/**
				 * ===================================
				 * Compatibility
				 * ===================================
				 * backward compatible with 0.9 server
				 */
				if(count === 0 && json.files){
					_.each(json.files, function(f, index){
					    $body.append('<script type="text/javascript" src="'+path+'/'+f+'"/>');
					});
				}
				//====================================

				if(!silent && json.error)
					Application.error('Auto Loader Error', json.error);
            }
        });
	}

	//shorthand methods
	Application.patchScripts = function(){
		_patch('/tryscripts', 'scripts/_try', true);
	} 

	Application.patchAdminGen = function(){
		_patch('/dev/AdminGen/scripts', '/dev/AdminGen/scripts', true);
	}

	/**
	 * ====================================================================
	 * 	Backward Compatibility
	 *
	 * We no longer use Backbone.PageableCollection for pagination anymore.
	 * ====================================================================
	 */
	Backbone.PageableCollection = Backbone.Collection;

})();