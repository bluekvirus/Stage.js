/*
 * Main application definition.
 *
 * Usage (General)
 * ----------------------------
 * ###How to start my app?
 * 1. Application.setup({config});
 * config:
		* theme,
		* template,
		* contextRegion,
		* defaultContext,
		* fullScreen,
		* rapidEventDebounce,
		* baseAjaxURI
 * 2. Application.run();
 *
 * ###How to create app elements?
 * 4. Application.create(type, config);
 * 		0. API //TBI - URL or Model/Collection based widget data management?
 * 		1. Model/Collection: {
 * 			entity: ...,
 * 			[rest of normal Backbone.Model/Collection options]
 * 		};
 * 		2. Context: {
 * 			[name]: if you don't name the context, we will use 'Default' as its name,
 * 			template: '#id' or '<...>' or ['<...>', '<...>'],(auto functional attribute: region, view)
 * 			[requireLogin]: 'true' / 'false'(default)
 * 			[onNavigateTo]: function(module path string)
			[rest of normal Marionette.Layout options] - if you override initialize + onShow, the default region detect and view showing behavior will be removed.
 * 		};
 * 		3. Regional: { -- for automatically loading through layout template. 
 * 			name:, (id in static list:Marionette.Layout.Views -- see lib+-/marionette/view.js)
 * 			template: '#id' or '<...>' or ['<...>', '<...>'], (possible functional attribute: region, ui)
 * 			[type]: 'ItemView'(default)/ Layout/ CollectionView/ CompositeView (Marionette Views)
 * 			[rest of normal Marionette.(View type of your choice) options] 
 * 		};
 * 		4. Widget/Editor: parts (both define( has config.factory as function) and create)
 * 		as in infrastructure/core/part.js
 *
 * 		5. Validator: { -- basic editor validators
 * 			name: ...
 * 			fn(options, val, parentCt): function()
 * 			error: ... - error string
 * 		}
 * 	 	
 * ###Application Events to the aid?
 * 5. Use app:[your-event] format, and then register a global listener on app by using app.onYourEvent = function(e, your args);
 * You are in charge of event args as well.
 *
 * Pre-defined events are:
 * app:navigate (contextName, moduleName) - app.onNavigate [pre-defined]
 * app:context-switched (contextName) 
 * 		[with context:navigate-to (moduleName) on context] - app.onContextSwitched [not-defined]
 * region:load-view (view/widget name registered in app, [widget init options])
 * 
 * Suggested events are: [not included, but you define, you fire to use]
 * app:prompt (options) - app.onPrompt [not-defined]
 * app:message (options) - app.onMessage [not-defined]
 * app:login (options) - app.onLogin [not-defined]
 * app:logout (options) - app.onLogout [not-defined]
 * app:server-push (options) - app.onServerPush [not-defined]
 * 
 * 6. One special event to remove the need of your view objects to listen to window.resized events themselves is
 * app fires >>>
 * 		view:resized - upon window resize event
 * Listen to this event within your view definition on the Application object please.
 *
 * Usage (Specific)
 * ----------------------------
 * ###Building a view piece in application?
 * plugins to aid you:
 * 
 * 7. $.i18n
 * 8. $.md
 * 9. $.overlay
 *
 * Lib enhancements to aid you:
 * 10. see lib+-/...
 *   		
 * 
 * Global vars
 * ------------
 * $window
 * $document
 * Application
 * + libs
 * 
 * 
 * Optional
 * --------
 * You can also config NProgress through NProgress.configure({
	minimum: 0.1
	template: "<div class='....'>...</div>"
	ease: 'ease', speed: 500
	trickle: false
	trickleRate: 0.02, trickleSpeed: 800
	showSpinner: true/false
 * })
 *
 * @author Tim.Liu
 * @create 2014.02.17
 

/**
 * Setup Global vars and Config Libs
 * ---------------------------------
 */
_.each(['document', 'window'], function(coreDomObj){
	window['$' + coreDomObj] = $(window[coreDomObj]);
});

