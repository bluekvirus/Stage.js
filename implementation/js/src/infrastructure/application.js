/**
 * Main application definition.
 *
 * Usage
 * -----
 * Use Application.setup({config})[add your custom code in between].run() to start application. 
 *
 * Optional
 * --------
 * You can also config NProgress.
 *
 * @author Tim.Liu
 * @create 2014.02.17
 */

$document = $(document);
Application = new Backbone.Marionette.Application();
_.each(['API', 'Context', 'Widget', 'Editor', 'Util'], function(coreModule){
	Application.module(coreModule);
});

/**
 * ================================
 * Lib Activation & Setups
 * ================================
 */
//1 Hook up additional Handlebars helpers.
Swag.registerHelpers();
NProgress.configure({
  //minimum: 0.1
  //template: "<div class='....'>...</div>"
  //ease: 'ease', speed: 500
  //trickle: false
  //trickleRate: 0.02, trickleSpeed: 800
  //showSpinner: false
});

/**
 * =================================
 * Define Application.setup() method
 * =================================
 */
Application.setup = function(config){
	//1. Configure.
	Application.config = _.extend({

		//Defaults:
		theme: null,
		template: [
			'<div region="top"></div>',
			'<div region="center"></div>',
			'<div region="bottom"></div>'
		].join(''),
		//e.g:: have a unified layout template.
		/**
		 * ------------------------
		 * |		top 	      |
		 * ------------------------
		 * | left | center | right|
		 * |	  |        |      |
		 * |	  |        |      |
		 * |	  |        |      |
		 * |	  |        |      |
		 * ------------------------
		 * |		bottom 	      |
		 * ------------------------		 
		 * 
		 * @type {String}
		 */		
		contextRegion: 'center',
		defaultContext: 'Login', //This is the context the application will sit on upon loading.
		fullScreen: false, //Note that this only indicates <body> will have overflow set to hidden in its css.
        rapidEventDebounce: 200, //in ms this is the rapid event debounce value shared within the application (e.g window resize).
        //Pre-set RESTful API configs (see Application.API core module) - Modify this to fit your own backend apis.
        baseAjaxURI: null,
        api: {
            //_Default_ entity is your fallback entity, only register common api method config to it would be wise, put specific ones into your context.module.
            _Default_: {
                data: {
                    read: {
                        type: 'GET',
                        url: function(entity, category, method, options){
                            if(options.model && options.model.id){
                                return '/' + category + '/' + entity + '/' + options.model.id;
                            }else {
                                return '/' + category + '/' + entity;
                            }
                        },
                        parse: 'payload',
                    },
                    create: {
                        type: 'POST',
                        url: function(entity, category, method, options){
                            return '/' + category + '/' + entity;
                        },
                        parse: 'payload',
                    },
                    update: {
                        type: 'PUT',
                        parse: 'payload',
                        url: function(entity, category, method, options){
                            return '/' + category + '/' + entity + '/' + options.model.id;
                        }

                    },
                    'delete': {
                        type: 'DELETE',
                        url: function(entity, category, method, options){
                            return '/' + category + '/' + entity + '/' + options.model.id;
                        }
                    }
                }
            }
        }
	}, config);	

	//2. Setup Application
	//2.1 Ajax Global
	/**
	 * Notifications
	 * -------------
	 * Default SUCCESS/ERROR reporting on ajax op globally.
	 * Success Notify will only appear if ajax options.notify = true
	 */
	$document.ajaxSuccess(function(event, jqxhr, settings){
		if(settings.notify)
			Application.success('Operation Successful', '|', settings.type, settings.url.split('?')[0]);
	});

	$document.ajaxError(function(event, jqxhr, settings, exception){
		if(settings.notify === false) return;
		try{
			var errorStr = $.parseJSON(jqxhr.responseText).error;
		}catch(e){
			var errorStr = errorStr || exception;
		}
		Application.error(errorStr, '|', settings.type, settings.url.split('?')[0]);
	});

	/**
	 * Progress
	 * --------
	 * Configure NProgress as global progress indicator.
	 */
	$document.ajaxStart(function() {
		NProgress.start();
	});
	$document.ajaxStop(function() {
		NProgress.done();
	});

	/**
	 *
	 * Base URI & Crossdomain
	 * ----------------------
	 * Preferred lvl of interference:
	 * $.ajaxPrefilter()
	 * [$.ajaxSetup()]
	 * [$.ajaxTransport()]
	 *
	 * For instrumenting a global behavior on the ajax calls according to app.config
	 * e.g:
	 * 1. base uri is ?q=/.../... instead of /.../... directly
	 * 2. crossdomain ajax support
	 */
		$.ajaxPrefilter('json', function(options){

			//base uri:
			if(Application.config.baseAjaxURI)
				options.url = Application.config.baseAjaxURI + options.url;

			//crossdomain:
			var crossdomain = Application.config.crossdomain;
			if(crossdomain.enabled){
				options.url = (crossdomain.protocol || 'http') + '://' + (crossdomain.host || 'localhost') + ((crossdomain.port && (':'+crossdomain.port)) || '') + (/^\//.test(options.url)?options.url:('/'+options.url));
				options.crossDomain = true;
				options.xhrFields = _.extend(options.xhrFields || {}, {
					withCredentials: true //persists session cookies.
				});
			}

			//cache:[for IE?]
			options.cache = false;

		});		

	//2.2 Initializers (Layout, Navigation)
	/**
	 * Setup the application with content routing (context + module navigation).
	 *
	 * Global Application Events:
	 * login context.form fires:
	 * 		app:user-changed - user will be stored at app.user (app.user === undefined means user has logged out see Context.Shared.User)
	 * app listens to >>>
	 *   	app:navigate (contextName, moduleName) this is used to invoke app.router.navigate method.
	 * app fires >>>
	 * 		(app:)view:resized - upon window resize event
	 *   	app:context-switched (contextName)
	 *   	context:navigate-to-module (moduleName)
	 * 
	 * 
	 * @author Tim.Liu
	 * @update 2013.09.11
	 * @update 2014.01.28 
	 * - refined/simplified the router handler and context-switch with module navigation support
	 * - use app:navigate (contextName, moduleName) at all times.
	 */

	//Application init: Hook-up Default RESTful Data APIs (from config.js)
	Application.addInitializer(function(options){
		Application.API.registerAll(Application.config.api);
	});

	//Application init: Global listeners
	Application.addInitializer(function(options){
		//Context switching utility
		function navigate(context, module){
			var targetContext = Application.Context.get(context);
			if(!targetContext || !Application.currentContext) throw new Error('DEV::MainApp::You must have the requred context ' + context + ' defined...'); //see - special/registry/context.js			
			if(Application.currentContext !== targetContext) {
				Application.currentContext = targetContext;

				//if the context requires user to login but he/she didn't, we remember the navi hash path and switch to the 'Login' context.				
				if(Application.currentContext.requireLogin && !Application.touch()){
					Application.currentContext = Application.Context.get('Login');
				}				
				Application[Application.config.contextRegion].show(new Application.currentContext.View.Default());
				//fire a notification round to the sky.
				Application.trigger('app:context-switched', Application.currentContext.name);
			}			
			Application.currentContext.trigger('context:navigate-to-module', module);
		};		
		
		Application._navigate = navigate; //this is in turn hooked with the app router, see below Application init: Routes
		Application.listenTo(Application, 'app:navigate', function(context, module){
			Application.router.navigate(_.string.rtrim(['#navigate', context, module].join('/'), '/'), true);
		});
	});	

	//Application init: Hookup window resize and app.config fullScreen, navigate to default context.
	Application.addInitializer(function(options){

		function trackAppSize(){
			Application.trigger('view:resized', {h: window.innerHeight, w: window.innerWidth});
		};
		trackAppSize();
		$(window).on('resize', _.debounce(trackAppSize, Application.config.rapidEventDebounce));
		
		if(Application.config.fullScreen){
			$('body').css('overflow', 'hidden');
		}

		//2.Auto-detect and init context (view that replaces the body region). see the Context.Login
		if(!window.location.hash){
			window.location.hash = ['#navigate', Application.config.defaultContext].join('/');
		}
	});

	//Application init: Routes (can use href = #navigate/... to trigger them)
	Application.on("initialize:after", function(options){
		//init client page router and history:
		var Router = Backbone.Marionette.AppRouter.extend({
			appRoutes: {
				'(navigate)(/:context)(/:module)' : 'navigateToModule', //navigate to a module's default view within a context
			},
			controller: {
				navigateToModule: function(context, module){
					Application._navigate(context, module);
				},
			}
		});

		Application.router = new Router();
		if(Backbone.history)
			Backbone.history.start();

	});

	//3 Detect Theme
	var theme = URI(window.location.toString()).search(true).theme || Application.config.theme || '_default';
	Application.Util.rollTheme(theme);

	return Application;
};

Application.run = function(){

	$document.ready(function(){
		//1. Put main template into position and scan for regions.
		var regions = {};
		$('#main').html(Application.config.template).find('[region]').each(function(index, el){
			var name = $(el).attr('region');
			//TODO:need to slagify or classify the name.
			regions[name] = '#main div[region="' + name + '"]';
		});
		Application.addRegions(regions);

		//2. Start the app
		Application.start();

	});

	return Application;

};






