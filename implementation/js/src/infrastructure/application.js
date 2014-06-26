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
 * app:navigate (string) or ({context:..., module:...}) - app.onNavigate [pre-defined]
 * context:navigate-away - context.onNavigateAway [not-defined]
 * app:context-switched (contextName)  - app.onContextSwitched [not-defined]
 * context:navigate-to (moduleName) on context] - context.onNavigateTo [not-defined]
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
			contextRegion: 'app',
			defaultContext: 'Default', //This is the context (name) the application will sit on upon loading.
			fullScreen: false, //This will put <body> to be full screen sized (window.innerHeight).
	        rapidEventDebounce: 200, //in ms this is the rapid event debounce value shared within the application (e.g window resize).
	        baseAjaxURI: '/api', //Modify this to fit your own backend apis. e.g index.php?q= or '/api',
			/*CROSSDOMAIN Settings*/
			//see MDN - https://developer.mozilla.org/en-US/docs/HTTP/Access_control_CORS
			//If you ever need crossdomain development, we recommend that you TURN OFF local server's auth layer/middleware. 
			crossdomain: {
			    //enabled: true,
			    protocol: '', //https or not? default: '' -> http
			    host: '127.0.0.1', 
			    port: '5000',
			    username: 'admin',
			    password: '123'
			}

		}, config);

		//2 Detect Theme
		var theme = URI(window.location.toString()).search(true).theme || Application.config.theme;
		Application.Util.rollTheme(theme);			

		//3. Setup Application

		//3.0 General error rewire
		window.onerror = function(errorMsg, target, lineNum){
			Application.trigger('app:error', {
				errorMsg: errorMsg,
				target: target,
				lineNum: lineNum
			});
		};
		
		//3.1 Ajax Global

			/**
			 * Progress
			 * --------
			 * Configure NProgress as global progress indicator.
			 */
		if(window.NProgress){
			Application.onAjaxStart = function() {
				NProgress.start();
			};
			Application.onAjaxStop = function() {
				NProgress.done();
			};	
		}

			/**
			 *
			 * Crossdomain Support
			 * ----------------------
			 */
		Application.onAjax = function(options){
			//crossdomain:
			var crossdomain = Application.config.crossdomain;
			if(crossdomain.enabled){
				options.url = (crossdomain.protocol || 'http') + '://' + (crossdomain.host || 'localhost') + ((crossdomain.port && (':'+crossdomain.port)) || '') + (/^\//.test(options.url)?options.url:('/'+options.url));
				options.crossDomain = true;
				options.xhrFields = _.extend(options.xhrFields || {}, {
					withCredentials: true //persists session cookies.
				});
			}

			//cache:[disable it for IE only]
			if(Modernizr.ie)
				options.cache = false;			
		}

		//3.2 Initializers (Layout, Navigation)
		/**
		 * Setup the application with content routing (context + module navigation). 
		 * 
		 * @author Tim.Liu
		 * @update 2013.09.11
		 * @update 2014.01.28 
		 * - refined/simplified the router handler and context-switch navigation support
		 * - use app:navigate (string) or ({context:..., module:...}) at all times when switching contexts.
		 */

		//Application init: Global listeners
		Application.addInitializer(function(options){
			//Global App Events Listener Dispatcher
			Application.Util.addMetaEvent(Application, 'app');

			//Context switching utility
			function navigate(context, module){
				if(!context) throw new Error('DEV::Application::Empty context name...');
				var TargetContext = Application.Core.Context[context];
				if(!TargetContext) throw new Error('DEV::Application::You must have the requred context ' + context + ' defined...'); //see - special/registry/context.js			
				if(!Application.currentContext || Application.currentContext.name !== context) {
					if(Application.currentContext) Application.currentContext.trigger('context:navigate-away'); //save your context state within onNavigateAway()
					Application.currentContext = new TargetContext; //re-create each context upon switching
					Application.Util.addMetaEvent(Application.currentContext, 'context');

					if(!Application[Application.config.contextRegion]) throw new Error('DEV::Application::You don\'t have region \'' + Application.config.contextRegion + '\' defined');		
					Application[Application.config.contextRegion].show(Application.currentContext);
					//fire a notification round to the sky.
					Application.trigger('app:context-switched', Application.currentContext.name);
				}			
				Application.currentContext.trigger('context:navigate-to', module); //recover your context state within onNavigateTo()
			};		
			
			Application.onNavigate = function(options, silent){
				if(_.isString(options))
					window.location.hash = _.string.rtrim('navigate/' + options, '/');
				else {
					if(silent === true) //swap contents but don't update #hash accordingly
						navigate(options.context || Application.currentContext.name, options.module);
					else
						window.location.hash = _.string.rtrim(['navigate', options.context || Application.currentContext.name, options.module].join('/'), '/');
				}
			};

		});	

		//Application init: Hookup window resize/scroll and app.config fullScreen, navigate to default context.
		Application.addInitializer(function(options){

			var $body = $('body');

			function trackScreenSize(e, silent){
				var screenSize = {h: $window.height(), w: $window.width()};
				if(Application.config.fullScreen){
					$body.height(screenSize.h);
				}
				if(!silent)
					Application.trigger('app:resized', screenSize);
			};
			trackScreenSize(null, true);
			$window.on('resize', _.debounce(trackScreenSize, Application.config.rapidEventDebounce));

			function trackScroll(){
				var top = $window.scrollTop();
				Application.trigger('app:scroll', top);
			}
			$window.on('scroll', _.debounce(trackScroll, Application.config.rapidEventDebounce))
			
			if(Application.config.fullScreen){
				$body.css({
					overflow: 'hidden',
					margin: 0,
					padding: 0					
				});
			}

			//2.Auto-detect and init context (view that replaces the body region)
			if(!window.location.hash){
				if(!Application.Core.Context[Application.config.defaultContext])
					console.warn('DEV::Application::You might want to define a Default context using app.create(\'Context\', {...})');
				else
					window.location.hash = ['#navigate', Application.config.defaultContext].join('/');
			}
		});

		//Application init: Context Switching by Routes (can use href = #navigate/... to trigger them)
		Application.on("initialize:after", function(options){
			//init client page router and history:
			var Router = Backbone.Marionette.AppRouter.extend({
				appRoutes: {
					'(navigate)(\/:context)(\/:module)' : 'navigateTo', //navigate to a context and signal it about :module (can be a path for further navigation within)
				},
				controller: {
					navigateTo: function(context, module){
						Application.trigger('app:navigate', {
							context: context, 
							module: module
						}, true); //will skip updating #hash since the router is triggered by #hash change.
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
	 * Universal app object creation api entry point
	 * ----------------------------------------------------
	 * @deprecated Use the detailed apis instead.
	 */
	Application.create = function(type, config){
		console.warn('DEV::Application::create() method is deprecated, use methods listed in Application._apis for alternatives');
	}

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
			var Def = Backbone.Marionette[options.type || 'ItemView'].extend(options);
			if(instant) return new Def;
			return Def;
		},

		context: function(name, options){
			if(!_.isString(name)) {
				options = name;
				name = '';
			}
			options = options || {};
			_.extend(options, {name: name});
			return Application.Core['Context'].create(options);
		},

		regional: function(name, options){
			if(!_.isString(name)) {
				options = name;
				name = '';
			}
			options = options || {};
			_.extend(options, {name: name});			
			return Application.Core['Regional'].create(options);
		},

		widget: function(name, options){
			if(!_.isString(name)) throw new Error('DEV::Application.widget::You must specify a widget name to use.');
			if(_.isFunction(options)){
				//register
				Application.Core['Widget'].register(name, options);
				return;
			}
			return Application.Core['Widget'].create(name, options);
			//you can not get the definition returned.
		},

		editor: function(name, options){
			if(!_.isString(name)) throw new Error('DEV::Application.editor::You must specify a editor name to use.');
			if(_.isFunction(options)){
				//register
				Application.Core['Editor'].register(name, options);
				return;
			}
			return Application.Core['Editor'].create(name, options);
			//you can not get the definition returned.
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
	}

	/**
	 * API summary
	 */
	Application._apis = [
		'model', 'collection',
		'context - @alias:page', 'regional - @alias:area',
		'view',
		'widget', 'editor', 'editor.validator - @alias:editor.rule',
		'remote',
		'create - @deprecated'
	];

})();