Modernizr.Detectizr.detect();//parse navigator.userAgent
Swag.registerHelpers();
NProgress.configure({
  showSpinner: false
});

/**
 * Define Application & Core Modules
 * ---------------------------------
 * Modules: API, Context(regional-views as sub-modules), Widget, Editor, Util
 * Methods:
 * 	setup();
 * 	run();
 * 	create(); - universal object (model/collection/views[context/regional-view/widget/editor]) creation point [hierarchy flattened to enhance transparency]. 
 */
Application = new Backbone.Marionette.Application();
_.each(['Core', 'Util'], function(coreModule){
	Application.module(coreModule);
});

;(function(){

	Application.setup = function(config){
		//1. Configure.
		Application.config = _.extend({

			//Defaults:
			theme: 'default',
			template: '',
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
			contextRegion: 'app',
			defaultContext: 'Default', //This is the context (name) the application will sit on upon loading.
			loginContext: 'Login', //This is the fallback context (name) when the user needs to authenticate with server.
			fullScreen: false, //This will put <body> to be full screen sized (window.innerHeight).
	        rapidEventDebounce: 200, //in ms this is the rapid event debounce value shared within the application (e.g window resize).
	        baseAjaxURI: null, //Modify this to fit your own backend apis. e.g index.php?q=
		}, config);

		//2 Detect Theme
		var theme = URI(window.location.toString()).search(true).theme || Application.config.theme;
		Application.Util.rollTheme(theme);			

		//3. Setup Application
		//3.1 Ajax Global
		/**
		 * Notifications
		 * -------------
		 * Default SUCCESS/ERROR reporting on ajax op globally.
		 * Success Notify will only appear if ajax options.notify = true
		 */
		$document.ajaxSuccess(function(event, jqxhr, settings){
			if(settings.notify)
				Application.trigger('app:message', {
					type: 'error',
					message: ['Operation Successful', '|', settings.type, settings.url.split('?')[0]].join(' ')
				});
		});

		$document.ajaxError(function(event, jqxhr, settings, exception){
			if(settings.notify === false) return;
			try{
				var errorStr = $.parseJSON(jqxhr.responseText).error;
			}catch(e){
				var errorStr = errorStr || exception;
			}
			Application.trigger('app:message', {
				type: 'error',
				message: [errorStr, '|', settings.type, settings.url.split('?')[0]].join(' ')
			});
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

		//3.2 Initializers (Layout, Navigation)
		/**
		 * Setup the application with content routing (context + module navigation). 
		 * 
		 * @author Tim.Liu
		 * @update 2013.09.11
		 * @update 2014.01.28 
		 * - refined/simplified the router handler and context-switch navigation support
		 * - use app:navigate (contextName, moduleName) at all times.
		 */

		//Application init: Global listeners
		Application.addInitializer(function(options){
			//Global App Events Listener Dispatcher
			Application.listenTo(Application, 'all', function(e){
				if(_.string.startsWith(e, 'app:')){
					var args = _.toArray(arguments).slice(1);
					var listener = 'on' + _.string.classify(e.split(':')[1]);
					if(Application[listener]) Application[listener].apply(Application, args);
				}
			});

			//Context switching utility
			function navigate(context, module){
				var targetContext = Application.Core.Context[context];
				if(!targetContext) throw new Error('DEV::Application::You must have the requred context ' + context + ' defined...'); //see - special/registry/context.js			
				if(Application.currentContext !== targetContext) {
					Application.currentContext = targetContext;

					//if the context requires user to login but he/she didn't, we remember the navi hash path and switch to the 'Login' context.				
					if(Application.currentContext._config.requireLogin && !Application.Util.touch()){
						Application.currentContext = Application.Core.Context[Application.config.loginContext];
					}
					if(!Application[Application.config.contextRegion]) throw new Error('DEV::Application::You don\'t have region \'' + Application.config.contextRegion + '\' defined');		
					Application[Application.config.contextRegion].show(Application.currentContext.display());
					//fire a notification round to the sky.
					Application.trigger('app:context-switched', Application.currentContext.name);
				}			
				Application.currentContext.trigger('context:navigate-to', module);
			};		
			
			Application.onNavigate = function(context, module){
				navigate(context, module);
			};

		});	

		//Application init: Hookup window resize and app.config fullScreen, navigate to default context.
		Application.addInitializer(function(options){

			var $body = $('body');

			function trackAppSize(){
				Application.trigger('view:resized', {h: window.innerHeight, w: window.innerWidth});
				if(Application.config.fullScreen){
					$body.height(window.innerHeight);
				}
			};
			trackAppSize();
			$window.on('resize', _.debounce(trackAppSize, Application.config.rapidEventDebounce));
			
			if(Application.config.fullScreen){
				$body.css({
					overflow: 'hidden',
					margin: 0,
					padding: 0					
				});
			}

			//2.Auto-detect and init context (view that replaces the body region). see the Context.Login
			if(!window.location.hash){
				window.location.hash = ['#navigate', Application.config.defaultContext].join('/');
			}
		});

		//Application init: Context Switching by Routes (can use href = #navigate/... to trigger them)
		Application.on("initialize:after", function(options){
			//init client page router and history:
			var Router = Backbone.Marionette.AppRouter.extend({
				appRoutes: {
					'(navigate)(/:context)(/:module)' : 'navigateTo', //navigate to a context and signal it about :module (can be a path for further navigation within)
				},
				controller: {
					navigateTo: function(context, module){
						Application.trigger('app:navigate', context, module);
					},
				}
			});

			Application.router = new Router();
			if(Backbone.history)
				Backbone.history.start();

		});

		return Application;
	};

	/**
	 * Define app starting point function
	 * ----------------------------------
	 * 
	 */
	Application.run = function(){

		$document.ready(function(){
			//1. Put main template into position and scan for regions.
			var regions = {};
			var tpl = Application.Util.Tpl.build(Application.config.template);
			$('#main').html(tpl.string).find('[region]').each(function(index, el){
				var name = $(el).attr('region');
				regions[name] = '#main div[region="' + name + '"]';
			});
			Application.addRegions(_.extend(regions, {
				app: 'div[region="app"]'
			}));

			//2. Show Regional Views defined by region.$el.attr('view');
			_.each(regions, function(selector, r){
				Application[r].ensureEl();
				var RegionalView = Application.Core.Regional.get(Application[r].$el.addClass('app-region region region-' + _.string.slugify(r)).attr('view'));
				if(RegionalView) Application[r].show(new RegionalView());
			});		

			//3. Start the app
			Application.start();

		});

		return Application;

	};

	/**
	 * Define app universal object creation api entry point
	 * ----------------------------------------------------
	 */
	Application.create = function(type, config){

		//if omitting type, app.create will be a (fallback) short-cut for Backbone.Marionette.[ItemView/Layout/CollectionView/CompositeView...] definition creation
		if(!_.isString(type)) {
			config = type;
			return Backbone.Marionette[config.type || 'ItemView'].extend(config);
		}
			
		switch(type){

			//data
			case 'API':
				throw new Error('DEV::Application::TBI...'); 
			break;

			case 'Model': case 'Collection':
				var obj = new Backbone[type](config);
				return obj.bindToEntity(config.entity);
			break;

			//basic component
			case 'Context': case 'Regional':
				return Application.Core[type].create(config); 
			break;
			case 'Validator':
				return Application.Core.Editor.addRule(config.name, config.fn, config.error);
			break;

			//re-usable
			//exception: need to register View definition before create...(use config.factory = function(){...} to register)
			case 'Widget': case 'Editor':
				if(config.factory && _.isFunction(config.factory))
					return Application.Core[type].register(config.name, config.factory);
				return Application.Core[type].create(config.name, config);
			break;


			default:
				throw new Error('DEV::APP::create() - You can not create an object of type ' + type);
			break;
		}
	}

})();



