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
		* navRegion/contextRegion,
		* defaultContext,
		* fullScreen,
		* rapidEventDebounce,
		* baseAjaxURI
		* i18nResources
		* i18nTransFile
 * 2. Application.run();
 *
 * ###How to interface with remote data?
 * 3. Application.remote(options); see core/remote-data.js
 *
 * ###How to create app elements?
 * 4. see Application apis down at the bottom
 * 	 	
 * ###Application Events to the aid?
 * 5. Use app:[your-event] format, and then register a global listener on app by using app.onYourEvent = function(e, your args);
 * You are in charge of event args as well.
 *
 * Pre-defined events
 * -navigation:
 * app:navigate (string) or ({context:..., module/subpath:...}) - app.onNavigate [pre-defined]
 * context:navigate-away - context.onNavigateAway [not-defined]
 * app:context-switched (contextName)  - app.onContextSwitched [not-defined]
 * context:navigate-to (moduleName/subpath) on context] - context.onNavigateTo [not-defined]
 *
 * -ajax 
 * ...(see core/remote-data.js for more.)
 *
 * -view and regions
 * region:load-view (view/widget name registered in app, [widget init options])
 * view:render-data (data)
 * ...(see more in documentations)
 * 
 * Suggested events are: [not included, but you define, you fire to use]
 * app:prompt (options) - app.onPrompt [not-defined]
 * app:error/info/success/warning (options) - app.onError [not-defined] //window.onerror is now rewired into this event as well.
 * app:login (options) - app.onLogin [not-defined]
 * app:logout (options) - app.onLogout [not-defined]
 * app:server-push (options) - app.onServerPush [not-defined]
 * 
 * 6. One special event to remove the need of your view objects to listen to window.resized events themselves is
 * app fires >>>
 * 		app:resized - upon window resize event
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
 * and the various libs global vars
 *
 * Global events
 * ------------
 * app:resized
 * app:scroll
 * 
 *
 * @author Tim.Liu
 * @create 2014.02.17
 

/**
 * Setup Global vars and Config Libs
 * ---------------------------------
 */
