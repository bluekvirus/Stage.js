/**
 * The Environment Setup File.
 * All the data/msg are rewired here.
 *
 * @author Tim.Liu
 * @update 2013.04.01
 */

;(function(Application, $, Backbone, _, Handlebars){

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
					afterClose: cb || $.noop
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
					afterClose: cb || $.noop
				}				
			});
		}

		/**
		 * Prompt the user if they are sure about this...
		 */
		Application.prompt = function(question, type, okCb, cancelCb, closeCb){

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
				],
				callback: {
					afterClose: closeCb || $.noop
				}
			});
		}

		/**
		 * Special information
		 */
		Application.inform = function(){
			arguments = _.toArray(arguments);
			noty({
				text: '<span class="label label-inverse">'+arguments[0]+'</span> '+arguments.slice(1).join(' '),
				type: 'information',
				layout: 'center',
				timeout: 5000,
				dismissQueue: true,				
			})
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
			if(settings.notify === false) return;
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
			options.xhrFields = _.extend(options.xhrFields || {}, {
				withCredentials: true //persists session cookies.
			});
		}

		//cache:[for IE]
		options.cache = false;

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
	    		$('.application-container').replaceWith($(layout).i18n({search: true}));
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
	 * 	Backward Compatibility & Hacks
	 *
	 * We no longer use Backbone.PageableCollection for pagination anymore.
	 * We priorities model's collection url before a model's urlRoot
	 * ====================================================================
	 */
	Backbone.PageableCollection = Backbone.Collection;
	Backbone.Model = Backbone.Model.extend({
	    url: function() {
	      var base = _.result(this.collection, 'url') || _.result(this, 'urlRoot') || urlError();
	      if (this.isNew()) return base;
	      return base + (base.charAt(base.length - 1) === '/' ? '' : '/') + encodeURIComponent(this.id);
	    },
	});

	//touch on remote server so that it sets back correct session cookies
	if(Application.config.crossdomain.enabled){
		var data = {username: Application.config.crossdomain.username, password:Application.config.crossdomain.password};
		$.ajax({type:'post', dataType:'json', url:'/login', data: data, notify: false, complete: function(jqXHR){
				Application.inform('Crossdomain Ajax', ' See if you can access the data');
			}
		});
	}

})(Application, jQuery, Backbone, _, Handlebars);