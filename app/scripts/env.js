/**
 * The Environment Configuration File.
 * All the data/msg are rewired here.
 *
 * @author Tim.Liu
 * @update 2013.04.01
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
	//To be used with ItemView tpl in CollectionView where collection is made from
	//a ['a', 'b', 'c'] alike array directly.
	Handlebars.registerHelper('valueOf', function(){
		return _.keys(this)[0];
	});

	Handlebars.registerHelper('showSignatureMapping', function(type, mapping){
		try{
	        var parts = mapping.split(':');
			return '<p><span class="label '+(type==='strictly'?'label-important':'label-warning')+'">'+parts[0]+'</span> '+parts[1]+'</p>';
		}catch(e){
			console.log(e);
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
	var _patch = function(server, payload, silent){
        var path = payload;
        $.ajax({
            url: server,
            async: false, //sync or else the loading won't occure before page ready.
            timeout: 4500,
            data: {payload: path},
            dataType: 'json',
            success: function(json, textStatus) {
				//optional stuff to do after success
				_.each(['modules', 'extensions', 'others'], function(type){
					_.each(json[type], function(f, index){
					    $('body').append('<script type="text/javascript" src="'+path+'/'+f+'"/>');
					});
				})
				if(!silent && json.error)
					Application.error('Auto Loader Error', json.error);
            }
        });
	}

	//shorthand methods
	Application.patchScripts = function(){
		_patch('/tryscripts', 'scripts/_try', false);
	} 

	Application.patchAdminGen = function(){
		_patch('/dev/AdminGen/scripts', '/dev/AdminGen/scripts', true);
	}

})();