Swag.registerHelpers();
_.each(['document', 'window'], function(coreDomObj){
	window['$' + coreDomObj] = $(window[coreDomObj]);
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

//General error capture: it will be rewired to app:error after app.run() call
//It is to capture 3rd-party lib errors and those that cannot be seen during mobile (cordova) dev
window.onerror = function(errorMsg, target, lineNum){
    window._lastResort = window._lastResort || [];
    window._lastResort.push({
        errorMsg: errorMsg,
        target: target,
        lineNum: lineNum
    });
};

;(function(){

	Application.setup = function(config){
		
		//0. Re-run app.setup will only affect app.config variable.
		if(Application.config) {
			_.extend(Application.config, config);
			return;
		}

		//1. Configure.
		Application.config = _.extend({

			//Defaults:
			theme: 'default', //to disable theme rolling use false or '' and add your css in the index.html
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
			contextRegion: 'app', //alias: navRegion, prefered: navRegion
			defaultContext: 'Default', //This is the context (name) the application will sit on upon loading.
			fullScreen: false, //This will put <body> to be full screen sized (window.innerHeight).
	        rapidEventDebounce: 200, //in ms this is the rapid event debounce value shared within the application (e.g window resize).
	        baseAjaxURI: '/api', //Modify this to fit your own backend apis. e.g index.php?q= or '/api',
	        viewTemplates: 'static/template', //this is assisted by the build tool, combining all the *.html handlebars templates into one big json.
			i18nResources: 'static/resource', //this the the default location where our I18N plugin looks for locale translations.
			i18nTransFile: 'i18n.json', //can be {locale}.json
			/*Global CROSSDOMAIN Settings - Deprecated: set this in a per-request base or use server side proxy*/
			//see MDN - https://developer.mozilla.org/en-US/docs/HTTP/Access_control_CORS
			//If you ever need crossdomain in development, we recommend that you TURN OFF local server's auth layer/middleware. 
			//To use crossdomain ajax, in any of your request, add this option:
			// xdomain: {
			//     protocol: '', //https or not? default: '' -> http
			//     host: '127.0.0.1', 
			//     port: '5000',
			//     headers: {
			//     		'Credential': 'user:pwd'/'token',
			//     		...
			//     }
			// }
			//Again, it is always better to use server side proxy/forwarding instead of client side x-domain.

		}, config);

		
		//2 Global settings. (events & ajax)
		//Global App Events Listener Dispatcher
		Application.Util.addMetaEvent(Application, 'app');

		//Track window resize
		var $body = $('body');
		function trackScreenSize(e, silent){
			var screenSize = {h: $window.height(), w: $window.width()};
			if(Application.config.fullScreen){
				$body.height(screenSize.h);
			}
			if(!silent)
				Application.trigger('app:resized', screenSize);
		}
		trackScreenSize(null, true);
		$window.on('resize', _.debounce(trackScreenSize, Application.config.rapidEventDebounce));

		//Track window scroll
		function trackScroll(){
			var top = $window.scrollTop();
			Application.trigger('app:scroll', top);
		}
		$window.on('scroll', _.debounce(trackScroll, Application.config.rapidEventDebounce));
		
		//apply application.config.fullScreen = true
		if(Application.config.fullScreen){
			$body.css({
				overflow: 'hidden',
				margin: 0,
				padding: 0					
			});
		}		
		
		//Ajax Progress -- Configure NProgress as global progress indicator.
		if(window.NProgress){
			Application.onAjaxStart = function() {
				NProgress.start();
			};
			Application.onAjaxStop = function() {
				NProgress.done();
			};	
		}		

		//Ajax Options Fix: (baseAjaxURI, CORS and cache)
		Application.onAjax = function(options){

			//app.config.baseAjaxURI
			if(Application.config.baseAjaxURI)
				options.url = [Application.config.baseAjaxURI, options.url].join('/');	

			//crossdomain:
			var crossdomain = options.xdomain;
			if(crossdomain){
				options.url = (crossdomain.protocol || 'http') + '://' + (crossdomain.host || 'localhost') + ((crossdomain.port && (':'+crossdomain.port)) || '') + (/^\//.test(options.url)?options.url:('/'+options.url));
				options.crossDomain = true;
				options.xhrFields = _.extend(options.xhrFields || {}, {
					withCredentials: true //persists session cookies.
				});
				options.headers = _.extend(options.headers || {}, crossdomain.headers);
				// Using another way of setting withCredentials flag to skip FF error in sycned CORS ajax - no cookies tho...:(
				// options.beforeSend = function(xhr) {
				// 	xhr.withCredentials = true;
				// };
			}

			//cache:[disable it for IE only]
			// if(Modernizr.ie)
			// 	options.cache = false;
		
		};


		//3 Load Theme css & View templates & i18n translations
		var theme = URI(window.location.toString()).search(true).theme || Application.config.theme;
		if(theme){
			loadCSS('themes/'+theme+'/css/main.css', $('#theme-roller')[0]);
			Application.currentTheme = theme;
		}

		if(Application.config.viewTemplates)
			Application.Util.Tpl.load(Application.config.viewTemplates + '/all.json');

		I18N.configure({
			resourcePath: Application.config.i18nResources,
			translationFile: Application.config.i18nTransFile
		});

		//4 Add Navigation workers
		/**
		 * Setup the application with content routing (navigation). 
		 * 
		 * @author Tim.Liu
		 * @update 2013.09.11
		 * @update 2014.01.28
		 * @update 2014.07.15
		 * - refined/simplified the router handler and context-switch navigation support
		 * - use app:navigate (path) at all times when navigate between contexts & views.
		 */

			//1. Prepare context switching utility
			function navigate(path){
				path = _.compact(String(path).split('/'));
				if(path.length <= 0) throw new Error('DEV::Application::Navigation path error');

				var context = path.shift();

				if(!context) throw new Error('DEV::Application::Empty context name...');
				var TargetContext = Application.Core.Context[context];
				if(!TargetContext) throw new Error('DEV::Application::You must have the required context ' + context + ' defined...'); //see - special/registry/context.js			
				if(!Application.currentContext || Application.currentContext.name !== context) {
					
					//re-create target context upon switching
					var targetCtx = new TargetContext(), guardError;
					//allow context to guard itself (e.g for user authentication)
					if(targetCtx.guard) guardError = targetCtx.guard();
					if(guardError) {
						Application.trigger('app:context-guard-error', guardError, targetCtx.name);
						return;
					}
					//save your context state within onNavigateAway()
					if(Application.currentContext) Application.currentContext.trigger('context:navigate-away'); 
					//prepare and show this new context					
					Application.Util.addMetaEvent(targetCtx, 'context');
					var navRegion = Application.config.navRegion || Application.config.contextRegion;
					var targetRegion = Application.mainView.getRegion(navRegion) || Application.getRegion(navRegion);
					if(!targetRegion) throw new Error('DEV::Application::You don\'t have region \'' + navRegion + '\' defined');		
					targetRegion.show(targetCtx);
					Application.currentContext =  targetCtx;

					//fire a notification round to the sky.
					Application.trigger('app:context-switched', Application.currentContext.name);
				}

				Application.currentContext.trigger('context:navigate-chain', path);

			}
			
			Application.onNavigate = function(options, silent){
				if(!Application.available()) {
					Application.trigger('app:blocked', options);
					return;
				}

				var path = '';
				if(_.isString(options)){
					path = options;
				}else {
					//backward compatibility 
					path = _.string.rtrim([options.context || Application.currentContext.name, options.module || options.subpath].join('/'), '/');
				}
				if(silent)
					navigate(path);
				else
					window.location.hash = 'navigate/' + path;
			};

			Application.onContextGuardError = function(error, ctxName){
				console.error('DEV:Context-Guard-Error:', ctxName, error);
			};			


		//5 Activate Routing - activate after running all the initializers user has defined
		//Context Switching by Routes (can use href = #navigate/... to trigger them)
		Application.on("initialize:after", function(options){
			//init client page router and history:
			var Router = Backbone.Marionette.AppRouter.extend({
				appRoutes: {
					'navigate/*path' : 'navigateTo', //navigate to a context and signal it about *module (can be a path for further navigation within)
				},
				controller: {
					navigateTo: function(path){
						Application.trigger('app:navigate', path || Application.config.defaultContext, true); //will skip updating #hash since the router is triggered by #hash change.
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
	 * -----------------------------------------
	 * We support using stage.js in a hybrid app
	 * 
	 */
	Application.run = function(hybridEvent){

		hybridEvent = (hybridEvent === true) ? 'deviceready' : hybridEvent;

		function kickstart(){

			//0. dump all errors before app run() then rewire general error.
			if(window._lastResort){
				_.each(window._lastResort, function(err){
					Application.trigger('app:error', err);
				});
			}
			window.onerror = function(errorMsg, target, lineNum){
				Application.trigger('app:error', {
					errorMsg: errorMsg,
					target: target,
					lineNum: lineNum
				});
			};

			//1. check if we need 'fast-click' on mobile plateforms
			if(Modernizr.mobile)
				FastClick.attach(document.body);

			//2. Put main template into position.
			Application.addRegions({
				app: '[region="app"]'
			});
			//Warning: calling ensureEl() on the app region will not work like regions in layouts. (Bug??)
			//the additional <div> under the app region is somehow inevitable atm...
			Application.trigger('app:before-template-ready');
			Application.mainView = Application.view({
				type: 'Layout',
				template: Application.config.template
			}, true);
			Application.getRegion('app').show(Application.mainView);
			Application.trigger('app:template-ready');

			//3.Auto-detect and init context (view that replaces the body region)
			if(!window.location.hash){
				if(!Application.Core.Context[Application.config.defaultContext])
					console.warn('DEV::Application::You might want to define a Default context using app.create(\'Context Name\', {...})');
				else
					window.location.hash = ['#navigate', Application.config.defaultContext].join('/');
			}

			//4. Start the app
			Application.start();

		}

		if(hybridEvent){
		    Application.onError = function(err){
		    	//assign default remote debugging assistant
		        console.error(err, err.target);
		    };
			document.addEventListener(hybridEvent, function(){
				$document.ready(kickstart);
			}, false);
		}else
			$document.ready(kickstart);

		return Application;

	};

	/**
	 * Universal app object creation api entry point
	 * ----------------------------------------------------
	 * @deprecated Use the detailed apis instead.
	 */
	Application.create = function(type, config){
		console.warn('DEV::Application::create() method is deprecated, use methods listed in ', Application._apis, ' for alternatives');
	};

	/**
	 * Detailed api entry point
	 * ------------------------
	 * If you don't want to use .create() there you go:
	 */
	_.extend(Application, {

		model: function(data){
			return new Backbone.Model(data);
		},

		collection: function(data){
			return new Backbone.Collection(data);
		},

		view: function(options, instant){
			if(_.isBoolean(options)){
				instant = options;
				options = {};
			}

			var Def;
			if(!options.name){
				Def = Backbone.Marionette[options.type || 'ItemView'].extend(options);
				if(instant) return new Def();
			}
			else //named views should be regionals in concept
				Def = Application.Core.Regional.create(options);
			
			return Def;
		},

		context: function(name, options){
			if(!_.isString(name)) {
				options = name;
				name = '';
			}
			options = options || {};
			_.extend(options, {name: name});
			return Application.Core.Context.create(options);
		},

		regional: function(name, options){
			if(!_.isString(name)) {
				options = name;
				name = '';
			}			
			options = options || {};
			_.extend(options, {name: name});

			if(!options.name){
				options.type = options.type || 'Layout';
				//no name means to use a view on a region anonymously, which in turn creates it right away.
				return Application.view(options, true);
			}

			return Application.Core.Regional.create(options);
		},

		widget: function(name, options){
			if(_.isFunction(options)){
				//register
				Application.Core.Widget.register(name, options);
				return;
			}
			return Application.Core.Widget.create(name, options);
			//you can not get the definition returned.
		},

		editor: function(name, options){
			if(_.isFunction(options)){
				//register
				Application.Core.Editor.register(name, options);
				return;
			}
			return Application.Core.Editor.create(name, options);
			//you can not get the definition returned.
		},

		lock: function(topic){
			return Application.Core.Lock.lock(topic);
		},

		unlock: function(topic){
			return Application.Core.Lock.unlock(topic);
		},

		available: function(topic){
			return Application.Core.Lock.available(topic);
		}		

	});

	//editor rules
	Application.editor.validator = Application.editor.rule = function(name, fn){
		if(!_.isString(name)) throw new Error('DEV::Application.editor.validator::You must specify a validator/rule name to use.');
		return Application.Core.Editor.addRule(name, fn);
	};

	//alias
	Application.page = Application.context;
	Application.area = Application.regional;

	/**
	 * Universal remote data interfacing api entry point
	 * -------------------------------------------------
	 * @returns jqXHR object (use promise pls)
	 */
	Application.remote = function(options){
		if(options.payload)
			return Application.Core.Remote.change(options);
		else
			return Application.Core.Remote.get(options);
	};

	/**
	 * API summary
	 */
	Application._apis = [
		'model', 'collection',
		'context - @alias:page', 'regional - @alias:area',
		'view',
		'widget', 'editor', 'editor.validator - @alias:editor.rule',
		'remote',
		'lock', 'unlock', 'available',
		'create - @deprecated'
	];

})();



