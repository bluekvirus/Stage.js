;
;;(function($, _, Swag, Marionette){

	/**
	 * Global shortcuts
	 * ----------------
	 * $document
	 * $window
	 */
	_.each(['document', 'window'], function(coreDomObj){
		window['$' + coreDomObj] = $(window[coreDomObj]);
	});	

	/**
	 * 3rd party lib init
	 * ---------------------------------
	 */
	Swag.registerHelpers();
	_.isPlainObject = function(o){
		return _.isObject(o) && !_.isFunction(o) && !_.isArray();
	};

	/**
	 * Define top level module containers
	 * ----------------------------------
	 * 				App
	 * 				 |
	 * 			   -----
	 * 			  /     \
	 * 			Core    Util
	 * 			 |       |
	 * 			 |      ...
	 * 		Resuable
	 * 		  |Context
	 * 		  |Regional (View)
	 * 		  |Widget
	 * 		  |Editor
	 * 		Remote (RESTful)
	 * 		Lock
	 */
	window.app = window.Application = new Marionette.Application();
	_.each(['Core', 'Util'], function(coreModule){
		Application.module(coreModule);
	});

})(jQuery, _, Swag, Marionette);

;/*
 * Main application definition.
 *
 * Usage (General)
 * ----------------------------
 * ###How to start my app?
 * 1. app.setup({config});
 * config:
		* template,
		* navRegion/contextRegion,
		* defaultContext,
		* fullScreen,
		* rapidEventDelay,
		* baseAjaxURI
		* i18nResources
		* i18nTransFile
		* timeout (ms) - for app.remote and $.fileupload only, not for general $.ajax.
 * 2. app.run();
 *
 * ###How to interface with remote data?
 * 3. app.remote(options); see core/remote-data.js
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
 * Suggested events are: [not included]
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
 * @created 2014.02.17
 * @updated 2015.08.03
 */

;(function(app){

	app.setup = function(config){
		
		//0. Re-run app.setup will only affect app.config variable.
		if(app.config) {
			_.extend(app.config, config);
			return;
		}

		//1. Configure.
		app.config = _.extend({

			//------------------------------------------mainView-------------------------------------------
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
			contextRegion: 'app', //alias: navRegion, preferred: navRegion
			defaultContext: 'Default', //This is the context (name) the application will sit on upon loading.
			//---------------------------------------------------------------------------------------------
			fullScreen: false, //This will put <body> to be full screen sized (window.innerHeight).
	        rapidEventDelay: 200, //in ms this is the rapid event delay control value shared within the application (e.g window resize).
	        baseAjaxURI: '', //Modify this to fit your own backend apis. e.g index.php?q= or '/api',
	        viewTemplates: 'static/template', //this is assisted by the build tool, combining all the *.html handlebars templates into one big json.
			viewSrcs: undefined, //set this to enable reusable view dynamic loading.
			i18nResources: 'static/resource', //this the the default location where our I18N plugin looks for locale translations.
			i18nTransFile: 'i18n.json', //can be {locale}.json
			i18nLocale: '', //if you really want to force the app to certain locale other than browser preference. (Still override-able by ?locale=.. in url)
			timeout: 5 * 60 * 1000,

		}, config);
		
		//2 Global settings. (events & ajax)
		//Global App Events Listener Dispatcher
		app.Util.addMetaEvent(app, 'app');

		//Track window resize
		var $body = $('body');
		function trackScreenSize(e, silent){
			var screenSize = {h: $window.height(), w: $window.width()};
			if(!validScreenSize(screenSize)) return;

			////////////////cache the screen size/////////////
			app.screenSize = screenSize;
			//////////////////////////////////////////////////
			if(app.config.fullScreen){
				$body.height(screenSize.h);
				$body.width(screenSize.w);
			}
			if(!silent)
				app.trigger('app:resized', screenSize);
		}
		function validScreenSize(size){
			return size.h > 0 && size.w > 0;
		}
		$window.on('resize', _.debounce(trackScreenSize, app.config.rapidEventDelay));
		//check screen size, trigger app:resized and get app.screenSize ready.
		app._ensureScreenSize = function(done){
			trackScreenSize(); 
			if(!app.screenSize) _.delay(app._ensureScreenSize, app.config.rapidEventDelay/4, done);
			else done();
		};

		//Track window scroll
		function trackScroll(){
			var top = $window.scrollTop();
			app.trigger('app:scroll', top);
		}
		$window.on('scroll', _.throttle(trackScroll, app.config.rapidEventDelay));
		
		//apply app.config.fullScreen = true
		if(app.config.fullScreen){
			$body.css({
				overflow: 'hidden',
				margin: 0,
				padding: 0					
			});
		}

		//3 Load Theme css & View templates & i18n translations
		var theme = app.uri(window.location.toString()).search(true).theme || app.config.theme;
		if(theme){
			console.warn('DEV::Application::theme is now deprecated, please use theme css directly in <head>');
		}

		if(app.config.viewTemplates)
			app.inject.tpl('all.json');

		I18N.configure({
			locale: app.config.i18nLocale,
			resourcePath: app.config.i18nResources,
			translationFile: app.config.i18nTransFile
		});

		//4 Add Navigation
		// Setup the application with content routing (navigation).
		// - use app:navigate (path) at all times when navigate between contexts & views.
		app.onNavigate = function(options, silent){
			if(!app.available()) {
				app.trigger('app:blocked', options);
				return;
			}

			var path = '';
			if(_.isString(options)){
				path = options;
			}else {
				//backward compatibility 
				path = _.string.rtrim([options.context || app.currentContext.name, options.module || options.subpath].join('/'), '/');
			}
			if(silent || app.hybridEvent)
				navigate(path);//hybrid app will navigate using the silent mode.
			else
				window.location.hash = 'navigate/' + path;
		};

		app.onContextGuardError = function(error, ctxName){
			console.error('DEV:Context-Guard-Error:', ctxName, error);
		};

		//---navigation worker---
			function navigate(path){
				path = _.compact(String(path).split('/'));
				if(path.length <= 0) throw new Error('DEV::Application::navigate() Navigation path error');

				var context = path.shift();

				if(!context) throw new Error('DEV::Application::navigate() Empty context name...');
				var TargetContext = app.get(context, 'Context');
				if(!TargetContext) throw new Error('DEV::Application::navigate() You must have the required context ' + context + ' defined...'); //see - special/registry/context.js			
				if(!app.currentContext || app.currentContext.name !== context) {
					
					//re-create target context upon switching
					var targetCtx = new TargetContext(), guardError;

					//allow context to guard itself (e.g for user authentication)
					if(targetCtx.guard) guardError = targetCtx.guard();
					if(guardError) {
						app.trigger('app:context-guard-error', guardError, targetCtx.name);
						return;
					}
					//allow context to check/do certain stuff before navigated to (similar to guard() above)
					if(targetCtx.onBeforeNavigateTo &&  !targetCtx.onBeforeNavigateTo()){
						app.trigger('app:navigation-aborted', targetCtx.name);
						return;
					}

					//save your context state within onNavigateAway()
					if(app.currentContext) app.currentContext.trigger('context:navigate-away'); 
					//prepare and show this new context					
					app.Util.addMetaEvent(targetCtx, 'context');
					var navRegion = app.config.navRegion || app.config.contextRegion;
					var targetRegion = app.mainView.getRegion(navRegion) || app.getRegion(navRegion);
					if(!targetRegion) throw new Error('DEV::Application::navigate() You don\'t have region \'' + navRegion + '\' defined');		
					
					//note that .show() might be async due to region enter/exit effects
					targetCtx.once('show', function(){
						app.currentContext =  targetCtx;
						//fire a notification to app as meta-event.
						app.trigger('app:context-switched', app.currentContext.name);
					});
					targetRegion.show(targetCtx);
				}

				//notify regional views in the context (views further down in the nav chain)
				app.currentContext.trigger('context:navigate-chain', path);

			}
		//-----------------------

		//5 Activate Routing AFTER running all the initializers user has defined
		//Context Switching by Routes (can use href = #navigate/... to trigger them)
		app.on("initialize:after", function(options){
			//init client page router and history:
			var Router = Backbone.Marionette.AppRouter.extend({
				appRoutes: {
					'navigate/*path' : 'navigateTo', //navigate to a context and signal it about *module (can be a path for further navigation within)
				},
				controller: {
					navigateTo: function(path){
						app.navigate(path || app.config.defaultContext, true); //will skip updating #hash since the router is triggered by #hash change.
					},
				}
			});

			app.router = new Router();
			if(Backbone.history)
				Backbone.history.start();

			//Auto-detect and init context (view that replaces the body region)
			if(!window.location.hash){
				if(!app.get(app.config.defaultContext, 'Context'))
					console.warn('DEV::Application:: You might want to define a Default context using app.context(\'Context Name\', {...})');
				else
					app.navigate(app.config.defaultContext);
			}			

		});

		return app;
	};

	/**
	 * Define app starting point function
	 * -----------------------------------------
	 * We support using stage.js in a hybrid app
	 * 
	 */
	app.run = function(hybridEvent){

		hybridEvent = (hybridEvent === true) ? 'deviceready' : hybridEvent;

		function kickstart(){

			//1. check if we need 'fast-click' on mobile plateforms
			if(Modernizr.mobile)
				FastClick.attach(document.body);

			//2. Put main template into position.
			app.addRegions({
				app: '[region="app"]'
			});
			//Warning: calling ensureEl() on the app region will not work like regions in layouts. (Bug??)
			//the additional <div> under the app region is somehow inevitable atm...
			app.trigger('app:before-mainview-ready');
			app.mainView = app.mainView || app.view({
				template: app.config.template
			}, true);
			app.getRegion('app').show(app.mainView);
			app.trigger('app:mainview-ready');

			//3. Start the app --> pre init --> initializers --> post init(router setup)
			app._ensureScreenSize(function(){
				app.start();				
			});

		}

		if(hybridEvent){
			//Mobile development
			app.hybridEvent = hybridEvent; //window.cordova is probably true.
			window.onerror = function(errorMsg, target, lineNum){
				app.trigger('app:error', {
					errorMsg: errorMsg,
					target: target,
					lineNum: lineNum
				});
			};
		    app.onError = function(eMsg, target, lineNum){
		    	//override this to have remote debugging assistant
		        console.error(eMsg, target, lineNum);
		    };
			//!!VERY IMPORTANT!! Disable 'touchmove' on non .scrollable elements
			document.addEventListener("touchmove", function(e) {
			  if (!e.target.classList.contains('scrollable')) {
			    // no more scrolling
			    e.preventDefault();
			  }
			}, false);
			document.addEventListener(hybridEvent, function(){
				$document.ready(kickstart);
			}, false);
		}else
			$document.ready(kickstart);

		return app;

	};

})(Application);




;;(function(app){

	/**
	 * Universal app object creation api entry point
	 * ----------------------------------------------------
	 * @deprecated Use the detailed apis instead.
	 */
	app.create = function(type, config){
		console.warn('DEV::Application::create() method is deprecated, use methods listed in ', app._apis, ' for alternatives');
	};

	/**
	 * Detailed api entry point
	 * ------------------------
	 * If you don't want to use .create() there you go:
	 */
	_.extend(app, {

		//----------------view------------------
		//pass in [name,] options to define (named will be registered)
		//pass in [name] to get (name can be of path form)
		//pass in [name,] options, instance to create (named will be registered again)
		view: function(name /*or options*/, options /*or instance*/){
			if(_.isString(name)){
				if(_.isBoolean(options) && options) return app.Core.View.create(name);
				if(_.isPlainObject(options)) return app.Core.View.register(name, options);
			}

			if(_.isPlainObject(name)){
				var instance = options;
				options = name;
				var Def = options.name ? app.Core.View.register(options) : Backbone.Marionette[options.type || 'Layout'].extend(options);

				if(_.isBoolean(instance) && instance) return new Def();
				return Def;
			}

			return app.Core.View.get(name);
		},

		//pass in [name,] options to register (always requires a name)
		//pass in [name] to get (name can be of path form)
		context: function(name /*or options*/, options){
			if(!options) {
				if(_.isString(name) || !name)
					return app.Core.Context.get(name);
				else
					options = name;
			}
			else
				_.extend(options, {name: name});
			return app.Core.Context.register(options);
		},

		//pass in name, factory to register
		//pass in name, options to create
		//pass in [name] to get (name can be of path form)
		widget: function(name, options /*or factory*/){
			if(!options) return app.Core.Widget.get(name);
			if(_.isFunction(options))
				//register
				return app.Core.Widget.register(name, options);
			return app.Core.Widget.create(name, options);
			//you can not register the definition when providing name, options.
		},

		//pass in name, factory to register
		//pass in name, options to create
		//pass in [name] to get (name can be of path form)
		editor: function(name, options /*or factory*/){
			if(!options) return app.Core.Editor.get(name);
			if(_.isFunction(options))
				//register
				return app.Core.Editor.register(name, options);
			return app.Core.Editor.create(name, options);
			//you can not register the definition when providing name, options.
		},

			//@deprecated---------------------
			regional: function(name, options){
				options = options || {};
				if(_.isString(name))
					_.extend(options, {name: name});
				else
					_.extend(options, name);
				console.warn('DEV::Application::regional() method is deprecated, use .view() instead for', options.name);
				return app.view(options, !options.name);
			},
			//--------------------------------
		
		//(name can be of path form)
		has: function(name, type){
			if(type)
				return app.Core[type] && app.Core[type].has(name);

			_.each(['Context', 'View', 'Widget', 'Editor'], function(t){
				if(!type && app.Core[t].has(name))
					type = t;
			});

			return type;
		},

		//(name can be of path form)
		get: function(name, type, tryAgain){
			if(!name)
				return {
					'Context': app.Core.Context.get(),
					'View': app.Core.View.get(),
					'Widget': app.Core.Widget.get(),
					'Editor': app.Core.Editor.get()
				};

			type = type || 'View';
			var Reusable = app.Core[type] && app.Core[type].get(name);
			if(Reusable)
				return Reusable;
			else {
				//prevent infinite loading when View name is not defined using app.pathToName() rules.
				if(tryAgain) throw new Error('Application::get() Double check your view name defined in ' + app.nameToPath(name) + ' for ' + app.pathToName(name));

				//see if we have app.viewSrcs set to load the View def dynamically
				if(app.config && app.config.viewSrcs){
					$.ajax({
						url: _.compact([app.config.viewSrcs, type.toLowerCase(), app.nameToPath(name)]).join('/') + '.js',
						dataType: 'script',
						async: false
					}).done(function(){
						//console.log('View injected', name, 'from', app.viewSrcs);
						Reusable = true;
					}).fail(function(jqXHR, settings, e){
						throw new Error('DEV::Application::get() can NOT load View definition for', name, '[', e, ']');
					});
				}
			}
			if(Reusable === true)
				return this.get(name, type, true);
			return Reusable;
		},

		coop: function(event, options){
			app.trigger('app:coop', event, options);
			app.trigger('app:coop-' + event, options);
			return app;
		},

		pathToName: function(path){
			if(!_.isString(path)) throw new Error('DEV::Application::pathToName() You must pass in a valid path string.');
			if(_.contains(path, '.')) return path;
			return path.split('/').map(_.string.humanize).map(_.string.classify).join('.');
		},

		nameToPath: function(name){
			if(!_.isString(name)) throw new Error('DEV::Application::nameToPath() You must pass in a Reusable view name.');
			if(_.contains(name, '/')) return name;
			return name.split('.').map(_.string.humanize).map(_.string.slugify).join('/');
		},

		//----------------navigation-----------
		navigate: function(options, silent){
			return app.trigger('app:navigate', options || app.config.defaultContext, silent);
		},	

		//-----------------mutex---------------
		lock: function(topic){
			return app.Core.Lock.lock(topic);
		},

		unlock: function(topic){
			return app.Core.Lock.unlock(topic);
		},

		available: function(topic){
			return app.Core.Lock.available(topic);
		},

		//-----------------remote data------------
		
		//returns jqXHR object (use promise pls)
		remote: function(options /*or url*/, payload, restOpt){
			options = options || {};
			if(options.payload || payload){
				payload = options.payload || payload;
				return app.Core.Remote.change(options, _.extend({payload: payload}, restOpt));
			}
			else
				return app.Core.Remote.get(options, restOpt);
		},
		
		download: function(ticket){
			return app.Util.download(ticket);
		},

		_websockets: {},
		ws: function(socketPath){ //returns a promise, use app.ws().then(function(ws){...});
			if(!Modernizr.websockets) throw new Error('DEV::Application::ws() Websocket is not supported by your browser!');
			socketPath = socketPath || '/ws';
			var d = $.Deferred();
			if(!app._websockets[socketPath]) { 

				app._websockets[socketPath] = new WebSocket("ws://" + location.host + socketPath);
				//events: 'open', 'error', 'close', 'message' = e.data
				//apis: send(), *json(), *channel().payload(), close()

				app._websockets[socketPath].json = function(data){
					app._websockets[socketPath].send(JSON.stringify(data));
				};
				app._websockets[socketPath].channel = function(channel){
					return {
						payload: function(data){
							app._websockets[socketPath].json({
								channel: channel,
								payload: data
							});
						}
					};
				};
				app._websockets[socketPath].onclose = function(){
					app._websockets[socketPath] = undefined;
				};
				app._websockets[socketPath].onopen = function(){
					return d.resolve(app._websockets[socketPath]);
				};

				//empty stub, override this .onmessage
				//Server will always send json string {"channel": "...", "payload": "..."}
				app._websockets[socketPath].onmessage = function(e){
					var data = JSON.parse(e.data);
					app.debug('websocket', socketPath, 'channel', data.channel, 'payload', data.payload);
				};
				
			}else
				d.resolve(app._websockets[socketPath]);
			return d.promise();
		},

		inject: {
			js: function(){
				return app.Util.inject.apply(null, arguments);
			},

			tpl: function(){
				return app.Util.Tpl.remote.load.apply(app.Util.Tpl.remote, arguments);
			},

			css: function(){
				return loadCSS.apply(null, arguments);
			}
		},

		//-----------------local data----------------
		model: function(data){
			return new Backbone.Model(data);
		},

		collection: function(data){
			return new Backbone.Collection(data);
		},

		//selectn
		extract: function(keypath, from){
			return selectn(keypath, from);
		},

		//js-cookie (former jquery-cookie)
		//.set()
		//.get()
		//.remove()
		cookie: Cookies,

		//store.js 
		//.set()
		//.get(), .getAll()
		//.remove()
		//.clear()
		store: store.enabled && store,

		//----------------validation-----------------
		validator: validator,

		//----------------time-----------------------
		moment: moment,

		//----------------url------------------------
		uri: URI,

		param: function(key, defaultVal){
			var params = URI.parseQuery(app.uri(window.location.href).search()) || {};
			if(key) return params[key] || defaultVal;
			return params;
		},
		
		reload: function(){
			window.location.reload();
		},

		//----------------debug----------------------
		debug: function(){
			var fn = console.debug || console.log;
			if(app.param('debug') === 'true')
				fn.apply(null, arguments);
		}
	});

	//editor rules
	app.editor.validator = app.editor.rule = function(name, fn){
		if(!_.isString(name)) throw new Error('DEV::Validator:: You must specify a validator/rule name to use.');
		return app.Core.Editor.addRule(name, fn);
	};

	//alias
	app.page = app.context;
	app.area = app.regional;

	/**
	 * API summary
	 */
	app._apis = [
		'model', 'collection',
		'context - @alias:page', 'regional - @alias:area',
		'view',
		'widget', 'editor', 'editor.validator - @alias:editor.rule',
		'remote',
		'lock', 'unlock', 'available',
		'download',
		'create - @deprecated'
	];

	/**
	 * Statics
	 */
	//animation done events used in Animate.css
	app.ADE = 'webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend';

})(Application);
;/**
 * Util for adding meta-event programming ability to object
 *
 * Currently applied to: Application, Context and View.
 *
 * @author Tim.Liu
 * @created 2014.03.22
 */

;(function(app){

	app.Util.addMetaEvent = function(target, namespace, delegate){
		if(!delegate) delegate = target;
		target.listenTo(target, 'all', function(e){
			var tmp = String(e).split(':');
			if(tmp.length !== 2 || tmp[0] !== namespace) return;
			var listener = _.string.camelize('on-' + tmp[1]);
			if(delegate[listener])
				delegate[listener].apply(target, _.toArray(arguments).slice(1));
		});
	};

})(Application);
;/**
 * Application universal downloader
 *
 * Usage
 * -----
 * 'string' - url
 * 	or
 * {
 * 	 url:
 * 	 ... (rest as url? query strings)
 * }
 *
 * @author Tim.Liu
 * @created 2013.04.01
 * @updated 2013.11.08
 * @updated 2014.03.04
 */
;(function(app){

	function downloader(ticket){
	    var drone = $('#hidden-download-iframe');
	    if(drone.length > 0){
	    }else{
	        $('body').append('<iframe id="hidden-download-iframe" style="display:none"></iframe>');
	        drone = $('#hidden-download-iframe');
	    }
	    
	    if(_.isString(ticket)) ticket = { url: ticket };
	    drone.attr('src', (app.uri(ticket.url || '/').addQuery(_.omit(ticket, 'url'))).toString());
	}

	app.Util.download = downloader;

})(Application);
;/**
 * This is the template builder/registry util, making it easier to create new templates for View objects.
 *
 * Note: use build() for local templates and remote() for remote ones
 *
 * Usage (name as id)
 * -----
 * app.Util.Tpl.build (name, [</>, </>, ...]) / ([</>, </>, ...]) / ('</></>...</>')
 * app.Util.Tpl.remote(name, base) - default on using app.config.viewTemplates as base
 *
 * @author Tim.Liu
 * @create 2013.12.20
 * @updated 2014.10.25
 */

;(function(app){

	var namefix = /[\.\/]/;
	var Template = {

		//normalize the tpl names so they can be used as html tag ids.
		normalizeId: function(name){
			return String(name).split(namefix).join('-');
		},

		cache: Backbone.Marionette.TemplateCache,

		build: function (name, tplString){
			//if(arguments.length === 0 || _.string.trim(name) === '') return {id:'#_blank', tpl: ' '};
			if(arguments.length === 1) {
				//if(_.string.startsWith(name, '#')) return {id: name};
				tplString = name;
				name = null;
				//name = _.uniqueId('tpl-gen-');
				//if(!_.isArray(tplString)) tplString = [tplString];
			}
			var tpl = _.isArray(tplString)?tplString.join(''):tplString;

			if(name) {
				//process name to be valid id string, use String() to force type conversion before using .split()
				var id = this.normalizeId(name);
				var $tag = $('head > script[id="' + id + '"]');
				if($tag.length > 0) {
					//override
					$tag.html(tpl);
					this.cache.clear('#' + name);
					console.warn('DEV::Overriden::Template::', name);
				}
				else $('head').append(['<script type="text/tpl" id="', id, '">', tpl, '</script>'].join(''));
			}

			return tpl;
		},

		//load all prepared/combined templates from server (*.json without CORS)
		//or
		//load individual tpl into (Note: that tplName can be name or path to html) 
		remote: {
			map: {},
			load: function(name, base){
				var that = this;
				var url = (base || app.config.viewTemplates) + '/' + name;
				if(_.string.endsWith(name, '.json')){
					//load all from preped .json
					$.ajax({
						url: url,
						dataType: 'json', //force return data type.
						async: false
					}).done(function(tpls){
						_.each(tpls, function(tpl, name){
							if(that.map[name]){
								//override
								Template.cache.clear('@' + name);
								console.warn('DEV::Overriden::Template::', name);
							}
							that.map[name] = tpl;
						});
					});
				}else {
					//individual tpl
					var result = '';
					$.ajax({
						url: url,
						dataType: 'html',
						async: false
					}).done(function(tpl){
						if(that.map[name]){
							//override
							Template.cache.clear('@' + name);
							console.warn('DEV::Overriden::Template::', name);
						}
						result = that.map[name] = tpl;
					}).fail(function(){
						throw new Error('DEV::Util.Tpl::load() Can not load template...' + url + ', re-check your app.config.viewTemplates setting');
					});
					return result;
				}
			},

			get: function(name){
				if(!name) return _.keys(this.map);
				return this.map[name];
			}
		}

	};

	app.Util.Tpl = Template;

})(Application);

;/**
 * Script injecting util for [batch] reloading certain script[s] without refreshing app.
 *
 * batch mode: use a .json to describe the js listing
 * json format:
 * 1. ["scriptA.js", "lib/scriptB.js", "another-listing.json"]
 * 2. {
 * 		"base": "js",
 * 		"list": [ ... ] //same as 1
 * }
 *
 * @author Tim Liu
 * @created 2014.10.08
 */

;(function(app){

	app.Util.inject = function(url){

		url = url || 'patch.json';

		if(_.string.endsWith(url, '.js')) {
			$.getScript(url);
		}
		else
			$.getJSON(url).done(function(list){
				var base = '';
				if(!_.isArray(list)) {
					base = list.base;
					list = list.list;
				}
				_.each(list, function(js){
					app.Util.inject((_.string.endsWith(base, '/')?base: (!base?'':(base + '/'))) + js);
				});
			});

	};

})(Application);
;/*
 * This is the Remote data interfacing core module of this application framework.
 * (Replacing the old Data API module)
 *
 * options:
 * --------
 * a. url string
 * or 
 * b. object:
 * 	1. + _entity[_id][_method] - string
 *  2. + params(alias:querys) - object
 *  3. + payload - object (payload._id overrides _id)
 *  4. $.ajax options (without -data, -type, -processData, -contentType)
 *
 *  Global CROSSDOMAIN Settings - *Deprecated*: set this in a per-request base or use server side proxy
 *  see MDN - https://developer.mozilla.org/en-US/docs/HTTP/Access_control_CORS
 *  If you ever need crossdomain in development, we recommend that you TURN OFF local server's auth layer/middleware. 
 *  To use crossdomain ajax, in any of your request, add this option:
 *  xdomain: {
 *  	protocol: '', //https or not? default: '' -> http
 *   	host: '127.0.0.1', 
 *   	port: '5000',
 *   	headers: {
 *   		'Credential': 'user:pwd'/'token',
 *   		...
 *  }
 *  Again, it is always better to use server side proxy/forwarding instead of client side x-domain.
 *
 * events:
 * -------
 * app:ajax - change global ajax options here
 * app:ajax-success - single progress
 * app:ajax-error - single progress
 * app:ajax-start - single progress
 * app:ajax-stop - single progress
 * app:ajax-active - overall
 * app:ajax-inactive - overall
 * app:remote-pre-get - fine grind op stub
 * app:remote-pre-change - fine grind op stub
 * 
 * @author Tim.Liu
 * @created 2014.03.24
 */ 

;(function(app, _, $){

	var definition = app.module('Core.Remote');

	function fixOptions(options, restOpt){
		if(!options) throw new Error('DEV::Core.Remote::options empty, you need to pass in at least a url string');
		if(_.isString(options)) 
			options	= _.extend(restOpt || {}, { 
				url: options
			});

		//default options
		_.extend(options, restOpt || {}, {
			type: undefined,
			data: undefined,
			processData: false,
			contentType: 'application/json; charset=UTF-8', // req format
			dataType: 'json', //res format
			timeout: app.config.timeout,
		});

		//process _entity[_id][_method] and strip off options.querys(alias:params)
		if(options.entity || options._entity){
			var entity = options.entity || options._entity;
			options.url = entity;
		}
		if(options.payload && options.payload._id){
			options._id = options.payload._id;
		}
		if(options._id || options._method){
			var url = app.uri(options.url);
			options.url = url.path(_.compact([url.path(), options._id, options._method]).join('/')).toString();
		}
		options.params = options.querys || options.params;
		if(options.params){
			options.url = (app.uri(options.url)).search(options.params).toString();
		}

		app.trigger('app:ajax', options);		
		return options;
	}

	_.extend(definition, {

		//GET
		get: function(options, restOpt){
			options = fixOptions(options, restOpt);
			options.type = 'GET';
			app.trigger('app:remote-pre-get', options);
			return $.ajax(options);
		},

		//POST(no payload._id)/PUT/DELETE(payload = {_id: ...})
		change: function(options, restOpt){
			options = fixOptions(options, restOpt);
			if(!options.payload) throw new Error('DEV::Core.Remote::payload empty, please use GET');
			if(options.payload._id && _.size(options.payload) === 1) options.type = 'DELETE';
			else {
				if(!_.isObject(options.payload)) options.payload = { payload: options.payload };
				if(!options.payload._id) options.type = 'POST';
				else options.type = 'PUT';
			}

			if(options.type !== 'DELETE'){
				//encode payload into json data
				options.data = JSON.stringify(options.payload);
			}

			app.trigger('app:remote-pre-change', options);
			return $.ajax(options);
		}

	});

	//Global jQuery ajax event mappings to app:ajax-* events.
	//swapped!
	$document.ajaxSend(function(e, jqXHR, ajaxOptions) {
		app.trigger('app:ajax-start', e, jqXHR, ajaxOptions);
	});
	//swapped!
	$document.ajaxComplete(function(e, jqXHR, ajaxOptions) {
		app.trigger('app:ajax-stop', e, jqXHR, ajaxOptions);
	});
	//same
	$document.ajaxSuccess(function(e, jqXHR, ajaxOptions, data){
		app.trigger('app:ajax-success', e, jqXHR, ajaxOptions, data);
	});
	//same
	$document.ajaxError(function(e, jqXHR, ajaxOptions, error){
		app.trigger('app:ajax-error', e, jqXHR, ajaxOptions, error);
	});
	//new name!
	$document.ajaxStart(function() {
		app.trigger('app:ajax-active');
	});
	//new name!
	$document.ajaxStop(function() {
		app.trigger('app:ajax-inactive');
	});


	//Global ajax fail handler (common)
	app.ajaxFailed = function(jqXHR, settings, e){
		throw new Error('DEV::Ajax::' + e + ' ' + settings.url);
	};

	//Ajax Options Fix: (baseAjaxURI, CORS and cache)
	app.onAjax = function(options){

		//app.config.baseAjaxURI
		if(app.config.baseAjaxURI)
			options.url = options.url.match(/^[\/\.]/)? options.url : [app.config.baseAjaxURI, options.url].join('/');	

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
		if(Modernizr.ie)
			options.cache = false;
	
	};
	

})(Application, _, jQuery);
;/**
 * Application locking mech for actions, events and <a href> navigations ...
 *
 * Usage
 * -----
 * create (name, number) -- topic and allowance;
 * lock (name) -- 	return true for locking successfully, false otherwise;
 * 					default on creating a (name, 1) lock for unknown name;
 * 					no name means to use the global lock;
 * unlock (name) -- unlock topic, does nothing by default;
 * 					no name means to use the global lock;
 * get(name) -- get specific lock topic info;
 * 				no name means to return all info;
 *
 * @author Tim.Liu
 * @created 2014.08.21
 */

;(function(app){

	var definition = app.module('Core.Lock');
	var locks = {},
	global = false; //true to lock globally, false otherwise.

	_.extend(definition, {
		create: function(topic, allowance){
			if(!_.isString(topic) || !topic) throw new Error('DEV::Core.Lock::create() You must give this lock a name/topic ...');
			if(locks[topic]) return false;

			allowance = _.isNumber(allowance)? (allowance || 1) : 1;
			locks[topic] = {
				current: allowance,
				allowance: allowance
			};
			return true;
		},

		get: function(topic){
			if(!topic || topic === '*') return {
				global: global,
				locks: locks
			};
			else
				return locks[topic];
		},

		//return true/false indicating op successful/unsuccessful
		lock: function(topic){
			if(global) return false;

			if(!topic || topic === '*') {
				//global
				if(!global){ //not locked
					global = true;
					return true;
				}else //locked already
					return false;
			}else {
				if(_.isUndefined(locks[topic])){
					this.create(topic, 1);
					return this.lock(topic);
				}else{
					if(locks[topic].current > 0){
						locks[topic].current --;
						return true;
					}else 
						return false;
				}
			}
		},

		//return nothing...
		unlock: function(topic){
			if(!topic || topic === '*') {
				//global
				if(global){ //locked
					global = false;
				}
			}else {
				if(!_.isUndefined(locks[topic])){
					if(locks[topic].current < locks[topic].allowance)
						locks[topic].current ++;
				}
			}
		},

		available: function(topic){
			if(global) return false;
			
			if(!topic || topic === '*')
				return global === false;
			else {
				var status = this.get(topic);
				if(status) return status.current > 0;
				else return true;
			} 
				
		}
	});



})(Application);
;/**
 * Widget/Editor registry. With a regFacotry to control the registry mech.
 *
 * Important
 * =========
 * Use create() at all times if possible, use get()[deprecated...] definition with caution, instantiate only 1 instance per definition.
 * There is something fishy about the initialize() function (Backbone introduced), events binding only get to execute once with this.listenTo(), if multiple instances of a part
 * listens to a same object's events in their initialize(), only one copy of the group of listeners are active.
 * 
 *
 * @author Tim.Liu
 * @create 2013.11.10
 * @update 2014.03.03
 * @update 2015.07.29 (merged Regional, Context)
 */

(function(_, app, Marionette){

	function makeRegistry(regName){
		regName = _.string.classify(regName);
		var manager = app.module('Core.' + regName);
		_.extend(manager, {

			map: {},
			has: function(name /*or path*/){
				if(!_.isString(name) || !name) throw new Error('DEV::Reusable::has() You must specify the name of the ' + regName + ' to look for.');
				name = app.pathToName(name);
				if(this.map[name]) return name;
				return undefined;
			},

			//no auto pathToName conversion
			register: function(name /*or options*/, factory /*or options or none*/){

				//type 1: options only
				var options;
				if(_.isPlainObject(name)){
					options = name;
					name = options.name;
					_.extend(/*{
						...
					},*/ options, {
						className: regName.toLowerCase() + ' ' + _.string.slugify(regName + '-' + options.name) + ' ' + (options.className || ''),
						category: regName
					});
					factory = function(){
						return Marionette[options.type || 'Layout'].extend(options);
					};
				}

				//type 2: name and options
				else if(_.isPlainObject(factory)){
					options = _.extend({name: name}, factory);
					factory = function(){
						return Marionette[options.type || 'Layout'].extend(options);
					};
				}

				//type 3: name and a factory func (won't have preset className & category)
				if(!_.isString(name) || !name) throw new Error('DEV::Reusable::register() You must specify a ' + regName + ' name to register.');
				if(!_.isFunction(factory)) throw new Error('DEV::Reusable::register() You must specify a ' + regName + ' factory function to register ' + name + ' !');

				if(this.has(name))
					console.warn('DEV::Overriden::Reusable ' + regName + '.' + name);
				this.map[name] = factory();
				this.map[name].prototype.name = name;

				//fire the coop event (e.g for auto menu entry injection)
				app.trigger('app:reusable-registered', this.map[name], regName);
				app.coop('reusable-registered', this.map[name], regName);
				return this.map[name];

			},

			create: function(name /*or path*/, options){
				if(!_.isString(name) || !name) throw new Error('DEV::Reusable::create() You must specify the name of the ' + regName + ' to create.');
				var Reusable = this.get(name);
				if(Reusable)
					return new Reusable(options || {});
				throw new Error('DEV::Reusable::create() Required definition [' + name + '] in ' + regName + ' not found...');
			},

			get: function(name /*or path*/){
				if(!name) return _.keys(this.map);
				name = this.has(name);
				if(name)
					return this.map[name];
			},

			alter: function(name /*or path*/, options){
				var Reusable = this.get(name);
				if(Reusable){
					Reusable = Reusable.extend(options);
					return Reusable;
				}
				throw new Error('DEV::Reusable::alter() Required definition [' + name + '] in ' + regName + ' not found...');
			}

		});

		return manager;

	}

	makeRegistry('Context'); //top level views (see infrastructure: navigation worker)
	makeRegistry('Regional'); //general named views (e.g a form, a chart, a list, a customized detail)
	app.Core.View = app.Core.Regional; //alias
	makeRegistry('Widget'); //specialized named views (e.g a datagrid, a menu, ..., see reusable/widgets)
	makeRegistry('Editor'); //specialized small views used in form views (see reusable/editors, lib+-/marionette/item-view,layout)

})(_, Application, Marionette);
;(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
window.Backbone = window.Backbone || {};
window.Backbone.DeepModel = require('.');

},{".":20}],2:[function(require,module,exports){
/**
 * lodash 3.0.3 (Custom Build) <https://lodash.com/>
 * Build: `lodash modern modularize exports="npm" -o ./`
 * Copyright 2012-2015 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.8.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2015 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <https://lodash.com/license>
 */
var arrayCopy = require('lodash._arraycopy'),
    arrayEach = require('lodash._arrayeach'),
    baseFor = require('lodash._basefor'),
    createAssigner = require('lodash._createassigner'),
    isArguments = require('lodash.isarguments'),
    isArray = require('lodash.isarray'),
    isPlainObject = require('lodash.isplainobject'),
    isTypedArray = require('lodash.istypedarray'),
    keys = require('lodash.keys'),
    toPlainObject = require('lodash.toplainobject');

/**
 * Checks if `value` is object-like.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
 */
function isObjectLike(value) {
  return (value && typeof value == 'object') || false;
}

/**
 * Used as the maximum length of an array-like value.
 * See the [ES spec](https://people.mozilla.org/~jorendorff/es6-draft.html#sec-number.max_safe_integer)
 * for more details.
 */
var MAX_SAFE_INTEGER = Math.pow(2, 53) - 1;

/**
 * The base implementation of `_.forOwn` without support for callback
 * shorthands and `this` binding.
 *
 * @private
 * @param {Object} object The object to iterate over.
 * @param {Function} iteratee The function invoked per iteration.
 * @returns {Object} Returns `object`.
 */
function baseForOwn(object, iteratee) {
  return baseFor(object, iteratee, keys);
}

/**
 * The base implementation of `_.merge` without support for argument juggling,
 * multiple sources, and `this` binding `customizer` functions.
 *
 * @private
 * @param {Object} object The destination object.
 * @param {Object} source The source object.
 * @param {Function} [customizer] The function to customize merging properties.
 * @param {Array} [stackA=[]] Tracks traversed source objects.
 * @param {Array} [stackB=[]] Associates values with source counterparts.
 * @returns {Object} Returns the destination object.
 */
function baseMerge(object, source, customizer, stackA, stackB) {
  if (!isObject(object)) {
    return object;
  }
  var isSrcArr = isLength(source.length) && (isArray(source) || isTypedArray(source));
  (isSrcArr ? arrayEach : baseForOwn)(source, function(srcValue, key, source) {
    if (isObjectLike(srcValue)) {
      stackA || (stackA = []);
      stackB || (stackB = []);
      return baseMergeDeep(object, source, key, baseMerge, customizer, stackA, stackB);
    }
    var value = object[key],
        result = customizer ? customizer(value, srcValue, key, object, source) : undefined,
        isCommon = typeof result == 'undefined';

    if (isCommon) {
      result = srcValue;
    }
    if ((isSrcArr || typeof result != 'undefined') &&
        (isCommon || (result === result ? (result !== value) : (value === value)))) {
      object[key] = result;
    }
  });
  return object;
}

/**
 * A specialized version of `baseMerge` for arrays and objects which performs
 * deep merges and tracks traversed objects enabling objects with circular
 * references to be merged.
 *
 * @private
 * @param {Object} object The destination object.
 * @param {Object} source The source object.
 * @param {string} key The key of the value to merge.
 * @param {Function} mergeFunc The function to merge values.
 * @param {Function} [customizer] The function to customize merging properties.
 * @param {Array} [stackA=[]] Tracks traversed source objects.
 * @param {Array} [stackB=[]] Associates values with source counterparts.
 * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
 */
function baseMergeDeep(object, source, key, mergeFunc, customizer, stackA, stackB) {
  var length = stackA.length,
      srcValue = source[key];

  while (length--) {
    if (stackA[length] == srcValue) {
      object[key] = stackB[length];
      return;
    }
  }
  var value = object[key],
      result = customizer ? customizer(value, srcValue, key, object, source) : undefined,
      isCommon = typeof result == 'undefined';

  if (isCommon) {
    result = srcValue;
    if (isLength(srcValue.length) && (isArray(srcValue) || isTypedArray(srcValue))) {
      result = isArray(value)
        ? value
        : (value ? arrayCopy(value) : []);
    }
    else if (isPlainObject(srcValue) || isArguments(srcValue)) {
      result = isArguments(value)
        ? toPlainObject(value)
        : (isPlainObject(value) ? value : {});
    }
    else {
      isCommon = false;
    }
  }
  // Add the source value to the stack of traversed objects and associate
  // it with its merged value.
  stackA.push(srcValue);
  stackB.push(result);

  if (isCommon) {
    // Recursively merge objects and arrays (susceptible to call stack limits).
    object[key] = mergeFunc(result, srcValue, customizer, stackA, stackB);
  } else if (result === result ? (result !== value) : (value === value)) {
    object[key] = result;
  }
}

/**
 * Checks if `value` is a valid array-like length.
 *
 * **Note:** This function is based on ES `ToLength`. See the
 * [ES spec](https://people.mozilla.org/~jorendorff/es6-draft.html#sec-tolength)
 * for more details.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a valid length, else `false`.
 */
function isLength(value) {
  return typeof value == 'number' && value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
}

/**
 * Checks if `value` is the language type of `Object`.
 * (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
 *
 * **Note:** See the [ES5 spec](https://es5.github.io/#x8) for more details.
 *
 * @static
 * @memberOf _
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
 * @example
 *
 * _.isObject({});
 * // => true
 *
 * _.isObject([1, 2, 3]);
 * // => true
 *
 * _.isObject(1);
 * // => false
 */
function isObject(value) {
  // Avoid a V8 JIT bug in Chrome 19-20.
  // See https://code.google.com/p/v8/issues/detail?id=2291 for more details.
  var type = typeof value;
  return type == 'function' || (value && type == 'object') || false;
}

/**
 * Recursively merges own enumerable properties of the source object(s), that
 * don't resolve to `undefined` into the destination object. Subsequent sources
 * overwrite property assignments of previous sources. If `customizer` is
 * provided it is invoked to produce the merged values of the destination and
 * source properties. If `customizer` returns `undefined` merging is handled
 * by the method instead. The `customizer` is bound to `thisArg` and invoked
 * with five arguments; (objectValue, sourceValue, key, object, source).
 *
 * @static
 * @memberOf _
 * @category Object
 * @param {Object} object The destination object.
 * @param {...Object} [sources] The source objects.
 * @param {Function} [customizer] The function to customize merging properties.
 * @param {*} [thisArg] The `this` binding of `customizer`.
 * @returns {Object} Returns `object`.
 * @example
 *
 * var users = {
 *   'data': [{ 'user': 'barney' }, { 'user': 'fred' }]
 * };
 *
 * var ages = {
 *   'data': [{ 'age': 36 }, { 'age': 40 }]
 * };
 *
 * _.merge(users, ages);
 * // => { 'data': [{ 'user': 'barney', 'age': 36 }, { 'user': 'fred', 'age': 40 }] }
 *
 * // using a customizer callback
 * var object = {
 *   'fruits': ['apple'],
 *   'vegetables': ['beet']
 * };
 *
 * var other = {
 *   'fruits': ['banana'],
 *   'vegetables': ['carrot']
 * };
 *
 * _.merge(object, other, function(a, b) {
 *   if (_.isArray(a)) {
 *     return a.concat(b);
 *   }
 * });
 * // => { 'fruits': ['apple', 'banana'], 'vegetables': ['beet', 'carrot'] }
 */
var merge = createAssigner(baseMerge);

module.exports = merge;

},{"lodash._arraycopy":3,"lodash._arrayeach":4,"lodash._basefor":5,"lodash._createassigner":6,"lodash.isarguments":9,"lodash.isarray":10,"lodash.isplainobject":11,"lodash.istypedarray":14,"lodash.keys":15,"lodash.toplainobject":17}],3:[function(require,module,exports){
/**
 * lodash 3.0.0 (Custom Build) <https://lodash.com/>
 * Build: `lodash modern modularize exports="npm" -o ./`
 * Copyright 2012-2015 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.7.0 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2015 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <https://lodash.com/license>
 */

/**
 * Copies the values of `source` to `array`.
 *
 * @private
 * @param {Array} source The array to copy values from.
 * @param {Array} [array=[]] The array to copy values to.
 * @returns {Array} Returns `array`.
 */
function arrayCopy(source, array) {
  var index = -1,
      length = source.length;

  array || (array = Array(length));
  while (++index < length) {
    array[index] = source[index];
  }
  return array;
}

module.exports = arrayCopy;

},{}],4:[function(require,module,exports){
/**
 * lodash 3.0.0 (Custom Build) <https://lodash.com/>
 * Build: `lodash modern modularize exports="npm" -o ./`
 * Copyright 2012-2015 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.7.0 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2015 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <https://lodash.com/license>
 */

/**
 * A specialized version of `_.forEach` for arrays without support for callback
 * shorthands or `this` binding.
 *
 * @private
 * @param {Array} array The array to iterate over.
 * @param {Function} iteratee The function invoked per iteration.
 * @returns {Array} Returns `array`.
 */
function arrayEach(array, iteratee) {
  var index = -1,
      length = array.length;

  while (++index < length) {
    if (iteratee(array[index], index, array) === false) {
      break;
    }
  }
  return array;
}

module.exports = arrayEach;

},{}],5:[function(require,module,exports){
/**
 * lodash 3.0.0 (Custom Build) <https://lodash.com/>
 * Build: `lodash modern modularize exports="npm" -o ./`
 * Copyright 2012-2015 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.7.0 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2015 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <https://lodash.com/license>
 */

/**
 * The base implementation of `baseForIn` and `baseForOwn` which iterates
 * over `object` properties returned by `keysFunc` invoking `iteratee` for
 * each property. Iterator functions may exit iteration early by explicitly
 * returning `false`.
 *
 * @private
 * @param {Object} object The object to iterate over.
 * @param {Function} iteratee The function invoked per iteration.
 * @param {Function} keysFunc The function to get the keys of `object`.
 * @returns {Object} Returns `object`.
 */
function baseFor(object, iteratee, keysFunc) {
  var index = -1,
      iterable = toObject(object),
      props = keysFunc(object),
      length = props.length;

  while (++index < length) {
    var key = props[index];
    if (iteratee(iterable[key], key, iterable) === false) {
      break;
    }
  }
  return object;
}

/**
 * Converts `value` to an object if it is not one.
 *
 * @private
 * @param {*} value The value to process.
 * @returns {Object} Returns the object.
 */
function toObject(value) {
  return isObject(value) ? value : Object(value);
}

/**
 * Checks if `value` is the language type of `Object`.
 * (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
 *
 * **Note:** See the [ES5 spec](https://es5.github.io/#x8) for more details.
 *
 * @static
 * @memberOf _
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
 * @example
 *
 * _.isObject({});
 * // => true
 *
 * _.isObject([1, 2, 3]);
 * // => true
 *
 * _.isObject(1);
 * // => false
 */
function isObject(value) {
  // Avoid a V8 JIT bug in Chrome 19-20.
  // See https://code.google.com/p/v8/issues/detail?id=2291 for more details.
  var type = typeof value;
  return type == 'function' || (value && type == 'object') || false;
}

module.exports = baseFor;

},{}],6:[function(require,module,exports){
/**
 * lodash 3.0.1 (Custom Build) <https://lodash.com/>
 * Build: `lodash modern modularize exports="npm" -o ./`
 * Copyright 2012-2015 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.8.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2015 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <https://lodash.com/license>
 */
var bindCallback = require('lodash._bindcallback'),
    isIterateeCall = require('lodash._isiterateecall');

/**
 * Creates a function that assigns properties of source object(s) to a given
 * destination object.
 *
 * @private
 * @param {Function} assigner The function to assign values.
 * @returns {Function} Returns the new assigner function.
 */
function createAssigner(assigner) {
  return function() {
    var args = arguments,
        length = args.length,
        object = args[0];

    if (length < 2 || object == null) {
      return object;
    }
    var customizer = args[length - 2],
        thisArg = args[length - 1],
        guard = args[3];

    if (length > 3 && typeof customizer == 'function') {
      customizer = bindCallback(customizer, thisArg, 5);
      length -= 2;
    } else {
      customizer = (length > 2 && typeof thisArg == 'function') ? thisArg : null;
      length -= (customizer ? 1 : 0);
    }
    if (guard && isIterateeCall(args[1], args[2], guard)) {
      customizer = length == 3 ? null : customizer;
      length = 2;
    }
    var index = 0;
    while (++index < length) {
      var source = args[index];
      if (source) {
        assigner(object, source, customizer);
      }
    }
    return object;
  };
}

module.exports = createAssigner;

},{"lodash._bindcallback":7,"lodash._isiterateecall":8}],7:[function(require,module,exports){
/**
 * lodash 3.0.0 (Custom Build) <https://lodash.com/>
 * Build: `lodash modern modularize exports="npm" -o ./`
 * Copyright 2012-2015 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.7.0 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2015 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <https://lodash.com/license>
 */

/**
 * A specialized version of `baseCallback` which only supports `this` binding
 * and specifying the number of arguments to provide to `func`.
 *
 * @private
 * @param {Function} func The function to bind.
 * @param {*} thisArg The `this` binding of `func`.
 * @param {number} [argCount] The number of arguments to provide to `func`.
 * @returns {Function} Returns the callback.
 */
function bindCallback(func, thisArg, argCount) {
  if (typeof func != 'function') {
    return identity;
  }
  if (typeof thisArg == 'undefined') {
    return func;
  }
  switch (argCount) {
    case 1: return function(value) {
      return func.call(thisArg, value);
    };
    case 3: return function(value, index, collection) {
      return func.call(thisArg, value, index, collection);
    };
    case 4: return function(accumulator, value, index, collection) {
      return func.call(thisArg, accumulator, value, index, collection);
    };
    case 5: return function(value, other, key, object, source) {
      return func.call(thisArg, value, other, key, object, source);
    };
  }
  return function() {
    return func.apply(thisArg, arguments);
  };
}

/**
 * This method returns the first argument provided to it.
 *
 * @static
 * @memberOf _
 * @category Utility
 * @param {*} value Any value.
 * @returns {*} Returns `value`.
 * @example
 *
 * var object = { 'user': 'fred' };
 * _.identity(object) === object;
 * // => true
 */
function identity(value) {
  return value;
}

module.exports = bindCallback;

},{}],8:[function(require,module,exports){
/**
 * lodash 3.0.4 (Custom Build) <https://lodash.com/>
 * Build: `lodash modern modularize exports="npm" -o ./`
 * Copyright 2012-2015 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.8.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2015 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <https://lodash.com/license>
 */

/**
 * Used as the maximum length of an array-like value.
 * See the [ES spec](https://people.mozilla.org/~jorendorff/es6-draft.html#sec-number.max_safe_integer)
 * for more details.
 */
var MAX_SAFE_INTEGER = Math.pow(2, 53) - 1;

/**
 * Checks if `value` is a valid array-like index.
 *
 * @private
 * @param {*} value The value to check.
 * @param {number} [length=MAX_SAFE_INTEGER] The upper bounds of a valid index.
 * @returns {boolean} Returns `true` if `value` is a valid index, else `false`.
 */
function isIndex(value, length) {
  value = +value;
  length = length == null ? MAX_SAFE_INTEGER : length;
  return value > -1 && value % 1 == 0 && value < length;
}

/**
 * Checks if the provided arguments are from an iteratee call.
 *
 * @private
 * @param {*} value The potential iteratee value argument.
 * @param {*} index The potential iteratee index or key argument.
 * @param {*} object The potential iteratee object argument.
 * @returns {boolean} Returns `true` if the arguments are from an iteratee call, else `false`.
 */
function isIterateeCall(value, index, object) {
  if (!isObject(object)) {
    return false;
  }
  var type = typeof index;
  if (type == 'number') {
    var length = object.length,
        prereq = isLength(length) && isIndex(index, length);
  } else {
    prereq = type == 'string' && index in object;
  }
  if (prereq) {
    var other = object[index];
    return value === value ? (value === other) : (other !== other);
  }
  return false;
}

/**
 * Checks if `value` is a valid array-like length.
 *
 * **Note:** This function is based on ES `ToLength`. See the
 * [ES spec](https://people.mozilla.org/~jorendorff/es6-draft.html#sec-tolength)
 * for more details.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a valid length, else `false`.
 */
function isLength(value) {
  return typeof value == 'number' && value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
}

/**
 * Checks if `value` is the language type of `Object`.
 * (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
 *
 * **Note:** See the [ES5 spec](https://es5.github.io/#x8) for more details.
 *
 * @static
 * @memberOf _
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
 * @example
 *
 * _.isObject({});
 * // => true
 *
 * _.isObject([1, 2, 3]);
 * // => true
 *
 * _.isObject(1);
 * // => false
 */
function isObject(value) {
  // Avoid a V8 JIT bug in Chrome 19-20.
  // See https://code.google.com/p/v8/issues/detail?id=2291 for more details.
  var type = typeof value;
  return type == 'function' || (value && type == 'object') || false;
}

module.exports = isIterateeCall;

},{}],9:[function(require,module,exports){
/**
 * lodash 3.0.0 (Custom Build) <https://lodash.com/>
 * Build: `lodash modern modularize exports="npm" -o ./`
 * Copyright 2012-2015 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.7.0 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2015 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <https://lodash.com/license>
 */

/** `Object#toString` result references. */
var argsTag = '[object Arguments]';

/**
 * Checks if `value` is object-like.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
 */
function isObjectLike(value) {
  return (value && typeof value == 'object') || false;
}

/** Used for native method references. */
var objectProto = Object.prototype;

/**
 * Used to resolve the `toStringTag` of values.
 * See the [ES spec](https://people.mozilla.org/~jorendorff/es6-draft.html#sec-object.prototype.tostring)
 * for more details.
 */
var objToString = objectProto.toString;

/**
 * Used as the maximum length of an array-like value.
 * See the [ES spec](https://people.mozilla.org/~jorendorff/es6-draft.html#sec-tolength)
 * for more details.
 */
var MAX_SAFE_INTEGER = Math.pow(2, 53) - 1;

/**
 * Checks if `value` is a valid array-like length.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a valid length, else `false`.
 */
function isLength(value) {
  return typeof value == 'number' && value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
}

/**
 * Checks if `value` is classified as an `arguments` object.
 *
 * @static
 * @memberOf _
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is correctly classified, else `false`.
 * @example
 *
 * (function() { return _.isArguments(arguments); })();
 * // => true
 *
 * _.isArguments([1, 2, 3]);
 * // => false
 */
function isArguments(value) {
  var length = isObjectLike(value) ? value.length : undefined;
  return (isLength(length) && objToString.call(value) == argsTag) || false;
}

module.exports = isArguments;

},{}],10:[function(require,module,exports){
/**
 * lodash 3.0.0 (Custom Build) <https://lodash.com/>
 * Build: `lodash modern modularize exports="npm" -o ./`
 * Copyright 2012-2015 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.7.0 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2015 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <https://lodash.com/license>
 */

/** `Object#toString` result references. */
var arrayTag = '[object Array]',
    funcTag = '[object Function]';

/** Used to detect host constructors (Safari > 5). */
var reHostCtor = /^\[object .+?Constructor\]$/;

/**
 * Used to match `RegExp` special characters.
 * See this [article on `RegExp` characters](http://www.regular-expressions.info/characters.html#special)
 * for more details.
 */
var reRegExpChars = /[.*+?^${}()|[\]\/\\]/g,
    reHasRegExpChars = RegExp(reRegExpChars.source);

/**
 * Converts `value` to a string if it is not one. An empty string is returned
 * for `null` or `undefined` values.
 *
 * @private
 * @param {*} value The value to process.
 * @returns {string} Returns the string.
 */
function baseToString(value) {
  if (typeof value == 'string') {
    return value;
  }
  return value == null ? '' : (value + '');
}

/**
 * Checks if `value` is object-like.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
 */
function isObjectLike(value) {
  return (value && typeof value == 'object') || false;
}

/** Used for native method references. */
var objectProto = Object.prototype;

/** Used to resolve the decompiled source of functions. */
var fnToString = Function.prototype.toString;

/**
 * Used to resolve the `toStringTag` of values.
 * See the [ES spec](https://people.mozilla.org/~jorendorff/es6-draft.html#sec-object.prototype.tostring)
 * for more details.
 */
var objToString = objectProto.toString;

/** Used to detect if a method is native. */
var reNative = RegExp('^' +
  escapeRegExp(objToString)
  .replace(/toString|(function).*?(?=\\\()| for .+?(?=\\\])/g, '$1.*?') + '$'
);

/* Native method references for those with the same name as other `lodash` methods. */
var nativeIsArray = isNative(nativeIsArray = Array.isArray) && nativeIsArray;

/**
 * Used as the maximum length of an array-like value.
 * See the [ES spec](https://people.mozilla.org/~jorendorff/es6-draft.html#sec-tolength)
 * for more details.
 */
var MAX_SAFE_INTEGER = Math.pow(2, 53) - 1;

/**
 * Checks if `value` is a valid array-like length.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a valid length, else `false`.
 */
function isLength(value) {
  return typeof value == 'number' && value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
}

/**
 * Checks if `value` is classified as an `Array` object.
 *
 * @static
 * @memberOf _
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is correctly classified, else `false`.
 * @example
 *
 * _.isArray([1, 2, 3]);
 * // => true
 *
 * (function() { return _.isArray(arguments); })();
 * // => false
 */
var isArray = nativeIsArray || function(value) {
  return (isObjectLike(value) && isLength(value.length) && objToString.call(value) == arrayTag) || false;
};

/**
 * Checks if `value` is a native function.
 *
 * @static
 * @memberOf _
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a native function, else `false`.
 * @example
 *
 * _.isNative(Array.prototype.push);
 * // => true
 *
 * _.isNative(_);
 * // => false
 */
function isNative(value) {
  if (value == null) {
    return false;
  }
  if (objToString.call(value) == funcTag) {
    return reNative.test(fnToString.call(value));
  }
  return (isObjectLike(value) && reHostCtor.test(value)) || false;
}

/**
 * Escapes the `RegExp` special characters "\", "^", "$", ".", "|", "?", "*",
 * "+", "(", ")", "[", "]", "{" and "}" in `string`.
 *
 * @static
 * @memberOf _
 * @category String
 * @param {string} [string=''] The string to escape.
 * @returns {string} Returns the escaped string.
 * @example
 *
 * _.escapeRegExp('[lodash](https://lodash.com/)');
 * // => '\[lodash\]\(https://lodash\.com/\)'
 */
function escapeRegExp(string) {
  string = baseToString(string);
  return (string && reHasRegExpChars.test(string))
    ? string.replace(reRegExpChars, '\\$&')
    : string;
}

module.exports = isArray;

},{}],11:[function(require,module,exports){
/**
 * lodash 3.0.0 (Custom Build) <https://lodash.com/>
 * Build: `lodash modern modularize exports="npm" -o ./`
 * Copyright 2012-2015 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.7.0 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2015 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <https://lodash.com/license>
 */
var baseFor = require('lodash._basefor'),
    isNative = require('lodash.isnative'),
    keysIn = require('lodash.keysin');

/** `Object#toString` result references. */
var objectTag = '[object Object]';

/**
 * Checks if `value` is object-like.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
 */
function isObjectLike(value) {
  return (value && typeof value == 'object') || false;
}

/** Used for native method references. */
var objectProto = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/**
 * Used to resolve the `toStringTag` of values.
 * See the [ES spec](https://people.mozilla.org/~jorendorff/es6-draft.html#sec-object.prototype.tostring)
 * for more details.
 */
var objToString = objectProto.toString;

/** Native method references. */
var getPrototypeOf = isNative(getPrototypeOf = Object.getPrototypeOf) && getPrototypeOf;

/**
 * The base implementation of `_.forIn` without support for callback
 * shorthands and `this` binding.
 *
 * @private
 * @param {Object} object The object to iterate over.
 * @param {Function} iteratee The function invoked per iteration.
 * @returns {Object} Returns `object`.
 */
function baseForIn(object, iteratee) {
  return baseFor(object, iteratee, keysIn);
}

/**
 * A fallback implementation of `_.isPlainObject` which checks if `value`
 * is an object created by the `Object` constructor or has a `[[Prototype]]`
 * of `null`.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a plain object, else `false`.
 */
function shimIsPlainObject(value) {
  var Ctor;

  // Exit early for non `Object` objects.
  if (!(isObjectLike(value) && objToString.call(value) == objectTag) ||
      (!hasOwnProperty.call(value, 'constructor') &&
        (Ctor = value.constructor, typeof Ctor == 'function' && !(Ctor instanceof Ctor)))) {
    return false;
  }
  // IE < 9 iterates inherited properties before own properties. If the first
  // iterated property is an object's own property then there are no inherited
  // enumerable properties.
  var result;
  // In most environments an object's own properties are iterated before
  // its inherited properties. If the last iterated property is an object's
  // own property then there are no inherited enumerable properties.
  baseForIn(value, function(subValue, key) {
    result = key;
  });
  return typeof result == 'undefined' || hasOwnProperty.call(value, result);
}

/**
 * Checks if `value` is a plain object, that is, an object created by the
 * `Object` constructor or one with a `[[Prototype]]` of `null`.
 *
 * **Note:** This method assumes objects created by the `Object` constructor
 * have no inherited enumerable properties.
 *
 * @static
 * @memberOf _
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a plain object, else `false`.
 * @example
 *
 * function Foo() {
 *   this.a = 1;
 * }
 *
 * _.isPlainObject(new Foo);
 * // => false
 *
 * _.isPlainObject([1, 2, 3]);
 * // => false
 *
 * _.isPlainObject({ 'x': 0, 'y': 0 });
 * // => true
 *
 * _.isPlainObject(Object.create(null));
 * // => true
 */
var isPlainObject = !getPrototypeOf ? shimIsPlainObject : function(value) {
  if (!(value && objToString.call(value) == objectTag)) {
    return false;
  }
  var valueOf = value.valueOf,
      objProto = isNative(valueOf) && (objProto = getPrototypeOf(valueOf)) && getPrototypeOf(objProto);

  return objProto
    ? (value == objProto || getPrototypeOf(value) == objProto)
    : shimIsPlainObject(value);
};

module.exports = isPlainObject;

},{"lodash._basefor":5,"lodash.isnative":12,"lodash.keysin":13}],12:[function(require,module,exports){
/**
 * lodash 3.0.0 (Custom Build) <https://lodash.com/>
 * Build: `lodash modern modularize exports="npm" -o ./`
 * Copyright 2012-2015 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.7.0 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2015 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <https://lodash.com/license>
 */

/** `Object#toString` result references. */
var funcTag = '[object Function]';

/** Used to detect host constructors (Safari > 5). */
var reHostCtor = /^\[object .+?Constructor\]$/;

/**
 * Used to match `RegExp` special characters.
 * See this [article on `RegExp` characters](http://www.regular-expressions.info/characters.html#special)
 * for more details.
 */
var reRegExpChars = /[.*+?^${}()|[\]\/\\]/g,
    reHasRegExpChars = RegExp(reRegExpChars.source);

/**
 * Converts `value` to a string if it is not one. An empty string is returned
 * for `null` or `undefined` values.
 *
 * @private
 * @param {*} value The value to process.
 * @returns {string} Returns the string.
 */
function baseToString(value) {
  if (typeof value == 'string') {
    return value;
  }
  return value == null ? '' : (value + '');
}

/**
 * Checks if `value` is object-like.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
 */
function isObjectLike(value) {
  return (value && typeof value == 'object') || false;
}

/** Used for native method references. */
var objectProto = Object.prototype;

/** Used to resolve the decompiled source of functions. */
var fnToString = Function.prototype.toString;

/**
 * Used to resolve the `toStringTag` of values.
 * See the [ES spec](https://people.mozilla.org/~jorendorff/es6-draft.html#sec-object.prototype.tostring)
 * for more details.
 */
var objToString = objectProto.toString;

/** Used to detect if a method is native. */
var reNative = RegExp('^' +
  escapeRegExp(objToString)
  .replace(/toString|(function).*?(?=\\\()| for .+?(?=\\\])/g, '$1.*?') + '$'
);

/**
 * Checks if `value` is a native function.
 *
 * @static
 * @memberOf _
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a native function, else `false`.
 * @example
 *
 * _.isNative(Array.prototype.push);
 * // => true
 *
 * _.isNative(_);
 * // => false
 */
function isNative(value) {
  if (value == null) {
    return false;
  }
  if (objToString.call(value) == funcTag) {
    return reNative.test(fnToString.call(value));
  }
  return (isObjectLike(value) && reHostCtor.test(value)) || false;
}

/**
 * Escapes the `RegExp` special characters "\", "^", "$", ".", "|", "?", "*",
 * "+", "(", ")", "[", "]", "{" and "}" in `string`.
 *
 * @static
 * @memberOf _
 * @category String
 * @param {string} [string=''] The string to escape.
 * @returns {string} Returns the escaped string.
 * @example
 *
 * _.escapeRegExp('[lodash](https://lodash.com/)');
 * // => '\[lodash\]\(https://lodash\.com/\)'
 */
function escapeRegExp(string) {
  string = baseToString(string);
  return (string && reHasRegExpChars.test(string))
    ? string.replace(reRegExpChars, '\\$&')
    : string;
}

module.exports = isNative;

},{}],13:[function(require,module,exports){
/**
 * lodash 3.0.3 (Custom Build) <https://lodash.com/>
 * Build: `lodash modern modularize exports="npm" -o ./`
 * Copyright 2012-2015 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.7.0 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2015 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <https://lodash.com/license>
 */
var isArguments = require('lodash.isarguments'),
    isArray = require('lodash.isarray');

/** Used for native method references. */
var objectProto = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/** Native method references. */
var propertyIsEnumerable = objectProto.propertyIsEnumerable;

/**
 * Used as the maximum length of an array-like value.
 * See the [ES spec](https://people.mozilla.org/~jorendorff/es6-draft.html#sec-number.max_safe_integer)
 * for more details.
 */
var MAX_SAFE_INTEGER = Math.pow(2, 53) - 1;

/**
 * An object environment feature flags.
 *
 * @static
 * @memberOf _
 * @type Object
 */
var support = {};

(function(x) {

  /**
   * Detect if `arguments` object indexes are non-enumerable.
   *
   * In Firefox < 4, IE < 9, PhantomJS, and Safari < 5.1 `arguments` object
   * indexes are non-enumerable. Chrome < 25 and Node.js < 0.11.0 treat
   * `arguments` object indexes as non-enumerable and fail `hasOwnProperty`
   * checks for indexes that exceed their function's formal parameters with
   * associated values of `0`.
   *
   * @memberOf _.support
   * @type boolean
   */
  try {
    support.nonEnumArgs = !propertyIsEnumerable.call(arguments, 1);
  } catch(e) {
    support.nonEnumArgs = true;
  }
}(0, 0));

/**
 * Checks if `value` is a valid array-like index.
 *
 * @private
 * @param {*} value The value to check.
 * @param {number} [length=MAX_SAFE_INTEGER] The upper bounds of a valid index.
 * @returns {boolean} Returns `true` if `value` is a valid index, else `false`.
 */
function isIndex(value, length) {
  value = +value;
  length = length == null ? MAX_SAFE_INTEGER : length;
  return value > -1 && value % 1 == 0 && value < length;
}

/**
 * Checks if `value` is a valid array-like length.
 *
 * **Note:** This function is based on ES `ToLength`. See the
 * [ES spec](https://people.mozilla.org/~jorendorff/es6-draft.html#sec-tolength)
 * for more details.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a valid length, else `false`.
 */
function isLength(value) {
  return typeof value == 'number' && value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
}

/**
 * Checks if `value` is the language type of `Object`.
 * (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
 *
 * **Note:** See the [ES5 spec](https://es5.github.io/#x8) for more details.
 *
 * @static
 * @memberOf _
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
 * @example
 *
 * _.isObject({});
 * // => true
 *
 * _.isObject([1, 2, 3]);
 * // => true
 *
 * _.isObject(1);
 * // => false
 */
function isObject(value) {
  // Avoid a V8 JIT bug in Chrome 19-20.
  // See https://code.google.com/p/v8/issues/detail?id=2291 for more details.
  var type = typeof value;
  return type == 'function' || (value && type == 'object') || false;
}

/**
 * Creates an array of the own and inherited enumerable property names of `object`.
 *
 * **Note:** Non-object values are coerced to objects.
 *
 * @static
 * @memberOf _
 * @category Object
 * @param {Object} object The object to inspect.
 * @returns {Array} Returns the array of property names.
 * @example
 *
 * function Foo() {
 *   this.a = 1;
 *   this.b = 2;
 * }
 *
 * Foo.prototype.c = 3;
 *
 * _.keysIn(new Foo);
 * // => ['a', 'b', 'c'] (iteration order is not guaranteed)
 */
function keysIn(object) {
  if (object == null) {
    return [];
  }
  if (!isObject(object)) {
    object = Object(object);
  }
  var length = object.length;
  length = (length && isLength(length) &&
    (isArray(object) || (support.nonEnumArgs && isArguments(object))) && length) || 0;

  var Ctor = object.constructor,
      index = -1,
      isProto = typeof Ctor == 'function' && Ctor.prototype === object,
      result = Array(length),
      skipIndexes = length > 0;

  while (++index < length) {
    result[index] = (index + '');
  }
  for (var key in object) {
    if (!(skipIndexes && isIndex(key, length)) &&
        !(key == 'constructor' && (isProto || !hasOwnProperty.call(object, key)))) {
      result.push(key);
    }
  }
  return result;
}

module.exports = keysIn;

},{"lodash.isarguments":9,"lodash.isarray":10}],14:[function(require,module,exports){
/**
 * lodash 3.0.0 (Custom Build) <https://lodash.com/>
 * Build: `lodash modern modularize exports="npm" -o ./`
 * Copyright 2012-2015 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.7.0 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2015 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <https://lodash.com/license>
 */

/** `Object#toString` result references. */
var argsTag = '[object Arguments]',
    arrayTag = '[object Array]',
    boolTag = '[object Boolean]',
    dateTag = '[object Date]',
    errorTag = '[object Error]',
    funcTag = '[object Function]',
    mapTag = '[object Map]',
    numberTag = '[object Number]',
    objectTag = '[object Object]',
    regexpTag = '[object RegExp]',
    setTag = '[object Set]',
    stringTag = '[object String]',
    weakMapTag = '[object WeakMap]';

var arrayBufferTag = '[object ArrayBuffer]',
    float32Tag = '[object Float32Array]',
    float64Tag = '[object Float64Array]',
    int8Tag = '[object Int8Array]',
    int16Tag = '[object Int16Array]',
    int32Tag = '[object Int32Array]',
    uint8Tag = '[object Uint8Array]',
    uint8ClampedTag = '[object Uint8ClampedArray]',
    uint16Tag = '[object Uint16Array]',
    uint32Tag = '[object Uint32Array]';

/** Used to identify `toStringTag` values of typed arrays. */
var typedArrayTags = {};
typedArrayTags[float32Tag] = typedArrayTags[float64Tag] =
typedArrayTags[int8Tag] = typedArrayTags[int16Tag] =
typedArrayTags[int32Tag] = typedArrayTags[uint8Tag] =
typedArrayTags[uint8ClampedTag] = typedArrayTags[uint16Tag] =
typedArrayTags[uint32Tag] = true;
typedArrayTags[argsTag] = typedArrayTags[arrayTag] =
typedArrayTags[arrayBufferTag] = typedArrayTags[boolTag] =
typedArrayTags[dateTag] = typedArrayTags[errorTag] =
typedArrayTags[funcTag] = typedArrayTags[mapTag] =
typedArrayTags[numberTag] = typedArrayTags[objectTag] =
typedArrayTags[regexpTag] = typedArrayTags[setTag] =
typedArrayTags[stringTag] = typedArrayTags[weakMapTag] = false;

/**
 * Checks if `value` is object-like.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
 */
function isObjectLike(value) {
  return (value && typeof value == 'object') || false;
}

/** Used for native method references. */
var objectProto = Object.prototype;

/**
 * Used to resolve the `toStringTag` of values.
 * See the [ES spec](https://people.mozilla.org/~jorendorff/es6-draft.html#sec-object.prototype.tostring)
 * for more details.
 */
var objToString = objectProto.toString;

/**
 * Used as the maximum length of an array-like value.
 * See the [ES spec](https://people.mozilla.org/~jorendorff/es6-draft.html#sec-tolength)
 * for more details.
 */
var MAX_SAFE_INTEGER = Math.pow(2, 53) - 1;

/**
 * Checks if `value` is a valid array-like length.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a valid length, else `false`.
 */
function isLength(value) {
  return typeof value == 'number' && value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
}

/**
 * Checks if `value` is classified as a typed array.
 *
 * @static
 * @memberOf _
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is correctly classified, else `false`.
 * @example
 *
 * _.isTypedArray(new Uint8Array);
 * // => true
 *
 * _.isTypedArray([]);
 * // => false
 */
function isTypedArray(value) {
  return (isObjectLike(value) && isLength(value.length) && typedArrayTags[objToString.call(value)]) || false;
}

module.exports = isTypedArray;

},{}],15:[function(require,module,exports){
/**
 * lodash 3.0.4 (Custom Build) <https://lodash.com/>
 * Build: `lodash modern modularize exports="npm" -o ./`
 * Copyright 2012-2015 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.8.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2015 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <https://lodash.com/license>
 */
var isArguments = require('lodash.isarguments'),
    isArray = require('lodash.isarray'),
    isNative = require('lodash.isnative');

/** Used for native method references. */
var objectProto = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/** Native method references. */
var propertyIsEnumerable = objectProto.propertyIsEnumerable;

/* Native method references for those with the same name as other `lodash` methods. */
var nativeKeys = isNative(nativeKeys = Object.keys) && nativeKeys;

/**
 * Used as the maximum length of an array-like value.
 * See the [ES spec](https://people.mozilla.org/~jorendorff/es6-draft.html#sec-number.max_safe_integer)
 * for more details.
 */
var MAX_SAFE_INTEGER = Math.pow(2, 53) - 1;

/**
 * An object environment feature flags.
 *
 * @static
 * @memberOf _
 * @type Object
 */
var support = {};

(function(x) {

  /**
   * Detect if `arguments` object indexes are non-enumerable.
   *
   * In Firefox < 4, IE < 9, PhantomJS, and Safari < 5.1 `arguments` object
   * indexes are non-enumerable. Chrome < 25 and Node.js < 0.11.0 treat
   * `arguments` object indexes as non-enumerable and fail `hasOwnProperty`
   * checks for indexes that exceed their function's formal parameters with
   * associated values of `0`.
   *
   * @memberOf _.support
   * @type boolean
   */
  try {
    support.nonEnumArgs = !propertyIsEnumerable.call(arguments, 1);
  } catch(e) {
    support.nonEnumArgs = true;
  }
}(0, 0));

/**
 * Checks if `value` is a valid array-like index.
 *
 * @private
 * @param {*} value The value to check.
 * @param {number} [length=MAX_SAFE_INTEGER] The upper bounds of a valid index.
 * @returns {boolean} Returns `true` if `value` is a valid index, else `false`.
 */
function isIndex(value, length) {
  value = +value;
  length = length == null ? MAX_SAFE_INTEGER : length;
  return value > -1 && value % 1 == 0 && value < length;
}

/**
 * Checks if `value` is a valid array-like length.
 *
 * **Note:** This function is based on ES `ToLength`. See the
 * [ES spec](https://people.mozilla.org/~jorendorff/es6-draft.html#sec-tolength)
 * for more details.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a valid length, else `false`.
 */
function isLength(value) {
  return typeof value == 'number' && value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
}

/**
 * A fallback implementation of `Object.keys` which creates an array of the
 * own enumerable property names of `object`.
 *
 * @private
 * @param {Object} object The object to inspect.
 * @returns {Array} Returns the array of property names.
 */
function shimKeys(object) {
  var props = keysIn(object),
      propsLength = props.length,
      length = propsLength && object.length;

  var allowIndexes = length && isLength(length) &&
    (isArray(object) || (support.nonEnumArgs && isArguments(object)));

  var index = -1,
      result = [];

  while (++index < propsLength) {
    var key = props[index];
    if ((allowIndexes && isIndex(key, length)) || hasOwnProperty.call(object, key)) {
      result.push(key);
    }
  }
  return result;
}

/**
 * Checks if `value` is the language type of `Object`.
 * (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
 *
 * **Note:** See the [ES5 spec](https://es5.github.io/#x8) for more details.
 *
 * @static
 * @memberOf _
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
 * @example
 *
 * _.isObject({});
 * // => true
 *
 * _.isObject([1, 2, 3]);
 * // => true
 *
 * _.isObject(1);
 * // => false
 */
function isObject(value) {
  // Avoid a V8 JIT bug in Chrome 19-20.
  // See https://code.google.com/p/v8/issues/detail?id=2291 for more details.
  var type = typeof value;
  return type == 'function' || (value && type == 'object') || false;
}

/**
 * Creates an array of the own enumerable property names of `object`.
 *
 * **Note:** Non-object values are coerced to objects. See the
 * [ES spec](https://people.mozilla.org/~jorendorff/es6-draft.html#sec-object.keys)
 * for more details.
 *
 * @static
 * @memberOf _
 * @category Object
 * @param {Object} object The object to inspect.
 * @returns {Array} Returns the array of property names.
 * @example
 *
 * function Foo() {
 *   this.a = 1;
 *   this.b = 2;
 * }
 *
 * Foo.prototype.c = 3;
 *
 * _.keys(new Foo);
 * // => ['a', 'b'] (iteration order is not guaranteed)
 *
 * _.keys('hi');
 * // => ['0', '1']
 */
var keys = !nativeKeys ? shimKeys : function(object) {
  if (object) {
    var Ctor = object.constructor,
        length = object.length;
  }
  if ((typeof Ctor == 'function' && Ctor.prototype === object) ||
      (typeof object != 'function' && (length && isLength(length)))) {
    return shimKeys(object);
  }
  return isObject(object) ? nativeKeys(object) : [];
};

/**
 * Creates an array of the own and inherited enumerable property names of `object`.
 *
 * **Note:** Non-object values are coerced to objects.
 *
 * @static
 * @memberOf _
 * @category Object
 * @param {Object} object The object to inspect.
 * @returns {Array} Returns the array of property names.
 * @example
 *
 * function Foo() {
 *   this.a = 1;
 *   this.b = 2;
 * }
 *
 * Foo.prototype.c = 3;
 *
 * _.keysIn(new Foo);
 * // => ['a', 'b', 'c'] (iteration order is not guaranteed)
 */
function keysIn(object) {
  if (object == null) {
    return [];
  }
  if (!isObject(object)) {
    object = Object(object);
  }
  var length = object.length;
  length = (length && isLength(length) &&
    (isArray(object) || (support.nonEnumArgs && isArguments(object))) && length) || 0;

  var Ctor = object.constructor,
      index = -1,
      isProto = typeof Ctor == 'function' && Ctor.prototype === object,
      result = Array(length),
      skipIndexes = length > 0;

  while (++index < length) {
    result[index] = (index + '');
  }
  for (var key in object) {
    if (!(skipIndexes && isIndex(key, length)) &&
        !(key == 'constructor' && (isProto || !hasOwnProperty.call(object, key)))) {
      result.push(key);
    }
  }
  return result;
}

module.exports = keys;

},{"lodash.isarguments":9,"lodash.isarray":10,"lodash.isnative":16}],16:[function(require,module,exports){
arguments[4][12][0].apply(exports,arguments)
},{"dup":12}],17:[function(require,module,exports){
/**
 * lodash 3.0.0 (Custom Build) <https://lodash.com/>
 * Build: `lodash modern modularize exports="npm" -o ./`
 * Copyright 2012-2015 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.7.0 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2015 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <https://lodash.com/license>
 */
var baseCopy = require('lodash._basecopy'),
    keysIn = require('lodash.keysin');

/**
 * Converts `value` to a plain object flattening inherited enumerable
 * properties of `value` to own properties of the plain object.
 *
 * @static
 * @memberOf _
 * @category Lang
 * @param {*} value The value to convert.
 * @returns {Object} Returns the converted plain object.
 * @example
 *
 * function Foo() {
 *   this.b = 2;
 * }
 *
 * Foo.prototype.c = 3;
 *
 * _.assign({ 'a': 1 }, new Foo);
 * // => { 'a': 1, 'b': 2 }
 *
 * _.assign({ 'a': 1 }, _.toPlainObject(new Foo));
 * // => { 'a': 1, 'b': 2, 'c': 3 }
 */
function toPlainObject(value) {
  return baseCopy(value, keysIn(value));
}

module.exports = toPlainObject;

},{"lodash._basecopy":18,"lodash.keysin":19}],18:[function(require,module,exports){
/**
 * lodash 3.0.0 (Custom Build) <https://lodash.com/>
 * Build: `lodash modern modularize exports="npm" -o ./`
 * Copyright 2012-2015 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.7.0 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2015 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <https://lodash.com/license>
 */

/**
 * Copies the properties of `source` to `object`.
 *
 * @private
 * @param {Object} source The object to copy properties from.
 * @param {Object} [object={}] The object to copy properties to.
 * @param {Array} props The property names to copy.
 * @returns {Object} Returns `object`.
 */
function baseCopy(source, object, props) {
  if (!props) {
    props = object;
    object = {};
  }
  var index = -1,
      length = props.length;

  while (++index < length) {
    var key = props[index];
    object[key] = source[key];
  }
  return object;
}

module.exports = baseCopy;

},{}],19:[function(require,module,exports){
arguments[4][13][0].apply(exports,arguments)
},{"dup":13,"lodash.isarguments":9,"lodash.isarray":10}],20:[function(require,module,exports){
try {
	var _ = require('underscore');
} catch (e) {
	var _ = window._;
}
try {
	var Backbone = require('backbone');
} catch (e) {
	var Backbone = window.Backbone;
}
var merge = require('lodash.merge');

/**
 * Takes a nested object and returns a shallow object keyed with the path names
 * e.g. { "level1.level2": "value" }
 *
 * @param  {Object}      Nested object e.g. { level1: { level2: 'value' } }
 * @return {Object}      Shallow object with path names e.g. { 'level1.level2': 'value' }
 */
function objToPaths(obj) {
	var ret = {},
		separator = DeepModel.keyPathSeparator;

	for (var key in obj) {
		var val = obj[key];

		if (val && (val.constructor === Object || val.constructor === Array) && !_.isEmpty(val)) {
			//Recursion for embedded objects
			var obj2 = objToPaths(val);

			for (var key2 in obj2) {
				var val2 = obj2[key2];

				ret[key + separator + key2] = val2;
			}
		} else {
			ret[key] = val;
		}
	}

	return ret;
}

/**
 * [getNested description]
 * @param  {object} obj           to fetch attribute from
 * @param  {string} path          path e.g. 'user.name'
 * @param  {[type]} return_exists [description]
 * @return {mixed}                [description]
 */
function getNested(obj, path, return_exists) {
	var separator = DeepModel.keyPathSeparator;

	var fields = path ? path.split(separator) : [];
	var result = obj;
	return_exists || (return_exists === false);
	for (var i = 0, n = fields.length; i < n; i++) {
		if (return_exists && !_.has(result, fields[i])) {
			return false;
		}
		result = result[fields[i]];

		if (result == null && i < n - 1) {
			result = {};
		}

		if (typeof result === 'undefined') {
			if (return_exists) {
				return true;
			}
			return result;
		}
	}
	if (return_exists) {
		return true;
	}
	return result;
}



/**
 * @param {Object} obj                Object to fetch attribute from
 * @param {String} path               Object path e.g. 'user.name'
 * @param {Object} [options]          Options
 * @param {Boolean} [options.unset]   Whether to delete the value
 * @param {Mixed}                     Value to set
 */
function setNested(obj, path, val, options) {
	options = options || {};

	var separator = DeepModel.keyPathSeparator;

	var fields = path ? path.split(separator) : [];
	var result = obj;
	for (var i = 0, n = fields.length; i < n && result !== undefined; i++) {
		var field = fields[i];

		//If the last in the path, set the value
		if (i === n - 1) {
			options.unset ? delete result[field] : result[field] = val;
		} else {
			//Create the child object if it doesn't exist, or isn't an object
			if (typeof result[field] === 'undefined' || !_.isObject(result[field])) {
				var nextField = fields[i + 1];

				// create array if next field is integer, else create object
				result[field] = /^\d+$/.test(nextField) ? [] : {};
			}

			//Move onto the next part of the path
			result = result[field];
		}
	}
}

function deleteNested(obj, path) {
	setNested(obj, path, null, {
		unset: true
	});
}

var DeepModel = Backbone.Model.extend({

	// Override constructor
	// Support having nested defaults by using _.deepExtend instead of _.extend
	constructor: function(attributes, options) {
		var defaults;
		var attrs = attributes || {};
		this.cid = _.uniqueId('c');
		this.attributes = {};
		if (options && options.collection) this.collection = options.collection;
		if (options && options.parse) attrs = this.parse(attrs, options) || {};
		if (defaults = _.result(this, 'defaults')) {
			//<custom code>
			// Replaced the call to _.defaults with _.deepExtend.
			attrs = merge(defaults, attrs);
			//</custom code>
		}
		this.set(attrs, options);
		this.changed = {};
		this.initialize.apply(this, arguments);
	},

	// Return a copy of the model's `attributes` object.
	toJSON: function(options) {
		return merge({}, this.attributes);
	},

	// Override get
	// Supports nested attributes via the syntax 'obj.attr' e.g. 'author.user.name'
	get: function(attr) {
		return getNested(this.attributes, attr);
	},

	// Override set
	// Supports nested attributes via the syntax 'obj.attr' e.g. 'author.user.name'
	set: function(key, val, options) {
		var attr, attrs, unset, changes, silent, changing, prev, current;
		if (key == null) return this;

		// Handle both `"key", value` and `{key: value}` -style arguments.
		if (typeof key === 'object') {
			attrs = key;
			options = val || {};
		} else {
			(attrs = {})[key] = val;
		}

		options || (options = {});

		// Run validation.
		if (!this._validate(attrs, options)) return false;

		// Extract attributes and options.
		unset = options.unset;
		silent = options.silent;
		changes = [];
		changing = this._changing;
		this._changing = true;

		if (!changing) {
			this._previousAttributes = merge({}, this.attributes); //<custom>: Replaced _.clone with _.deepClone
			this.changed = {};
		}
		current = this.attributes, prev = this._previousAttributes;

		// Check for changes of `id`.
		if (this.idAttribute in attrs) this.id = attrs[this.idAttribute];

		//<custom code>
		attrs = objToPaths(attrs);
		//</custom code>

		// For each `set` attribute, update or delete the current value.
		for (attr in attrs) {
			val = attrs[attr];

			//<custom code>: Using getNested, setNested and deleteNested
			if (!_.isEqual(getNested(current, attr), val)) changes.push(attr);
			if (!_.isEqual(getNested(prev, attr), val)) {
				setNested(this.changed, attr, val);
			} else {
				deleteNested(this.changed, attr);
			}
			unset ? deleteNested(current, attr) : setNested(current, attr, val);
			//</custom code>
		}

		// Trigger all relevant attribute changes.
		if (!silent) {
			if (changes.length) this._pending = true;

			//<custom code>
			var separator = DeepModel.keyPathSeparator;
			var alreadyTriggered = {}; // * @restorer

			for (var i = 0, l = changes.length; i < l; i++) {
				var key = changes[i];

				if (!alreadyTriggered.hasOwnProperty(key) || !alreadyTriggered[key]) { // * @restorer
					alreadyTriggered[key] = true; // * @restorer
					this.trigger('change:' + key, this, getNested(current, key), options);
				} // * @restorer

				var fields = key.split(separator);

				//Trigger change events for parent keys with wildcard (*) notation
				for (var n = fields.length - 1; n > 0; n--) {
					var parentKey = fields.slice(0, n).join(separator),
						wildcardKey = parentKey + separator + '*';

					if (!alreadyTriggered.hasOwnProperty(wildcardKey) || !alreadyTriggered[wildcardKey]) { // * @restorer
						alreadyTriggered[wildcardKey] = true; // * @restorer
						this.trigger('change:' + wildcardKey, this, getNested(current, parentKey), options);
					} // * @restorer

					// + @restorer
					if (!alreadyTriggered.hasOwnProperty(parentKey) || !alreadyTriggered[parentKey]) {
						alreadyTriggered[parentKey] = true;
						this.trigger('change:' + parentKey, this, getNested(current, parentKey), options);
					}
					// - @restorer
				}
				//</custom code>
			}
		}

		if (changing) return this;
		if (!silent) {
			while (this._pending) {
				this._pending = false;
				this.trigger('change', this, options);
			}
		}
		this._pending = false;
		this._changing = false;
		return this;
	},

	// Clear all attributes on the model, firing `"change"` unless you choose
	// to silence it.
	clear: function(options) {
		var attrs = {};
		var shallowAttributes = objToPaths(this.attributes);
		for (var key in shallowAttributes) attrs[key] = void 0;
		return this.set(attrs, _.extend({}, options, {
			unset: true
		}));
	},

	// Determine if the model has changed since the last `"change"` event.
	// If you specify an attribute name, determine if that attribute has changed.
	hasChanged: function(attr) {
		if (attr == null) return !_.isEmpty(this.changed);
		return getNested(this.changed, attr) !== undefined;
	},

	// Return an object containing all the attributes that have changed, or
	// false if there are no changed attributes. Useful for determining what
	// parts of a view need to be updated and/or what attributes need to be
	// persisted to the server. Unset attributes will be set to undefined.
	// You can also pass an attributes object to diff against the model,
	// determining if there *would be* a change.
	changedAttributes: function(diff) {
		//<custom code>: objToPaths
		if (!diff) return this.hasChanged() ? objToPaths(this.changed) : false;
		//</custom code>

		var old = this._changing ? this._previousAttributes : this.attributes;

		//<custom code>
		diff = objToPaths(diff);
		old = objToPaths(old);
		//</custom code>

		var val, changed = false;
		for (var attr in diff) {
			if (_.isEqual(old[attr], (val = diff[attr]))) continue;
			(changed || (changed = {}))[attr] = val;
		}
		return changed;
	},

	// Get the previous value of an attribute, recorded at the time the last
	// `"change"` event was fired.
	previous: function(attr) {
		if (attr == null || !this._previousAttributes) return null;

		//<custom code>
		return getNested(this._previousAttributes, attr);
		//</custom code>
	},

	// Get all of the attributes of the model at the time of the previous
	// `"change"` event.
	previousAttributes: function() {
		//<custom code>
		return merge({}, this._previousAttributes);
		//</custom code>
	}
});


//Config; override in your app to customise
DeepModel.keyPathSeparator = '.';


module.exports = DeepModel;

},{"backbone":undefined,"lodash.merge":2,"underscore":undefined}]},{},[1]);

;;(function(app){

	//1 Override the default raw-template retrieving method
	//We allow both #id or @*.html(remote) and template html string(or string array) as parameter.
	Backbone.Marionette.TemplateCache.prototype.loadTemplate = function(idOrTplString){
		//local tpl
		if(_.string.startsWith(idOrTplString, '#')) return $(idOrTplString).html();
		//remote tpl (with local stored map cache)
		if(_.string.startsWith(idOrTplString, '@')) {
			var name = idOrTplString.substr(1);
			//search the local templates cache:
			var tpl = app.Util.Tpl.remote.get(name);
			if(tpl) return tpl;
			//fetch from remote: (might need server-side CORS support)
			return app.Util.Tpl.remote.load(name);

		}
		//string and string array
		return app.Util.Tpl.build(idOrTplString);
		//this can NOT be null or empty since Marionette.Render guards it so don't need to use idOrTplString || ' ';
	};

	//2 Override to use Handlebars templating engine with Backbone.Marionette
	Backbone.Marionette.TemplateCache.prototype.compileTemplate = function(rawTemplate) {
	  return Handlebars.compile(rawTemplate);
	};

})(Application);

;/**
 * Enhancing the Backbone.Marionette.Region Class
 *
 * 1. open()/close/show() (altered to support enter/exit effects)
 * --------------
 * a. consult view.effect animation names (from Animate.css or your own, not from jQuery ui) when showing a view;
 * b. inject parent view as parentCt to sub-regional view;
 * c. store sub view as parent view's _fieldsets[member];
 *
 * 2. resize()
 * -----------
 * ...
 *
 *
 * Effect config
 * -------------
 * in both view & region
 * 
 * use the css animation name as enter (show) & exit (close) effect name.
 * 1. 'lightSpeed' or {enter: 'lightSpeedIn', exit: '...'} in view definition
 * 2. data-effect="lightSpeed" or data-effect-enter="lightSpeedIn" data-effect-exit="..." on region tag
 *
 * https://daneden.github.io/animate.css/
 * 
 *
 * @author Tim.Liu
 * @updated 2014.03.03
 * @updated 2015.08.10
 */

;
(function(app) {

    _.extend(Backbone.Marionette.Region.prototype, {

    	show: function(newView, options){
            this.ensureEl();
            var view = this.currentView;
            if (view) {
                var exitEffect = (_.isPlainObject(view.effect) ? view.effect.exit : (view.effect ? (view.effect + 'Out') : '')) || (this.$el.data('effect')? (this.$el.data('effect') + 'Out'): '') || this.$el.data('effectExit');
                if (exitEffect) {
                    var self = this;
                    view.$el.addClass(exitEffect).addClass('animated')
                    .one(app.ADE, function() {
                    	self.close();
                    	self._show(newView, options);
                    });
                    return this;
                }
                this.close();
            }
            return this._show(newView, options);
    	},

    	//modified show method (removed preventClose & same view check)
        _show: function(view, options) {

            view.render();
            Marionette.triggerMethod.call(this, "before:show", view);

            if (_.isFunction(view.triggerMethod)) {
                view.triggerMethod("before:show");
            } else {
                Marionette.triggerMethod.call(view, "before:show");
            }

            this.open(view);
            this.currentView = view;

            Marionette.triggerMethod.call(this, "show", view);

            if (_.isFunction(view.triggerMethod)) {
                view.triggerMethod("show");
            } else {
                Marionette.triggerMethod.call(view, "show");
            }

            return this;
        },

        open: function(view) {

            var enterEffect = (_.isPlainObject(view.effect) ? view.effect.enter : (view.effect ? (view.effect + 'In') : '')) || (this.$el.data('effect')? (this.$el.data('effect') + 'In') : '') || this.$el.data('effectEnter');
            if (enterEffect) {
                view.$el.css('opacity', 0).addClass(enterEffect);

                function enter() {
                    _.defer(function() {
                        view.$el.addClass('animated').one(app.ADE, function() {
                            view.$el.removeClass('animated', enterEffect);
                            view.trigger('view:animated');
                        });
                        _.defer(function() {
                            //end state: display block/inline & opacity 1
                            view.$el.css('opacity', 1);
                        });
                    });
                }

                view.once('show', function() {
                    enter();
                });

            }

            //from original open() method in Marionette
            this.$el.empty().append(view.el);
            //-----------------------------------------

            //inject parent view container through region into the regional views
            if (this._parentLayout) {
                view.parentCt = this._parentLayout;
                //also passing down the name of the outter-most context container.
                if (this._parentLayout.category === 'Context') view.parentCtx = this._parentLayout;
                else if (this._parentLayout.parentCtx) view.parentCtx = this._parentLayout.parentCtx;
            }

            //store sub region form view by fieldset
            if (view.fieldset) {
                this._parentLayout._fieldsets = this._parentLayout._fieldsets || {};
                this._parentLayout._fieldsets[view.fieldset] = view;
            }

            //trigger view:resized anyway upon its first display
            if (this._contentStyle) {
                //view.$el.css(this._contentStyle); //Tricky, use a .$el.css() call to smooth dom sizing/refreshing after $el.empty().append()
                var that = this;
                _.defer(function() {
                    view.trigger('view:resized', {
                        region: that
                    }); //!!Caution: this might be racing if using view.effect as well!!
                });
            }

            view.parentRegion = this;

            return this;
        },

        //you don't need to calculate paddings on a region, since we are using $.innerHeight()
        resize: function(options) {
            options = options || {};

            /*Note that since we use box-sizing in css, if using this.$el.css() to set height/width, they are equal to using innerHeight/Width()*/
            this._contentStyle = _.extend({}, options, this._contentOverflow);
            this.$el.css(this._contentStyle);

            var that = this;
            _.defer(function() { //give browser a chance to catch up with style changes.
                if (that.currentView) {
                    //this.currentView.$el.css(this._contentStyle);
                    that.currentView.trigger('view:resized', {
                        region: that
                    });
                }
            });

            return this;

        }

    });

})(Application);

;/**
 * Here we extend the html tag attributes to be auto-recognized by a Marionette.View.
 * This simplifies the view creation by indicating added functionality through template string. (like angular.js?)
 *
 * Fixed
 * -----
 * 0. shiv empty template.
 * 1. auto ui tags detection in template.
 * 2. +meta event programming
 * 	view:* (event-name) <--> on* (camelized)
 * 3. global coop events.
 *
 * 
 * @author Tim.Liu
 * @created 2014.02.25
 * @updated 2015.08.03
 */


;(function(app){

	_.extend(Backbone.Marionette.View.prototype, {
		isInDOM: function(){
			if(!this.$el) return undefined;
			return $.contains(document.documentElement, this.$el[0]);
		}
	});

	/**
	 * Fixed enhancement
	 * +auto ui tags detection and register
	 * +meta event programming
	 * 	view:* (event-name) - on* (camelized)
	 *
	 * Override View.constructor to affect only decendents, e.g ItemView and CollectionView... 
	 * (This is the Backbone way of extend...)
	 * 
	 */
	Backbone.Marionette.View.prototype.constructor = function(options){
		options = options || {};

		//----------------------deprecated config---------------------------
		if((this.type || options.type) && !this.forceViewType)
			console.warn('DEV::View+::type is deprecated, please do not specify ' + (this.name?'in ' + this.name:''));

		//----------------------fixed enhancements--------------------------
		//fix default tpl to be ' '.
		this.template = options.template || this.template || ' ';
		//replace data configure
		this.data = options.data || this.data;

		//auto ui pick-up after render (to support dynamic template)
		this._ui = _.extend({}, this.ui, options.ui);
		this.listenTo(this, 'render', function(){
			var that = this;
			this.unbindUIElements();
			this.ui = this._ui;
			$(this.el.outerHTML).find('[ui]').each(function(index, el){
				var ui = $(this).attr('ui');
				that.ui[ui] = '[ui="' + ui + '"]';
			});
			this.bindUIElements();
		});

		//meta-event programming ability
		app.Util.addMetaEvent(this, 'view');

		//global co-op (global events forwarding through app)
		if(this.coop) {
			this._postman = {};
			//register
			_.each(this.coop, function(e){
				var self = this;
				this._postman[e] = function(options){
					self.trigger('view:' + e, options);
					//considering the parent-DOM-removed edge case
					if(self.isInDOM() === false)
						app.off('app:coop-' + e, self._postman[e]);
				};
				app.on('app:coop-' + e, this._postman[e]);
			}, this);
			//cleanup
			this.listenTo(this, 'close', function(){
				_.each(this._postman, function(fn, e){
					app.off('app:coop-' + e, fn);
				});
			});
		}		
		
		//---------------------optional view enhancements-------------------
		//actions (1-click uis)
		if(this.actions && this.enableActionTags) 
			this.enableActionTags(this.actions._bubble);
		
		//editors
		if(this.editors && this.activateEditors) this.listenTo(this, 'render', function(){
			this.activateEditors(this.editors);
		});

		//svg (if rapheal.js is present)
		if(this.svg && this.enableSVG) {
			this.listenTo(this, 'render', this.enableSVG);
		}

		//tooltip
		if(this.tooltips && this.enableTooltips) {
			this.enableTooltips(this.tooltips);
		}

		//overlay (use this view as overlay)
		if(this.overlay && this.enableOverlay){
			this.enableOverlay();
		}

		//auto-enable i18n
		if(I18N.locale) {
			this.listenTo(this, 'render', function(){
				this.$el.i18n({search: true});
			});
		}

		//data ({}, [] or url for GET only)
		this.listenToOnce(this, 'show', function(){
			//supports getting parent data from useParentData.
			this.data = this.data || (this.parentCt && this.useParentData && this.parentCt.get(this.useParentData));
			if(this.data)
				this.set(this.data);
		});

		return Backbone.Marionette.View.apply(this, arguments);
	};


})(Application);
;/**
 * Marionette.ItemView Enhancements (can be used in Layout as well) - Note that you can NOT use these in a CompositeView.
 *
 * 0. actions
 * 1. svg (view:fit-paper, view:paper-resized, view:paper-ready)
 * 2. basic Editors (view as form piece)
 * 3. tooltips
 * 4. overlay
 * 5. data event listener (view:render-data, view:data-rendered)
 *
 * @author Tim.Liu
 * @created 2014.02.26
 * @updated 2015.08.03
 */

;(function(app){

	/**
	 * Action Tag listener hookups +actions{} (do it in initialize())
	 * + event forwarding ability to action tags
	 * Usage:
	 * 		1. add action tags to html template -> e.g <div ... action="method name or *:event name"></div> 
	 * 		2. implement the action method name in UI definition body's actions{} object. 
	 * 		functions under actions{} are invoked with 'this' as scope (the view object).
	 * 		functions under actions{} are called with a 2 params ($action, e) which is a jQuery object referencing the action tag and the jQuery prepared event object, use e.originalEvent to get the DOM one.
	 *
	 * Options
	 * -------
	 * 1. uiName - [UNKNOWN.View] this is optional, mainly for better debugging msg;
	 * 2. passOn - [false] this is to let the clicking event of action tags bubble up if an action listener is not found. 
	 *
	 * Note:
	 * A. We removed _.bind() altogether from the enableActionTags() function and use Function.apply(scope, args) instead for listener invocation to avoid actions{} methods binding problem.
	 * Functions under actions will only be bound ONCE to the first instance of the view definition, since _.bind() can not rebind functions that were already bound, other instances of
	 * the view prototype will have all the action listeners bound to the wrong view object. This holds true to all nested functions, if you assign the bound version of the function back to itself
	 * e.g. this.nest.func = _.bind(this.nest.func, this); - Do NOT do this in initialize()/constructor()!! Use Function.apply() for invocation instead!!!
	 *
	 * B. We only do e.stopPropagation for you, if you need e.preventDefault(), do it yourself in the action impl;
	 */
	_.extend(Backbone.Marionette.ItemView.prototype, {

		enableActionTags: function(uiName, passOn){ //the uiName is just there to output meaningful dev msg if some actions haven't been implemented.

			if(_.isBoolean(uiName)){
				passOn = uiName;
				uiName = '';
			}
			passOn = passOn || false;
			this.events = this.events || {};
			//add general action tag clicking event and listener
			_.extend(this.events, {
				'click [action]': '_doAction'
			});
			this.actions = this.actions || {}; 	
			uiName = uiName || this.name || 'UNKNOWN.View';

			this._doAction = function(e){

				var $el = $(e.currentTarget);
				var action = $el.attr('action') || 'UNKNOWN';
				var lockTopic = $el.attr('lock'),
				unlockTopic = $el.attr('unlock');

				if(unlockTopic) app.unlock(unlockTopic);

				if(lockTopic && !app.lock(lockTopic)){
					e.stopPropagation();
					e.preventDefault();
					app.trigger('app:blocked', action, lockTopic);
					return;
				}

				if($el.hasClass('disabled') || $el.parent().hasClass('disabled')) {
					e.stopPropagation();
					e.preventDefault();					
					return;
				}

				//allow triggering certain event only.
				var eventForwarding = String(action).split(':');
				if(eventForwarding.length >= 2) {
					eventForwarding.shift();
					e.stopPropagation(); //Important::This is to prevent confusing the parent view's action tag listeners.
					return this.trigger(eventForwarding.join(':'));
				}

				var doer = this.actions[action];
				if(doer) {
					e.stopPropagation(); //Important::This is to prevent confusing the parent view's action tag listeners.
					doer.apply(this, [$el, e, lockTopic]); //use 'this' view object as scope when applying the action listeners.
				}else {
					if(passOn){
						return;
					}else {
						e.stopPropagation(); //Important::This is to prevent confusing the parent view's action tag listeners.
					}
					throw new Error('DEV::' + (uiName || 'UI Component') + '::enableActionTags() You have not yet implemented this action - [' + action + ']');
				}
			};		
		},
			
	});

	/**
	 * Inject a svg canvas within view. - note that 'this' in cb means paper.
	 * Do this in onShow() instead of initialize.
	 */
	_.extend(Backbone.Marionette.ItemView.prototype, {
		enableSVG: function(){
			if(!Raphael) throw new Error('DEV::ItemView+::enableSVG() You did NOT have Raphael.js included...');
			var that = this;

			Raphael(this.el, this.$el.width(), this.$el.height(), function(){
				that.paper = this;
				that.trigger('view:paper-ready', this); // - use this instead of onShow() in the 1st time
				/**
				 * e.g 
				 * onShow(){
				 * 	if(this.paper) draw...;
				 * 	else
				 * 		this.onPaperReady(){ draw... };
				 * }
				 */
			});

			//resize paper (e.g upon window resize event).
			this.onFitPaper = function(){
				if(!this.paper) return;
				this.paper.setSize(this.$el.width(), this.$el.height());
				this.trigger('view:paper-resized');
			};
		}
	});

	/**
	 * Editor Activation - do it in onShow() or onRender()
	 * Turn per field config into real editors.
	 * You can activate editors in any Layout/ItemView object, it doesn't have to be a turnIntoForm() instrumented view.
	 * You can also send a view with activated editors to a form by using addFormPart()[in onShow() or onRender()] it is turn(ed)IntoForm()
	 *
	 * options
	 * -------
	 * _global: general config as a base for all editors, (overriden by individual editor config)
	 * editors: {
	 *  //simple 
	 * 	name: {
	 * 		type: ..., (*required) - basic or registered customized ones
	 * 		label: ...,
	 * 		help: ...,
	 * 		tooltip: ...,
	 * 		placeholder: ...,
	 * 		options: ...,
	 * 		validate: ...,
	 * 		fieldname: ..., optional for collecting values through $.serializeForm()
	 * 		
	 * 		... (see specific editor options in pre-defined/parts/editors/index.js)
	 * 		
	 * 		appendTo: ... - per editor appendTo cfg
	 * 	},
	 * 	...,
	 * 	//compound (use another view as wrapper)
	 * 	name: app.view({
	 * 		template: ...,
	 * 		editors: ...,
	 * 		getVal: ...,
	 * 		setVal: ...,
	 * 		disable: ...,
	 * 		isEnabled: ...,
	 * 		status: ...
	 * 		//you don't need to implement validate() though.
	 * 	}),
	 * }
	 *
	 * This will add *this._editors* to the view object. Do NOT use a region name with region='editors'...
	 * 
	 * Add new: You can repeatedly invoke this method to add new editors to the view.
	 * Remove current: Close this view to automatically clean up all the editors used.
	 *
	 * optionally you can implement setValues()/getValues()/validate() in your view, and that will get invoked by the outter form view if there is one.
	 *
	 * Warning:
	 * activateEditors will not call on editor's onShow method, so don't put anything in it! Use onRender if needs be instead!!
	 * 
	 */
	_.extend(Backbone.Marionette.ItemView.prototype, {

		activateEditors: function(options){
			this._editors = this._editors || {};
			if(this._editors.attachView) throw new Error('DEV::ItemView+::activateEditors() will need this._editors object, it is now a Region!');

			var global = options._global || {};
			_.each(options, function(config, name){
				if(name.match(/^_./)) return; //skip _config items like _global

				var Editor, editor;
				if(!_.isFunction(config)){
					//0. apply global config
					config = _.extend({name: name, parentCt: this}, global, config);
					//if no label, we remove the standard (twt-bootstrap) 'form-group' class from editor template for easier css styling.
					if(!config.label) config.className = config.className || ' ';

					//1. instantiate
					config.type = config.type || 'text'; 
					Editor = (app.Core.Editor.map.Basic.supported[config.type] && app.Core.Editor.map.Basic) || app.get(config.type, 'Editor');
					editor = new Editor(config);					
				}else {
					//if config is a view definition use it directly 
					//(compound editor, e.g: app.view({template: ..., editors: ..., getVal: ..., setVal: ...}))
					Editor = config;
					config = _.extend({name: name, parentCt: this}, global);
					editor = new Editor(config); //you need to implement event forwarding to parentCt like Basic.
					editor.isCompound = true;
				}
				
				this._editors[name] = editor.render();
				//2. add it into view (specific, appendTo(editor cfg), appendTo(general cfg), append)
				var $position = this.$('[editor="' + name + '"]');
				if($position.length === 0 && config.appendTo)
					$position = this.$(config.appendTo);
				if($position.length === 0)
					$position = this.$el;
				$position.append(editor.el);
				
				//3. patch in default value
				if(config.value)
					editor.setVal(config.value);

			}, this);

			this.listenTo(this, 'before:close', function(){
				_.each(this._editors, function(editorview){
					editorview.close();
				});
			});

			//If this view (as a Layout instance) enables editors as well, we need to save the layout version of the form fns and invoke them as well.
			//so that fieldsets nested in this Layout works properly.
			var savedLayoutFns = _.pick(this, 'getEditor', 'getValues', 'setValues', 'validate', 'status');
			//0. getEditor(name)
			this.getEditor = function(name){
				return this._editors[name] || (savedLayoutFns.getEditor && savedLayoutFns.getEditor.call(this, name));
			};

			//1. getValues (O(n) - n is the total number of editors on this form)
			this.getValues = function(){
				var vals = (savedLayoutFns.getValues && savedLayoutFns.getValues.call(this)) || {};
				_.each(this._editors, function(editor, name){
					var v = editor.getVal();
					if(v !== undefined && v !== null) vals[name] = v;
				});
				return vals;
			};

			//2. setValues (O(n) - n is the total number of editors on this form)
			this.setValues = function(vals, loud){
				if(!vals) return;
				_.each(this._editors, function(editor, name){
					if(vals[name] !== null && vals[name] !== undefined)
						editor.setVal(vals[name], loud);
				});
				if(savedLayoutFns.setValues) 
					savedLayoutFns.setValues.call(this, vals, loud);
			};

			//3. validate
			this.validate = function(show){
				var errors = (savedLayoutFns.validate && savedLayoutFns.validate.call(this, show)) || {};

				_.each(this._editors, function(editor, name){
					var e;
					if(!this.isCompound)
						e = editor.validate(show);
					else
						e = editor.validate(); //just collect errors
					if(e) errors[name] = e;
				}, this);

				if(this.isCompound && show) this.status(errors); //let the compound editor view decide where to show the errors
				if(_.size(errors) === 0) return;

				return errors; 
			};

			//4. highlight status msg - linking to individual editor's status method
			this.status = function(options){
				if(_.isString(options)) {
					throw new Error('DEV::ItemView+::activateEditors() You need to pass in messages object instead of ' + options);
				}

				if(savedLayoutFns.status)
					savedLayoutFns.status.call(this, options);

				//clear status
				if(!options || _.isEmpty(options)) {
					_.each(this._editors, function(editor, name){
						editor.status();
					});
					return;
				}
				//set status to each editor
				_.each(options, function(opt, name){
					if(this._editors[name]) this._editors[name].status(opt);
				}, this);
			};

			//auto setValues according to this.model?
			
		}

	});

	/**
	 * Enable Tooltips (do it in initialize())
	 * This is used for automatically activate tooltips after render
	 *
	 * Options
	 * -------
	 * bootstrap tooltip config
	 */

	_.extend(Backbone.Marionette.ItemView.prototype, {

		enableTooltips: function(options){
			this.listenTo(this, 'render', function(){
				//will activate tooltip with specific options object - see /libs/bower_components/bootstrap[x]/docs/javascript.html#tooltips
				this.$('[data-toggle="tooltip"]').tooltip(options);
			});
		}

	});

	/**
	 * Overlay
	 * options:
	 * 1. anchor - css selector of parent html el
	 * 2. rest of the $.overlay plugin options without content and onClose
	 */
	_.extend(Backbone.Marionette.ItemView.prototype, {

		enableOverlay: function(){
			this._overlayConfig = _.isBoolean(this.overlay)? {}: this.overlay;
			this.overlay = function(options){
				options = options || {};
				var $anchor = $(options.anchor || 'body');
				var that = this;
				this.listenTo(this, 'close', function(){
					$anchor.overlay();//close the overlay if this.close() is called.
				});
				$anchor.overlay(_.extend(this._overlayConfig, options, {
					content: function(){
						return that.render().el;
					},
					onShow: function(){
						//that.trigger('show'); //Trigger 'show' doesn't invoke onShow, use triggerMethod the Marionette way!
						that.triggerMethod('show'); //trigger event while invoking on{Event};
					},
					onClose: function(){
						that.close(); //closed by overlay x
					}
				}));
				return this;
			};			
		}

	});

	/**
	 * Data handling enhancements.
	 * 1. View as normal tpl + data
	 * 2. view as form with editors (tpl = layout, data = values)
	 */
	_.extend(Backbone.Marionette.ItemView.prototype, {

		//Editors don't render according to the underlying backbone model.
		_renderTplOrResetEditors: function(){
			if(this._editors)
				this.setValues(this.model.toJSON());
			else
				this.render();
			this.trigger('view:data-rendered');
		},
		
		//Set & change the underlying data of the view.
		set: function(){

			if(!this.model){
				this.model = app.model();
			}

			var self = this;

			//check one-way binding
			if(!this._oneWayBound){
				this.listenTo(this.model, 'change', function(){
					self._renderTplOrResetEditors();
				});
				this._oneWayBound = true;			
			}

			//bypassing Model/Collection setup in Backbone.
			if(arguments.length === 1){
				var data = arguments[0];
				if(_.isString(data)){
					this.data = data;
					//to prevent from calling refresh() in initialize()
					return this.isInDOM() && this.refresh();
				}
				else if(_.isArray(data))
					return this.model.set('items', data); 
					//conform to original Backbone/Marionette settings
			}
			return this.model.set.apply(this.model, arguments);
		},

		//Use this instead of this.model.attributes to get the underlying data of the view.
		get: function(){
			if(this._editors){
				if(arguments.length) return this.getEditor.apply(this, arguments).getVal();
				return this.getValues();
			}

			if(!this.model) {
				console.warn('DEV::ItemView+::get() You have not yet setup data in view ' + this.name);
				return;
			}
			
			if(arguments.length)
				return this.model.get.apply(this.model, arguments);
			return this.model.toJSON();
		},

		//Reload (if data: url) and re-render the view, or resetting the editors.
		refresh: function(){
			if(!this.data) return console.warn('DEV::ItemView+::refresh() You must set view.data to use this method.');
			
			this.model && this.model.clear({silent: true});
			if(_.isString(this.data)){
				var self = this;
				return app.remote(this.data).done(function(d){
					self.set(d);
				}).fail(app.ajaxFailed);
			}
			else
				return this.model && this.set(this.model.toJSON());
		},

		//Meta-event view:render-data
		onRenderData: function(data){
			this.set(data);
		}
	});

})(Application);
;/**
 * Enhancing the Marionette.Layout Definition to auto detect regions and regional views through its template.
 *
 *
 * Fixed
 * -----
 * auto region detect and register by region="" in template
 * auto regional view display by attribute view="" in template (+@mockup.html)
 * change a region's view by trigger 'region:load-view' on that region, then give it a view name. (registered through B.M.Layout.regional() or say app.create('Regional', ...))
 * 
 * 
 * Experimental
 * ------------
 * default getValues/setValues and validate() method supporting editors value collection and verification
 *
 *
 * @author Tim.Liu
 * @create 2014.02.25
 * @update 2014.07.15 (+chainable nav region support)
 * @update 2014.07.28 (+view="@mockup.html" support)
 */

;(function(app){

	/**
	 * Instrument this Layout in case it is used as a Form container.
	 * 1. getValues() * - collects values from each region; grouped by fieldset name used by the regional form view piece;
	 * 2. setValues(vals) * - sets values to regions; fieldset aware;
	 * 3. validate(show) * - validate all the regions;
	 * 4. getEditor(pathname) * - dotted path name to find your editor;
	 * 5. status(options) - set status messages to the fieldsets and regions;
	 * Note that after validation(show:true) got errors, those editors will become eagerly validated, it will turn off as soon as the user has input-ed the correct value.
	 * 
	 * Not implemented: button action implementations, you still have to code your button's html into the template.
	 * submit
	 * reset
	 * refresh
	 * cancel
	 *
	 * No setVal getVal
	 * ----------------
	 * Use getEditor(a.b.c).set/getVal()
	 *
	 */

	_.extend(Backbone.Marionette.Layout.prototype, {

		//1. getValues (O(n) - n is the total number of editors on this form)
		getValues: function(){
			var vals = {};
			this.regionManager.each(function(region){
				if(region.currentView && region.currentView.getValues){
					if(region.currentView.fieldset)
						vals[region.currentView.fieldset] = region.currentView.getValues();
					else
						_.extend(vals, region.currentView.getValues());
				}
			});
			return vals;
		},

		//2. setValues (O(n) - n is the total number of editors on this form)
		setValues: function(vals, loud){
			this.regionManager.each(function(region){
				if(region.currentView && region.currentView.setValues){
					if(region.currentView.fieldset){
						region.currentView.setValues(vals[region.currentView.fieldset], loud);
					}
					else
						region.currentView.setValues(vals, loud);
				}
			});
		},

		//3. validate
		validate: function(show){
			var errors = {};
			this.regionManager.each(function(region){
				if(region.currentView && region.currentView.validate){
					if(region.currentView.fieldset){
						errors[region.currentView.fieldset] = region.currentView.validate(show);
					}
					else
						_.extend(errors, region.currentView.validate(show));
				}
			});
			if(_.size(errors) === 0) return;
			return errors; 
		},

		// 4. getEditor - with dotted pathname
		getEditor: function(pathname){
			if(!pathname || _.isEmpty(pathname)) return;
			if(!_.isArray(pathname))
				pathname = String(pathname).split('.');
			var fieldset = pathname.shift();
			if(this._fieldsets && this._fieldsets[fieldset])
				return this._fieldsets[fieldset].getEditor(pathname.join('.'));
			return;
		},
		

		// 5. status (options will be undefined/false or {..:.., ..:..})
		status: function(options){
			this.regionManager.each(function(region){
				if(region.currentView && region.currentView.status){
					if(!options || !region.currentView.fieldset)
						region.currentView.status(options);
					else
						region.currentView.status(options[region.currentView.fieldset]);
				}
			});
		}

	});


	/**
	 * Fixed behavior overridden. 
	 *
	 * Using standard Class overriding technique to change Backbone.Marionette.Layout 
	 * (this is different than what we did for Backbone.Marionette.View)
	 */
	var Old = Backbone.Marionette.Layout;
	Backbone.Marionette.Layout = Old.extend({

		constructor: function(options){
			options = options || {};

			this.regions = _.extend({}, this.regions, options.regions);
			//find region marks after rendering and ensure region.$el (to support dynamic template)
			this.listenTo(this, 'render', function(){
				var that = this;
				$(this.el.outerHTML).find('[region]').each(function(index, el){
					var r = $(el).attr('region');
					//that.regions[r] = '[region="' + r + '"]';
					that.regions[r] = {
						selector: '[region="' + r + '"]'
					};
				});
				this.addRegions(this.regions);     						
				_.each(this.regions, function(selector, region){
					this[region].ensureEl();
					this[region].$el.addClass('region region-' + _.string.slugify(region));
					this[region]._parentLayout = this;
					this[region]._contentOverflow = {};
					_.each(['overflowX', 'overflowY', 'overflow'], function(oKey){
						var oVal = this[region].$el.data(oKey);
						if(oVal) this[region]._contentOverflow[oKey] = oVal;
					}, this);
				},this);
			});

			//Giving region the ability to show a registered View/Widget or @remote.tpl.html through event 'region:load-view' (name [,options])
			this.listenTo(this, 'render', function(){
				_.each(this.regions, function(selector, r){
					this[r].listenTo(this[r], 'region:load-view', function(name, options){ //can load both view and widget.
						if(!name) return;

						//Template mockups?
						if(_.string.startsWith(name, '@')){
							this.show(app.view({
								template: name,
							}, true));
							return;
						}

						//Reusable view?
						var Reusable = app.get(name, _.isPlainObject(options)?'Widget':'View');
						if(Reusable){
							//Caveat: don't forget to pick up overridable func & properties from options in your Widget.
							this.show(new Reusable(options));
							return;
						}						

						console.warn('DEV::Layout+::region:load-view View required ' + name + ' can NOT be found...use app.view({name: ..., ...}).');
					});
					
				},this);
			});

			//Automatically shows the region's view="" attr indicated View or @remote.tpl.html
			//Note: re-render a view will not re-render the regions. use data change or .show() will.
			this.listenTo(this, 'show view:data-rendered', function(){
				_.each(this.regions, function(selector, r){
					if(this.debug) this[r].$el.html('<p class="alert alert-info">Region <strong>' + r + '</strong></p>'); //give it a fake one.
					this[r].trigger('region:load-view', this[r].$el.attr('view')); //found corresponding View def.
				}, this);
				this.trigger('view:all-region-shown');
			});

			//supporting the navigation chain if it is a named layout view with valid navRegion (context, regional, ...)
			if(options.name || this.name){
				this.navRegion = options.navRegion || this.navRegion;
				//if(this.navRegion)
				this.onNavigateChain = function(pathArray){
					if(!pathArray || pathArray.length === 0){
						this.trigger('view:navigate-to');//use this to show the default view
						return;	
					} 

					if(!this.navRegion) return this.trigger('view:navigate-to', pathArray.join('/'));

					if(!this.regions[this.navRegion]){
						console.warn('DEV::Layout+::onNavigateChain()', 'invalid navRegion', this.navRegion, 'in', this.name || options.name);
						return;
					}
					
					var targetViewName = pathArray.shift();
					var TargetView = app.get(targetViewName, 'View');

					if(TargetView){
						var navRegion = this.getRegion(this.navRegion);
						if(!navRegion.currentView || TargetView.prototype.name !== navRegion.currentView.name){
							//new
							var view = new TargetView();
							if(navRegion.currentView) navRegion.currentView.trigger('view:navigate-away');
							
							//note that .show() might be async due to region enter/exit effects
							view.once('show', function(){
								view.trigger('view:navigate-chain', pathArray);
							});	
							navRegion.show(view);
							return;
						}else{
							//old
							navRegion.currentView.trigger('view:navigate-chain', pathArray);
						}


					}else{
						pathArray.unshift(targetViewName);
						return this.trigger('view:navigate-to', pathArray.join('/'));	
					}

				};
			}								

			return Old.prototype.constructor.call(this, options);
		},	
	});	

})(Application);
;/**
 * Marionette.CollectionView Enhancements (can be used in CompositeView as well)
 *
 * 1. Render with data 
 * 		view:render-data, view:data-rendered
 * 		
 * 2. Pagination, Filtering, Sorting support
 * 		view:load-page, view:page-changed
 * 		
 * 		TBI: 
 * 		view:sort-by, view:filter-by
 *
 * @author Tim.Liu
 * @created 2014.04.30
 */

;(function(app){

	/**
	 * Meta-event Listeners (pre-defined)
	 * view:render-data
	 * view:load-page
	 */
	_.extend(Backbone.Marionette.CollectionView.prototype, {

		/////////////////////////////
		onRenderData: function(data){
			this.set(data);
			this.trigger('view:data-rendered');
		},

		//no refresh() yet (auto data-url fetch in item-view.js)
		set: function(data, options){
			if(!_.isArray(data)) throw new Error('DEV::CollectionView+::set() You need to have an array passed in as data...');
			
			if(!this.collection){
				this.collection = new Backbone.Collection();
				this.listenTo(this.collection, 'add', this.addChildView);
				this.listenTo(this.collection, 'remove', this.removeItemView);
				this.listenTo(this.collection, 'reset', this.render);
			}
			if(!options)
				return this.collection.reset(data);
			return this.collection.set(data, options);
		},

		get: function(idCidOrModel){
			if(!idCidOrModel)
				return this.collection && this.collection.toJSON();
			return this.collection && this.collection.get(idCidOrModel);
		},
		///////////////////////////////////////////////////////////////////////////
		/**
		 * Note that view:load-page will have its options cached in this._remote
		 *
		 * To reset: (either)
		 * 1. clear this._remote
		 * 2. issue overriding options (including the options for app.remote())
		 */
		onLoadPage: function(options){
			options = _.extend({
				page: 1,
				pageSize: 15,
				dataKey: 'payload',
				totalKey: 'total',
				params: {},
				//+ app.remote() options
			}, this._remote, options);

			//merge pagination ?offset=...&size=... params/querys into app.remote options
			_.each(['params', 'querys'], function(k){
				if(!options[k]) return;

				_.extend(options[k], {
					offset: (options.page -1) * options.pageSize,
					size: options.pageSize
				});
			});

			var that = this;
			//store pagination status for later access
			this._remote = options;

			//allow customized page data processing sequence, but provides a default (onLoadPageDone).
			app.remote(_.omit(options, 'page', 'pageSize', 'dataKey', 'totalKey'))
				.done(function(){
					that.trigger('view:load-page-done', arguments);
				})
				.fail(function(){
					that.trigger('view:load-page-fail', arguments);
				})
				.always(function(){
					that.trigger('view:load-page-always', arguments);
				});
		},

		onLoadPageDone: function(args){
			var result = args[0];
			//render this page:
			this.trigger('view:render-data', result[this._remote.dataKey]);
			//signal other widget (e.g a paginator widget)
			this.trigger('view:page-changed', {
				current: this._remote.page,
				total: Math.ceil(result[this._remote.totalKey]/this._remote.pageSize), //total page-count
			});
		}
	});

})(Application);
;/**
 * i18n plug-in for loading & using localization resource files.
 *
 * Config
 * ------
 * I18N.configure(options) - change the resource folder path or key-trans file name per locale.
 * 	options:
 * 		resourcePath: ... - resource folder path without locale
 * 		translationFile: ... - the file name that holds the key trans pairs for a certain locale.
 *
 * 
 * APIs
 * ----
 * .getResourceProperties(flag) -- get all i18n keys and trans rendered in the app in "key" = "val" format;
 * .getResourceJSON(flag) -- get the above listing in JSON format;
 *
 * use flag = true in the above functions if you only want to get un-translated entries;
 * 
 * 
 * Usage
 * -----
 * 1. load this i18n.js before any of your modules/widgets
 * 2. use '...string...'.i18n() instead of just '...string...',
 * 3. use {{i18n vars/paths or '...string...'}} in templates, {{{...}}} for un-escaped.
 * 4. use $.i18n(options) to translate html tags with [data-i18n-key] [data-i18n-module] data attributes. 
 *
 *
 * Dependencies
 * ------------
 * jQuery, underscore, [Handlebars] 
 *
 * 
 * @author Yan Zhu, Tim Liu
 * @created 2013-08-26
 * @updated 2014-08-06
 * 
 */
var I18N = {};
;(function($, _) {
	
	//----------------configure utils------------------
	var configure = {
		resourcePath: 'static/resource',
		translationFile: 'i18n.json'
	};
	
	var locale, resources;	
	I18N.configure = function(options){
		_.extend(configure, options);
		var params = app.uri(window.location.toString()).search(true);
		locale = I18N.locale = params.locale || configure.locale || Detectizr.browser.language;

		if (locale) {
			// load resources from file
			/**
			 * {locale}.json or {locale}/{translationFile}
			 * {
			 * 	locale: {locale},
			 *  trans: {
			 * 	 key: "" or {
			 * 	  "_default": "",
			 *    {ns}: ""
			 *   }
			 *  }
			 * }
			 */
			$.ajax({
				url: [configure.resourcePath, (configure.translationFile.indexOf('{locale}') >= 0?configure.translationFile.replace('{locale}', locale):[locale, configure.translationFile].join('/'))].join('/'),
				async: false,
				dataType: 'json',
				success: function(data, textStatus, jqXHR) {
					if(!data || !data.trans) throw new Error('RUNTIME::i18n::Malformed ' + locale + ' data...');
					resources = data.trans;
				},
				error: function(jqXHR, textStatus, errorThrown) {
					throw new Error('RUNTIME::i18n::' + errorThrown);
				}
			});

			resources = resources || {};
			
		}		
		return this;
	};
	//-------------------------------------------------
	
	
	/**
	 * =============================================================
	 * String Object plugin
	 * options:
	 * 	module - the module/namespace ref-ed translation of the key.
	 * =============================================================
	 */
	String.prototype.i18n = function(options) {
		var key = $.trim(this);
		
		if (!locale || !key) {
			//console.log('locale', locale, 'is falsy');
			return key;
		}
		
		var translation = resources[key];
		if (typeof(translation) === 'undefined') {
			//console.log('translation', translation, 'is undefined');
			// report this key
			resources[key] = '';

			return key;
		} else if (typeof(translation) === 'object') {
			//console.log('translation', translation, 'is object');
			var ns = (options && options.module) || '_default';
			translation = translation[ns];
			if (typeof(translation) === 'undefined') {
				//console.log('translation', translation, 'is undefined');
				// report this namespace
				resources[key][ns] = '';

				return key;
			}
		}
		translation = String(translation);
		if (translation.trim() === '') {
			return key;
		}
		return translation;
	};

	function getResourceProperties(untransedOnly) {
		var formatted = [];

		function makeNSLine(ns) {
			formatted.push('## module: ');
			formatted.push(ns);
			formatted.push(' ##');
			formatted.push('\n');
		}

		function makeLine(key, value) {
			key = String(key);
			value = String(value);
			formatted.push('"');
			formatted.push(key.replace(/"/g, '\\"'));
			formatted.push('"');
			formatted.push('=');
			formatted.push(value);
			formatted.push('\n');
		}

		_.each(resources, function(value, key) {
			if(untransedOnly && !value) return;

			if (typeof(value) === 'object') {
				_.each(value, function(translation, ns) {
					if (ns !== '_default') {
						makeNSLine(ns);
					}
					makeLine(key, translation);
				});
			} else {
				makeLine(key, value);
			}
		});

		var result = formatted.join('');
		// console.log(result);
		// TODO: write result to file
		return result;
	}

	function getResourceJSON(untransedOnly) {
		var res = resources;
		if(untransedOnly){
			res = _.reject(resources, function(trans, key){
				if(trans) return true; return false;
			});
		}
		return JSON.stringify({
			locale: locale,
			trans: res
		});
	}

	I18N.getResourceProperties = getResourceProperties;
	I18N.getResourceJSON = getResourceJSON;

	/**
	 * =============================================================
	 * Handlebars helper(s) for displaying text in i18n environment.
	 * =============================================================
	 */
	if(Handlebars){
		Handlebars.registerHelper('i18n', function(key, ns, options) {
			if(!options) {
				options = ns;
				ns = undefined;
			}
			if(_.isString(key))
	  			return key.i18n(ns && {module:ns});
	  		if(_.isUndefined(key))
	  			return '';
	  		return key;
		});
	}

	/**
	 * =============================================================
	 * Jquery plugin for linking html tags with i18n environment.
	 * 
	 * data-i18n-key = '*' to use everything in between the selected dom object tag.
	 * <span data-i18n-key="*">abcd...</span> means to use abcd... as the key.
	 *
	 * data-i18n-module = '...' to specify the module/namespace.
	 *
	 * options:
	 * 	1. search, whether or not to use find() to locate i18n tags.
	 * =============================================================
	 */
	function _i18nIterator(index, el) {
		var $el = $(el);
		var key = $el.data('i18nKey');
		var ns = $el.data('i18nModule');
		if(key === '*') key = $.trim($el.html());
		$el.html(key.i18n({module:ns}));
		$el.removeAttr('data-i18n-key');
	}
	$.fn.i18n = function(options){
		options = _.extend({
			//defaults
			search: false
		}, options);

		if(!options.search)
			return this.filter('[data-i18n-key]').each(_i18nIterator);
		else {
			this.find('[data-i18n-key]').each(_i18nIterator);
			return this;
		}
	};


})(jQuery, _);

;/**
 * This is the jquery plugin that fetch and show static .md contents through markd js lib
 * (If you have highlight.js, the code block will be themed for you...)
 *
 * Usage
 * -----
 * ```
 * $.md({
 * 	url: ...
 * 	marked: marked options see [https://github.com/chjj/marked]
 * 	hljs: highlight js configure (e.g languages, classPrefix...)
 *  cb: function($el)...
 * })
 *
 * the $(tag) you used to call .md() can have md="..." or data-md="..." attribute to indicate md file url.
 * ```
 *
 * Note
 * ----
 * Use $.load() if you just want to load html content instead of md coded content into $(tag)
 *
 * Dependency
 * ----------
 * jQuery, Underscore [, Highlight.js]
 *
 *
 * @author Tim.Liu
 * @created 2013.11.05
 * @updated 2014.03.02
 * @updated 2014.05.27 (added md data caching)
 */

(function($){

	/*===============the util functions================*/

	//support bootstrap theme + hilight.js theme.
	function theme($el, options){

		var hljs = window.hljs;
		if(hljs){
			hljs.configure(options && options.hljs);
			$el.find('pre code').each(function(){

				//TBI: detect class:lang-xxxx and color the code block accordingly
				
				hljs.highlightBlock(this);
			});
		}
	}


	/*===============the plugin================*/
	$.fn.md = function(options){
		var that = this;
		if(_.isString(options)) options = { url: options };
		options = options || {};
		options.marked = _.extend({
			gfm: true,
			tables: true,
			breaks: false
		}, options.marked);

		return this.each(function(index, el){
			var $el = $(el);
			var config = $el.data();
			var url = options.url || config.url;
			$.get(url).done(function(res){
				var content;
				content = marked(res, options.marked);

				//delay rendering big chunk of md data till next tick.
				_.defer(function(){
					$el.html(content).addClass('md-content');
					theme($el, options);
					if(options.cb) options.cb($el);
				});

			});
		});
	};



})(jQuery);
;/**
 * The Table-Of-Content plugin used with document html pages.
 *
 * Usage
 * -----
 * $.toc({
 * 	ignoreRoot: false | true - whether to ignore h1
 *  headerHTML: html before ul (sibling) - experimental
 * })
 *
 * Document format
 * ---------------
 * h1 -- book title
 * h2 -- chapters
 * h3 -- sections
 * ...
 *
 * Dependency
 * ----------
 * jQuery, Underscore
 *
 * 
 * @author Tim.Liu
 * @created 2014.03.02
 */

(function($){

	/*===============the util functions================*/
	//build ul/li table-of-content listing
	var order = {};
	for (var i = 1; i <= 6; i++) {
		order['h' + i] = order['H' + i] = i;
	}
	function toc($el, options){
		//default options
		options = _.extend({

			ignoreRoot: false,
			headerHTML: '', //'<h3><i class="fa fa-book"></i> Table of Content</h3>'

		}, options);

		//statistical registry
		var $headers = [];

		//traverse the document tree
		var $root = $('<div></div>').append(options.headerHTML).append('<ul></ul>');
		$root.$children = $root.find('> ul').data('children', []);
		var $index = $root;
		var level = options.ignoreRoot ? 1 : 0;
		$el.find((options.ignoreRoot?'':'h1,') + 'h2,h3,h4,h5,h6').each(function(){

			var $this = $(this);
			var tag = $this.context.localName; //or tagName which will be uppercased
			var title = $this.html();
			var id = $this.attr('id');

			//header in document
			$headers.push($this);

			//node that represent the header in toc html
			var $node = $('<li><a href="#" data-id="' + id + '" action="goTo">' + title + '</a><ul></ul></li>'); //like <li> <a>me</a> <ul>children[]</ul> </li>
			$node.data({
				title: title,
				id: id
			});
			switch(tag){
				case 'h2': case 'H2':
				$node.addClass('chapter');
				break;
				case 'h3': case 'H3':
				$node.addClass('section');
				break;
				default:
				break;
			}
			$node.$children = $node.find('> ul').data('children', []);

			var gap = order[tag] - level;

			if(gap > 0) { //drilling in (always 1 lvl down)
				$node.$parent = $index;
				$index.$children.append($node).data('children').push($node);
				level ++;
			}else if (gap === 0) {
				//back to same level ul (parent li's ul)
				$node.$parent = $index.$parent;
				$index.$parent.$children.append($node).data('children').push($node);
			}else {
				while (gap < 0){
					gap ++;
					$index = $index.$parent; //back to parent li one lvl up
					level --;
				}
				//now $index points to the targeting level node
				$node.$parent = $index.$parent;
				$index.$parent.$children.append($node).data('children').push($node); //insert a same level node besides the found targeting level node
			}
			$index = $node; //point $index to this new node

			//link the document $header element with toc node
			$this.data('toc-node', $node);
			
		});
		$el.data('toc', {
			html: '<div class="md-toc">' + $root.html() + '</div>',
			$headers: $headers, //actual document $(header) node refs
		});
	}

	/*===============the plugin================*/

	//store table-of-content listing in data-toc
	$.fn.toc = function(options){
		return this.each(function(index, el){
			var $el = $(el);
			toc($el, options);
		});
	};

})(jQuery);
;/**
 * This is the plug-in that put an div(overlay) on top of selected elements (inner-div style)
 *
 * Arguments
 * ---------
 * show: true|false show or close the overlay
 * options: {
 * 		class: 'class name strings for styling purposes';
 * 		effect: 'jquery ui effects string', or specifically:
 * 			openEffect: ...,
 * 			closeEffect: ...,
 * 		content: 'text'/html or el or a function($el, $overlay) that returns one of the three.
 * 		onShow($el, $overlay) - show callback;
 * 		onClose($el, $overlay) - close callback;
 * 		move: true|false - whether or not to make the overlay-container draggable through jquery ui.
 * 		resize: true|false - whether or not to make the overlay-container resizable through jquery ui.
 * }
 *
 * Custom Content
 * --------------
 * You can change the content in onShow($el, $overlay) by $overlay.data('content').html(...)
 * or
 * You can pass in view.render().el if you have backbone based view as content. 
 * Note that in order to prevent *Ghost View* you need to close()/clean-up your view object in onClose callback.
 * 
 *
 * Dependencies
 * ------------
 * Handlebars, _, $window, $
 * 
 * @author Tim.Liu
 * @create 2013.12.26
 */

(function($){

	/*===============preparations======================*/
	var template = Handlebars.compile([
		'<div class="overlay {{class}}" style="position:absolute; top: 0; left: 0; right: 0; bottom: 0; {{#unless class}}z-index:{{zIndex}};background:{{background}};{{/unless}}">',
			'<div class="overlay-outer" style="display: table;table-layout: fixed; height: 100%; width: 100%;">',
				'<div class="overlay-inner" style="display: table-cell;text-align: center;vertical-align: middle; width: 100%;">',
					'<div class="overlay-content-ct" style="display: inline-block;outline: medium none; position:relative;">',
						//your overlay content will be put here
					'</div>',
				'</div>',
			'</div>',
		'</div>'
	].join(''));	

	/*===============the util functions================*/

	/*===============the plugin================*/
	$.fn.overlay = function(show, options){
		if(_.isObject(show)){
			options = show;
			show = true;
		}
		if(_.isUndefined(show)) show = false; //$.overlay() closes previous overlay on the element.
		options = options || {};

		return this.each(function(index, el){
			var $el = $(this),
			$overlay;

			if(!show){
				if(!$el.data('overlay')) return;

				$overlay = $el.data('overlay');
				options = _.extend({}, $overlay.data('closeOptions'), options);
				$overlay.hide({
					effect: options.closeEffect || options.effect || 'clip',
					complete: function(){
						if(options.onClose)
							options.onClose($el, $overlay);
						$window.off('resize', $overlay.data('onResize'));
						$overlay.remove();//el, data, and events removed;
						var recoverCSS = $el.data('recover-css');						
						$el.css({
							overflowY: recoverCSS.overflow.y,
							overflowX: recoverCSS.overflow.x,
							position: recoverCSS.position
						});
						$el.removeData('overlay', 'recover-css');
					}
				});
			}else {
				if($el.data('overlay')) return;

				//options default (template related):
				options = _.extend({
					zIndex: 100,
					background: (options.content)?'rgba(0, 0, 0, 0.7)':'none',
					move: false,
					resize: false
				}, options);

				$overlay = $(template(options));
				$el.data('recover-css', {
					overflow: {
						x: $el.css('overflowX'),
						y: $el.css('overflowY')
					},
					position: $el.css('position')
				});				
				$el.append($overlay).css({
					'position': 'relative',
					'overflow': 'hidden'
				});
				//fix the overlay height, this also affect the default 'clip' effect
				if($el[0].tagName === 'BODY') {
					$overlay.offset({top: $window.scrollTop()});
					$overlay.height($window.height());
					$overlay.data('onResize', function(){
						$overlay.height($window.height());
						//console.log('test if listener still there...');
					});
					$window.on('resize', $overlay.data('onResize'));
				}
				$overlay.hide();

				$el.data('overlay', $overlay);
				$container = $overlay.find('.overlay-content-ct');
				if(options.resize) $container.resizable({ containment: "parent" });
				if(options.move) $container.draggable({ containment: "parent" });
				$overlay.data({
					'closeOptions': _.pick(options, 'closeEffect', 'effect', 'duration', 'onClose'),
					'container': $container
				});
				$overlay.data('container').html(_.isFunction(options.content)?options.content($el, $overlay):options.content);
				$overlay.show({
					effect: options.openEffect || options.effect || 'clip',
					complete: function(){
						if(options.onShow)
							options.onShow($el, $overlay);
					}
				});
				
			}

		});
	};

})(jQuery);
;/**
*
* This is the pulg-in that horizontally/vertically spread the children of an div according to the parameter given by user. 
* Additionally, "sub-div"s can freely change their height by dragging a bar inserted by this plug-in. 
* In order to achieve such function, there must be at least two "sub-div"s in the given div.
*
* Usage
* ---------
* someDiv.hsplit(integer or array or NULL, {options});
* someDiv.vsplit(integer or array or NULL, {options});
* 
* Arguments
* ---------
* Three kinds of arugments are allowed for the plugin.
* 
* 1). No argument: if user does not provide any arguments, then this plug-in only inserts divide bars according to the current height of "sub-divs". 
* 					Those divide bars can be dragged to change the size of "sub-div"s.
* 
* 2). Array: user can give an array as an argument, which indicates the height ratio of the "sub-div"s. 
* 		For example: [1,3.5,2] means the three "sub-div"s has height/width ratio of 1:3.5:2. Additionally:
* 		 
* 	i). if the length of the array given by user is less than the number "sub-div"s the requesting div has,
* 		then the "sub-div"s are not assigned a ratio, will be marked as ratio 1. 
* 		For example: if the requesting div has 5 "sub-div"s, and user gives array [1,3,2] as argument, then the plug-in fills given as [1,3,2,1,1].
* 		
* 	ii). if the length of the array given by user is greater than the number "sub-div"s the requesting div has, 
* 		then this plug-in returns an error.
*
* 3). A positive number: user can give a single number as an argument, this plug-in will treat it as the first number of the array mentioned before.
* 		For example: if user give 1 as argument, then all the "sub-div"s will be spread evenly. Because the plug-in will fill the ratio array as [1,1,1.....]
*
* Additionally, this plug-in privides options for custmizing div-bar style.
* 
* Options: {
* 	hBarClass/vBarClass: string; defines the css class name for divide bars
* }
* 
* Dependencies
* ------------
* _, $
*
* @author Patrick Zhu
* @create 2015.10.20 
*/



(function($){

	/*===============the hsplit plugin================*/
	$.fn.hsplit = function(args, options){
		var $this = $(this),
			that = this,
			length = $this.children().filter('div').length,
			tempArr;
		options = options || {};
		//get the class name for the divider bars
		var tempClass = options.hBarClass || 'split-hbar';
		//get the height of divide bars by adding an element then remove it
		var tempElem = '<div class = "' + tempClass + '"></div>';
		$this.before(tempElem);
		var barWidth = $this.prev().height();
		$this.prev().remove();

		//check whether the requesting div has at least two "sub-div"s
		if( !length || length < 2 ){
			throw new Error("RUNTIME::hsplit:: You need at least two 'sub-div's");
		}else{
			//check validation of arguments
			if(!args){//no arguments, spread evenly
				//no arguments, only insert bars
				tempArr = [];
				//get the height of each current div, then calculate the ratio, and put it into ratio array
				_.each($this.children().filter('div'), function(data, index){
					tempArr[index] = $(data).height() ;
				});
				//pass the ratio array to setLayout, to set the layout :P
				setLayout(this, tempArr);
			}else{
				//array
				if( _.isArray(args) ){
					//error
					if(args.length > length)
						throw new Error("RUNTIME::hsplit:: Arugment length is greater than the number of 'sub-div's");
					//length are equal
					else if(args.length === length){
						setLayout(this, args);
					}
					//fillup the ratios
					else if(args.length > 0){
						tempArr = args;
						fillOnes(tempArr, length);
						setLayout(this, tempArr);
					}
					else{
						throw new Error("RUNTIME::hsplit:: Arugment length is ZERO!");
					}
				}
				//number
				else if( _.isNumber(args) && !_.isNaN(args) ){
					//check whether number is positive
					if( args <= 0){
						throw new Error("RUNTIME::hsplit:: Single number must be a positive number");
					}else{
						tempArr = [];
						tempArr[0] = args;
						fillOnes(tempArr, length);
						setLayout(this, tempArr);
					}
				}
				else{
					options = args;
					tempClass = options.vBarClass || 'split-vbar';
					//no arguments, only insert bars
					tempArr = [];
					//get the height of each current div, then calculate the ratio, and put it into ratio array
					_.each($this.children().filter('div'), function(data, index){
						tempArr[index] = $(data).height() ;
					});
					//pass the ratio array to setLayout, to set the layout :P
					setLayout(this, tempArr);
				}//else for object
			}
		}//else

		//this function takes an array of ratios of "sub-div"s, and
		//set the layout accordingly
		function setLayout(target, ratioArr){
			var length = ratioArr.length,
				conHeight = $(target).height() - ( length - 1 ) * barWidth,
			//calculate height for each "sub-div" in terms of percentage
				sum = 0;
			_.each(ratioArr, function(data, index){
				sum += data;
			});
			var perHeight = [];
			_.each(ratioArr, function(data, index){
				perHeight[index] = ( ( conHeight / sum * data ) / ( $(target).height() ) ) * 100;//in percentage
			});
			//draw the layout
			//set up the position attribute for the parent div
			if($(target).css('position') !== 'absolute' && $(target).css('position') !== 'relative')
				$(target).css({'position':'relative'});
			//
			var top = 0;
			$(target).children().filter('div').each(function(index, elem){
				var $elem = $(this);
				//barwidth in percentage
				var barPercentage = barWidth/($(target).height())*100;
				//set up css for current "sub-div" in terms of percentage
				$elem.css({'position':'absolute', 'top':top+'%','left':'0','width':'100%','height':perHeight[index]+'%'});

				top += perHeight[index];
				//draw the divide bars, last "sub-div" does not need divde bar
				if( index < length-1 ){
					var temp = '<div class="'+tempClass+'" style="position:absolute;width:100%;left:0;top:'+top+'%;"></div>';
					$elem.after(temp);
					//add mouseover and resize event
					$elem.next()
					.mouseover(function(){
						$(this).css({'cursor':'ns-resize'});
					})
					.mousedown(function(){
						var that = this;
						$(target).bind('mousemove', function(event){
							//get relative postion
							var relY = event.pageY - $(this).offset().top,
								preTop = $(that).prev().position().top,
								nextBottom = $(that).next().position().top + $(that).next().height();
							if(relY > ( preTop + barWidth ) && relY < ( nextBottom - barWidth ) ){
								$(that).css({'top':(relY/$(target).height())*100+'%'});
								//resize "sub-div"s next to the current divider
								resetDiv(that);
							}
						}).mouseup(function(){
							$(target).unbind('mousemove');
						});
						//track window mouseup 
						$(window).mouseup(function(){
							$(target).unbind('mousemove');
						});
					});
					//accumulate the top
					top += barPercentage;
				}
			});
		}

		//this function expand the "sub-divs" according to the position of divide bars
		function resetDiv(divider){
			var $divider = $(divider),
				preHeight = $divider.prev().height(),
				preTop = $divider.prev().position().top,
				nextTop = $divider.next().position().top,
				nextBottom = nextTop + $divider.next().height(),
				divTop = $divider.position().top,
				divHeight = $divider.height(),
				height = $divider.parent().height();
			$divider.prev().css({'height': (( divTop - preTop ) / height) * 100 + '%'});
			$divider.next().css({'top':(( divTop + divHeight ) / height) * 100 + '%', 'height': (( nextBottom - ( divTop + divHeight )) / height ) * 100 + '%'});

		}

		//this function fills given array 1s,
		//the total number of "sub-div"s is given by total
		function fillOnes(array, total){
			var length = array.length;
			array.length = total; //"ie?"
			for( length; length < total; length++ ){
				array[length] = 1;
			}
		}
		return this;
	};


	/*===============the vsplit plugin================*/
	$.fn.vsplit = function(args, options){
		var $this = $(this),
			that = this,
			length = $(this).children().filter('div').length,
			tempArr;
		options = options || {};
		//get the class name for the divider bars
		var tempClass = options.vBarClass || 'split-vbar';

		//get the height of divide bars by adding an element then remove it
		var tempElem = '<div class="'+tempClass+'"></div>';
		$this.after(tempElem);
		var barWidth = $(this).next().width();
		$this.next().remove();

		//check whether the requesting div has at least two "sub-div"s
		if( !length || length < 2 ){
			throw new Error("RUNTIME::vsplit:: You need at least two 'sub-div's");
		}else{
			//check validation of arguments
			if( !args ){
				//no arguments, only insert bars
				tempArr = [];
				//get the height of each current div, then calculate the ratio, and put it into ratio array
				_.each($this.children().filter('div'), function(data, index){
					tempArr[index] = $(data).width() ;
				});
				//pass the ratio array to setLayout, to set the layout :P
				setLayout(this, tempArr);
			}else{
				//array
				if( _.isArray(args) ){
					//error
					if(args.length > length)
						throw new Error("RUNTIME::vsplit:: Arugment length is greater than the number of 'sub-div's");
					//length are equal
					else if(args.length === length){
						setLayout(this, args);
					}
					//fillup the ratios
					else if(args.length > 0){
						tempArr = args;
						fillOnes(tempArr, length);
						setLayout(this, tempArr);
					}
					else{
						throw new Error("RUNTIME::vsplit:: Arugment length is ZERO!");
					}
				}//if
				//number
				else if( _.isNumber(args) && !_.isNaN(args) ){
					//check whether number is positive
					if( args <= 0){
						throw new Error('RUNTIME::vsplit:: Single number must be a positive number');
					}else{
						tempArr = [];
						tempArr[0] = args;
						fillOnes(tempArr, length);
						setLayout(this, tempArr);
					}
				}//else if number
				else{
					options = args;
					tempClass = options.vBarClass || 'split-vbar';
					//no arguments, only insert bars
					tempArr = [];
					//get the height of each current div, then calculate the ratio, and put it into ratio array
					_.each($this.children().filter('div'), function(data, index){
						tempArr[index] = $(data).width() ;
					});
					//pass the ratio array to setLayout, to set the layout :P
					setLayout(this, tempArr);
				}//else for object

			}//else
		}//else

		//this function takes an array of ratios of "sub-div"s, and
		//set the layout accordingly
		function setLayout(target, ratioArr){
			var length = ratioArr.length,
				conWidth = $(target).width() - ( length-1 ) * barWidth,
			//calculate height for each "sub-div" in terms of percentage
				sum = 0;
			_.each(ratioArr, function(data, index){
				sum += data;
			});
			var perWidth = [];
			_.each(ratioArr, function(data, index){
				perWidth[index] = ( ( conWidth / sum * data ) / ( $(target).width() ) ) * 100;//in percentage
			});
			//draw the layout
			//set up the position attribute for the parent div
			if($(target).css('position') !== 'absolute' && $(target).css('position') !== 'relative'){
				$(target).css({'position':'relative'});
			}
				
			//
			var left = 0;
			$(target).children().filter('div').each(function(index, elem){
				var $elem = $(this);
				//barwidth in percentage
				var barPercentage = barWidth / ( $(target).width() ) * 100;
				//set up css for current "sub-div" in terms of percentage
				$elem.css({'position':'absolute', 'top':0,'left':left+'%','height':'100%','width':perWidth[index]+'%'});

				left += perWidth[index];
				//draw the divide bars, last "sub-div" does not need divde bar
				if( index < length-1 ){
					var temp = '<div class="'+tempClass+'" style="position:absolute;height:100%;top:0;left:'+left+'%;"></div>';
					$elem.after(temp);
					//add mouseover and resize event
					$elem.next()
					.mouseover(function(){
						$(this).css({'cursor':'ew-resize'});
					})
					.mousedown(function(){
						var that = this;
						$(target).bind('mousemove', function(event){
							//get relative postion
							var relX = event.pageX - $(this).offset().left,
								preLeft = $(that).prev().position().left,
								nextRight = $(that).next().position().left + $(that).next().width();
							if(relX > ( preLeft + barWidth ) && relX < ( nextRight - barWidth ) ){
								$(that).css({'left':( relX / $(target).width() ) * 100 + '%'});
								//resize "sub-div"s next to the current divider
								resetDiv(that);
							}
						}).mouseup(function(){
							$(target).unbind('mousemove');
						});
						//track window mouseup 
						$(window).mouseup(function(){
							$(target).unbind('mousemove');
						});
					});
					//accumulate the left
					left += barPercentage;
				}
			});
		}

		//this function expand the "sub-divs" according to the position of divide bars
		function resetDiv(divider){
			var $divider = $(divider),
				preWidth = $divider.prev().width(),
				preLeft = $divider.prev().position().left,
				nextLeft = $divider.next().position().left,
				nextRight = nextLeft + $divider.next().width(),
				divLeft = $divider.position().left,
				divWidth = $divider.width(),
				width = $divider.parent().width();
			$divider.prev().css({'width': (( divLeft - preLeft) / width ) * 100 + '%'} );
			$divider.next().css({'left':(( divLeft + divWidth) / width) * 100 + '%', 'width': (( nextRight - ( divLeft + divWidth )) / width) * 100 + '%'});

		}

		//this function fills given array 1s,
		//the total number of "sub-div"s is given by total
		function fillOnes(array, total){
			var length = array.length;
			array.length = total;
			for( length; length < total; length++ ){
				array[length] = 1;
			}
		}
		return this;
	};


})(jQuery);
;/**
 * This is the code template for **basic** <input>, <select>, <textarea> editor.
 *
 * Note that the validate function defaults on no-op. You should override this according to field settings during form/formPart init.
 *
 * Init Options
 * ============
 * [layout]: { - Note that if you use this layout class, you must also use form-horizontal in the outter most form container
 * 		label: in col-..-[1..12] bootstrap 3 grid class
 * 		field: ...
 * }
 * type (see predefined/parts/editors/README.md)
 * label
 * help
 * tooltip
 * placeholder
 * value: default value
 * 
 * //radios/selects/checkboxes only
 * options: { 
 * 	inline: true|false (for radios and checkboxes only - note that the choice data should be prepared and passed in instead of using url or callbacks to fetch within the editor)
 * 	data: [] or {group:[], group2:[]} - (groups are for select only)
 * 	labelField
 * 	valueField
 * 	remote: app.remote() options for fetching the options.data
 * }
 *
 * //select only
 * multiple
 * 
 * //textarea only 
 * rows
 * 
 * //single checkbox only
 * boxLabel: (single checkbox label other than field label.)
 * checked: '...' - checked value
 * unchecked: '...' - unchecked value
 *
 * //specifically for file only (see also fileeditor.upload(options))
 * upload: {
 * 	standalone: false/true - whether or not to display a stand-alone upload button for this field.
 * 	formData: - an {} or function to return additional data to be submitted together with the file.
 * 	fileInput: - a jQuery collection of input[type=file][name=file[]] objects. (for multi-file upload through one editor api)
 * 	url - a string indicating where to upload the file to.
 * 	...  see complete option listing on [https://github.com/blueimp/jQuery-File-Upload/wiki/Options].
 *
 *  callbacks: { - with 'this' in the callbacks pointing to the editor.
 *  	done/fail/always/progress ... - see complete callback listing on [https://github.com/blueimp/jQuery-File-Upload/wiki/Options].
 *  }
 * }
 * 
 * validate (custom function and/or rules see core/parts/editors/basic/validations.js) - The validation function should return null or 'error string' to be used in status.
 * parentCt - event delegate.
 *
 * Events
 * ======
 * editor:change
 * editor:keyup
 * editor:focusin/out
 *
 * Constrain
 * =========
 * Do addon/transform stuff in onRender() *Do NOT* use onShow() it won't be invoked by enableEditors() enhancement in ItemView/Layout.
 * 
 *
 * @author Tim.Liu
 * @contributor Yan.Zhu
 * @created 2013.11.10
 * @updated 2014.02.26 [Bootstrap 3.1]
 * @version 1.2.0
 */

;(function(app){

	app.Core.Editor.register('Basic', function(){

		var UI = app.view({

			template: '#editor-basic-tpl',
			className: 'form-group', //this class is suggested to be removed if there is no label in this editor options.
			type: 'ItemView',
			forceViewType: true, //supress ItemView type warning by framework.

			events: {
				//fired on both parentCt and this editor
				'change': '_triggerEvent', 
				'keyup input, textarea': '_triggerEvent', 
				'focusout': '_triggerEvent', 
				'focusin': '_triggerEvent' 
			},

			//need to forward events if has this.parentCt
			_triggerEvent: function(e){
				var host = this;
				host.trigger('editor:' + e.type, this.model.get('name'), this);
				//host.trigger('editor:' + e.type + ':' + this.model.get('name'), this);

				if(this.parentCt){
					host = this.parentCt;
				}
				host.trigger('editor:' + e.type, this.model.get('name'), this);
				//host.trigger('editor:' + e.type + ':' + this.model.get('name'), this);
		
			},

			initialize: function(options){
				//[parentCt](to fire events on) as delegate
				this.parentCt = options.parentCt || this.parentCt;
				
				//prep the choices data for select/radios/checkboxes
				if(options.type in {'select': true, 'radios': true, 'checkboxes': true}){
					switch(options.type){
						case 'radios':
						options.type = 'radio'; //fix the <input> type
						break;
						case 'checkboxes':
						options.type = 'checkbox'; //fix the <input> type
						break;
						default:
						break;
					}

					options.options = options.options || {};
					options.options = _.extend({
						data: [],
						valueField: 'value',
						labelField: 'label'
					}, options.options);

					var choices = options.options; //for easy reference within extractChoices()
					var extractChoices = function (data){
						if(_.isObject(data[0])){
							data = _.map(data, function(c){
								return {value: c[choices.valueField], label: c[choices.labelField]};
							});
						}else {
							data = _.map(data, function(c){
								return {value: c, label: _.string.titleize(c)};
							});
						}
						return data;
					};

					var prepareChoices = function (choices){

						if(!_.isArray(choices.data)){
							choices.grouped = true;
						}

						if(choices.grouped){
							//select (grouped)
							_.each(choices.data, function(array, group){
								choices.data[group] = extractChoices(array);
							});
						}else {
							//select, radios, checkboxes
							choices.data = extractChoices(choices.data);
						}

						return choices;
					};

					if(!choices.remote)
						prepareChoices(options.options);
					else
						this.listenToOnce(this, 'render', function(){
							var that = this;
							app.remote(choices.remote).done(function(data){
								
								//Warning: to leave less config overhead, developers have no way to pre-process the choice data returned atm.
								that.setChoices(data);
							});
						});

					//give it a method for reconfigure the choices later
					this.setChoices = function(data){
						var choices = this.model.get('options');
						choices.data = data;
						this.model.set('options', prepareChoices(choices));
						this.render();
					};
				}

				//prep basic editor display
				var uuiid = _.uniqueId('basic-editor-'); //unique UI id
				this.model = new Backbone.Model({
					uiId: uuiid, 
					layout: options.layout || '',
					name: options.name, //*required
					type: options.type, //default: text
					multiple: options.multiple || false, //optional
					rows: options.rows || 3, //optional
					fieldname: options.fieldname || uuiid, //optional - not recommended, 1. with jquery.serializeForm plugin, 2. prevent same-def form radios collision
					label: options.label || '', //optional
					placeholder: options.placeholder || '', //optional

					help: options.help || '', //optional
					tooltip: (_.isString(options.tooltip) && options.tooltip) || '', //optional
					options: options.options || undefined, //optional {inline: true|false, data:[{label:'l', val:'v', ...}, {label:'ll', val:'vx', ...}] or ['v', 'v1', ...], labelField:..., valueField:...}
					//specifically for a single checkbox field:
					boxLabel: options.boxLabel || '',
					value: options.value,
					checked: options.checked || true,
					unchecked: options.unchecked || false
				});

				//prep validations
				if(options.validate) {
					this.validators = _.map(options.validate, function(validation, name){
						if(_.isFunction(validation)){
							return {fn: validation};
						}else 
							return {rule: name, options:validation};
					});
					//forge the validation method of this editor				
					this.validate = function(show){
						if(!this.isEnabled()) return; //skip the disabled ones.
						
						var error;
						if(_.isFunction(options.validate)) {
							error = options.validate(this.getVal(), this.parentCt); 

						}
						else {
							var validators = _.clone(this.validators);
							while(validators.length > 0){
								var validator = validators.shift();
								if(validator.fn) {
									error = validator.fn(this.getVal(), this.parentCt);
								}else {
									error = (app.Core.Editor.rules[validator.rule] && app.Core.Editor.rules[validator.rule](validator.options, this.getVal(), this.parentCt));
								}
								if(!_.isEmpty(error)) break;
							}
						}
						if(show) {
							this._followup(error); //eager validation, will be disabled if used in Compound editor 
							//this.status(error);
						}
						return error;//return error msg or nothing						
					};

					//internal helper function to group identical process (error -> eagerly validated)
					this._followup = function(error){
						if(!_.isEmpty(error)){
							this.status(error);
							//become eagerly validated
							this.eagerValidation = true;
						}else {
							this.status();
							this.eagerValidation = false;
						}
					};
					this.listenTo(this, 'editor:change editor:keyup', function(){
						if(this.eagerValidation)
							this.validate(true);
					});

				}

				//prep tooltip upon rendered.
				if(options.tooltip)
					this.enableTooltips(_.isObject(options.tooltip)?options.tooltip:{});

				//prep fileupload if type === 'file'
				if(options.type === 'file'){
					this.enableActionTags('Editor.File');
					if(!options.upload || !options.upload.url) throw new Error('DEV::Editor.Basic.File::You need options.upload.url to point to where to upload the file.');

					//1. listen to editor:change so we can reveal [upload] and [clear] buttons
					this.listenTo(this, 'editor:change', function(){
						if(this.ui.input.val()){
							if(options.upload.standalone)
								this.ui.upload.removeClass('hidden').show();
							this.ui.clearfile.removeClass('hidden').show();
						}
						else {
							this.ui.upload.hide();
							this.ui.clearfile.hide();
						}
					});
					this.onRender = function(){

						this.$el.fileupload({
							fileInput: null, //-remove the plugin's 'change' listener to delay the add event.
							//forceIframeTransport: true, //-note that if iframe is used, error/fail callback will not be possible without further hack using frame['iframe name'].document
						});

						if(options.upload.callbacks){
							_.each(options.upload.callbacks, function(f, e){
								this.$el.bind('fileupload' + e, _.bind(f, this));
							}, this);
						}
					};
					
					_.extend(this.actions, {
						//2. implement [clear] button action
						clear: function(){
							this.setVal('', true);
						},
						//3. implement [upload] button action
						upload: function(){
							var that = this;
							this.upload(_.extend({
								//stub success callback:
								success: function(reply){
									that.ui.result.html(_.isString(reply)?reply.i18n():JSON.stringify(reply));
									_.delay(function(){
										that.ui.result.empty();
									}, 6000)
								}
							}, options.upload));
						}
					});

					//unique editor api
					this.upload = function(config){
						config = _.extend({}, options.upload, config);
						//fix the formData value
						if(config.formData) 
							config.formData = _.result(config, 'formData');
						
						//fix the url with app.config.baseAjaxURI
						if(app.config.baseAjaxURI)
							config.url = [app.config.baseAjaxURI, config.url].join('/');

						//send the file(s) through fileupload plugin.
						this.$el.fileupload('send', _.extend({
							timeout: app.config.timeout * 2,
							fileInput: this.ui.input,
						}, config));
					};

				}

			},

			isEnabled: function(){
				return !this._inactive;
			},
			
			disable: function(flag){

				if(flag === false){
					this._inactive = false;
				}else {
					this._inactive = true;
				}

				if(_.isUndefined(flag)){
					//disable but visible, will not participate in validation
					if(this.ui.input)
						this.ui.input.prop('disabled', true);
					return;
				}

				if(flag){
					//hide and will not participate in validation
					this.$el.hide();
				}else {
					//shown and editable
					if(this.ui.input)
						this.ui.input.prop('disabled', false);
					this.$el.show();
				}
			},

			setVal: function(val, loud){
				if(this.ui.inputs){
					//radios/checkboxes
					this.ui.inputs.find('input').val(_.isArray(val)?val:[val]);
				}else if(this.ui['input-ro']){
					val = _.escape(val);
					this.ui['input-ro'].data('value', val).html(val);
				}else {
					if(this.model.get('type') === 'checkbox'){
						this.ui.input.prop('checked', val === this.model.get('checked'));
					}
					this.ui.input.val(val);
				}
				if(loud) {
					this._triggerEvent({type: 'change'});
				}
			},

			getVal: function(){
				if(!this.isEnabled()) return; //skip the disabled ones.

				if(this.ui.inputs){
					//radios/checkboxes
					var result = this.$('input:checked').map(function(el, index){
						return $(this).val();
					}).get();
					if(this.model.get('type') === 'radio') result = result.pop();
					return result;
				}else {
					if(this.model.get('type') === 'checkbox'){
						return this.ui.input.prop('checked')? (this.model.get('checked') || true) : (this.model.get('unchecked') || false);
					}
					if(this.ui.input)
						return this.ui.input.val();
					
					//skipping input-ro field val...
				}
			},

			validate: $.noop,

			status: function(options){
			//options: 
			//		- false/undefined: clear status
			//		- object: {
			//			type:
			//			msg:
			//		}
			//		- string: error msg

				//set or clear status of this editor UI
				if(options){

					var type = 'error', msg = options;
					if(!_.isString(options)){
						type = options.type || type;
						msg = options.msg || type;
					}

					//set warning, error, info, success... msg type, no checking atm.
					var className = 'has-' + type;
					this.$el
						.removeClass(this.$el.data('type-class'))
						.addClass(className)
						.data('type-class', className);
					this.ui.msg.html(msg.i18n());

				}else {
					//clear
					this.$el
						.removeClass(this.$el.data('type-class'))
						.removeData('type-class');
					this.ui.msg.empty();
				}
			}

		});

		UI.supported = {
			'ro': true,
			'text': true,
			'textarea': true,
			'select': true,
			'file': true,
			'checkboxes': true,
			'checkbox': true,
			'radios': true,
			'hidden': true,
			'password': true,
			//h5 only (use Modernizr checks)
			'number': Modernizr.inputtypes.number,
			'range': Modernizr.inputtypes.range,
			'email': Modernizr.inputtypes.email,
			'tel': Modernizr.inputtypes.tel,
			'search': Modernizr.inputtypes.search,
			'url': Modernizr.inputtypes.url,
			'color': Modernizr.inputtypes.color,
			'time': Modernizr.inputtypes.time,
			'date': Modernizr.inputtypes.date,
			'datetime': Modernizr.inputtypes.datetime,
			'datetime-local': Modernizr.inputtypes['datetime-local'],
			'month': Modernizr.inputtypes.month,
			'week': Modernizr.inputtypes.week,
		};

		return UI;

	});



	app.Util.Tpl.build('editor-basic-tpl', [
		'{{#if label}}',
			'<label class="control-label {{#if layout}}{{layout.label}}{{/if}}" for="{{uiId}}">{{i18n label}}</label>',
		'{{/if}}',
		'<div class="{{#if layout}}{{layout.field}}{{/if}}" data-toggle="tooltip" title="{{i18n tooltip}}">', //for positioning with the label.

			//1. select
			'{{#is type "select"}}',
				'<select ui="input" name="{{#if fieldname}}{{fieldname}}{{else}}{{name}}{{/if}}" class="form-control" id="{{uiId}}" {{#if multiple}}multiple="multiple"{{/if}} style="margin-bottom:0">',
					'{{#if options.grouped}}',
						'{{#each options.data}}',
						'<optgroup label="{{i18n @key}}">',
							'{{#each this}}',
							'<option value="{{value}}">{{i18n label}}</option>',
							'{{/each}}',
						'</optgroup>',
						'{{/each}}',
					'{{else}}',
						'{{#each options.data}}',
						'<option value="{{value}}">{{i18n label}}</option>',
						'{{/each}}',
					'{{/if}}',
				'</select>',
			'{{else}}',
				//2. textarea
				'{{#is type "textarea"}}',
					'<textarea ui="input" name="{{#if fieldname}}{{fieldname}}{{else}}{{name}}{{/if}}" class="form-control" id="{{uiId}}" rows="{{rows}}" placeholder="{{i18n placeholder}}" style="margin-bottom:0"></textarea>',
				'{{else}}',
					//3. input
					//checkboxes/radios
					'{{#if options}}',
						'<div ui="inputs" id={{uiId}}>',
						'{{#each options.data}}',
							'{{#unless ../options.inline}}<div class="{{../../type}}">{{/unless}}',
							'<label class="{{#if ../options.inline}}{{../../type}}-inline{{/if}}">',
								//note that the {{if}} within a {{each}} will impose +1 level down in the content scope.  
								'<input ui="input" name="{{#if ../fieldname}}{{../../fieldname}}{{else}}{{../../name}}{{/if}}{{#is ../type "checkbox"}}[]{{/is}}" type="{{../type}}" value={{value}}> {{i18n label}}',
							'</label>',
							'{{#unless ../options.inline}}</div>{{/unless}}',
						'{{/each}}',
						'</div>',
					//single field
					'{{else}}',
						'<div class="{{type}}">',
						'{{#is type "checkbox"}}',
							//single checkbox
							'<label>',
								//note that the {{if}} within a {{each}} will impose +1 level down in the content scope.  
								'<input ui="input" name="{{#if fieldname}}{{fieldname}}{{else}}{{name}}{{/if}}" type="checkbox" value="{{value}}"> {{i18n boxLabel}}',
							'</label>',
						'{{else}}',
							//normal field
							'{{#is type "ro"}}',//read-only
								'<div ui="input-ro" data-value="{{{value}}}" class="form-control-static">{{value}}</div>',
							'{{else}}',
								'<input ui="input" name="{{#if fieldname}}{{fieldname}}{{else}}{{name}}{{/if}}" {{#isnt type "file"}}class="form-control"{{else}} style="display:inline;" {{/isnt}} type="{{type}}" id="{{uiId}}" placeholder="{{i18n placeholder}}" value="{{value}}"> <!--1 space-->',
								'{{#is type "file"}}',
									'<span action="upload" class="hidden file-upload-action-trigger" ui="upload" style="cursor:pointer;"><i class="glyphicon glyphicon-upload"></i> <!--1 space--></span>',
									'<span action="clear" class="hidden file-upload-action-trigger" ui="clearfile"  style="cursor:pointer;"><i class="glyphicon glyphicon-remove-circle"></i></span>',
									'<span ui="result" class="file-upload-result wrapper-horizontal"></span>',
								'{{/is}}',							
							'{{/is}}',
						'{{/is}}',
						'</div>',	
					'{{/if}}',
				'{{/is}}',
			'{{/is}}',

			//msg & help
			'{{#if help}}<span class="help-block editor-help-text" style="margin-bottom:0"><small>{{i18n help}}</small></span>{{/if}}',
			'<span class="help-block editor-status-text input-error" ui="msg">{{i18n msg}}</span>',
		'</div>'
	]);

})(Application);
;/**
 * Pre-defined validation rules/methods for basic editors.
 *
 * Rule Signature
 * --------------
 * name: function(options, val, form){
 * 	return nothing if ok
 * 	return error message if not
 * }
 *
 * Method Signature
 * ----------------
 * anything: function(val, form){
 * 	... same as rule signature
 * }
 *
 * Editor Config
 * -------------
 * validate: {
 * 	rule: options,
 * 	rule2: options,
 * 	fn: function(val, form){} - custom method
 * 	rule3: function(val, form){} - overriding existing rule for this editor
 * 	...
 * }
 *
 * or 
 *
 * validate: function(val, form){}
 *
 * A little note
 * -------------
 * We use the Application.Core.Editor module to register our validation rules, the enhanced editors or total customized editors might use them through the underlying basic editor(s) involved.
 *
 * @author Tim.Liu
 * @created 2013.11.13
 */

;(function(app){


	//preset rules
	app.Core.Editor.rules = {

		required: function(options, val, form){
			if(!val) return (_.isObject(options) && options.msg) || 'This field is required';
		}

	};

	//adding new rules at runtime
	app.Core.Editor.addRule = function(name, fn){
		if(!name || !_.isFunction(fn)) throw new Error('DEV::Editor::Basic validation rule must have a name and a function implementation.');
		if(app.Core.Editor.rules[name]) console.warn('DEV::Editor::Basic validation rule name ['+ name +'] is already defined.');

		app.Core.Editor.rules[name] = fn;
	};

})(Application);
;/**
 * This is the minimum Datagrid widget for data tables
 *
 * [table]
 * 		[thead]
 * 			<tr> th, ..., th </tr>
 * 		[tbody]
 * 			<tr> td, ..., td </tr>
 * 			...
 * 			<tr> ... </tr>
 *
 * Options
 * -------
 * 1. data []: rows of data
 * 2. columns [
 * 		{
 * 			name: datum key in data row
 * 			cell: cell name
 * 			header: header cell name
 * 			label: name given to header cell (instead of _.titleize(name))
 * 		}
 * ]
 * 3. details: false or datum name in data row or a view definition (render with row.model) - TBI
 * 
 *
 * Events
 * ------
 * 1. row:clicked
 * 2. row:dblclicked
 * 
 * 
 * Note
 * ----
 * The details row appears under each normal data row;
 *
 * TBI
 * ---
 * select header/cell
 * details row is still in TBI status (extra tr stub, view close clean up)
 * 
 * 
 * @author Tim.Liu
 * @created 2014.04.22
 */

;(function(app){

	app.widget('Datagrid', function(){

		var UI = app.view({
			tagName: 'table',
			template: [
				'<thead region="header"></thead>',
				'<tbody region="body"></tbody>'
			],
			initialize: function(options){
				this._options = _.extend({
					data: [],
					details: false,
					columns: []
				}, options);
			},
			onShow: function(){
				this.header.show(new HeaderRow());
				this.body.show(new Body({
					//el can be css selector string, dom or $(dom)
					el: this.body.$el 
					//Note that a region's el !== $el[0], but a view's el === $el[0] in Marionette
				}));
				this.trigger('view:reconfigure', this._options);
			},
			onReconfigure: function(options){
				options = options || {};
				//1. reconfigure data and columns into this._options
				this._options = _.extend(this._options, options);

				//2. rebuild header cells - let it rerender with new column array
				_.each(this._options.columns, function(column){
					column.header = column.header || 'string';
					column.cell = column.cell || column.header || 'string';
					column.label = column.label || _.string.titleize(column.name);
				});				
				this.header.currentView.set(this._options.columns);

				//3. rebuild body rows - let it rerender with new data array
				this.body.currentView._options = this._options;
				this.body.currentView.set(this._options.data);

				//4. trigger overall view:data-rendered
				this.trigger('view:data-rendered');
			},
			set: function(data){
				//override the default data rendering meta-event responder
				this.trigger('view:reconfigure', {data: data});
				//this is just to answer the 'view:render-data' event
			},
			get: function(){
				return this.getBody().get();
			},
			getBody: function(){
				return this.body.currentView;
			},
			getHeader: function(){
				return this.header.currentView;
			}
		});

		var HeaderRow = app.view({
			type: 'CollectionView',
			forceViewType: true,
			itemView: 'dynamic',
			itemViewEventPrefix: 'headercell',
			tagName: 'tr',
			initialize: function(options){
				this.grid = this.parentCt || (options && options.grid); //give each row the grid view ref.
			},
			//buildItemView - select proper header cell
			buildItemView: function(item, ItemViewType, itemViewOptions){
				return app.widget(_.string.classify([item.get('header'), 'header', 'cell'].join('-')), {
					model: item,
					tagName: 'th',

					row: this //link each cell with the row. (use/link it in cell's init())
				});
			}
		});

		var Row = app.view({
			type: 'CollectionView',
			forceViewType: true,
			itemView: 'dynamic',
			itemViewEventPrefix: 'cell',
			tagName: 'tr',
			triggers: { //forward DOM events to row
				'click': {
					event: 'clicked',
					preventDefault: false //for cell elements to work properly (checkbox/radio/<anchor/>)
				},
				'dblclick': {
					event: 'dblclicked',
					preventDefault: false
				}
			},
			initialize: function(options){
				this.grid = options.body.parentCt; //give each row the grid view ref.
			},
			//buildItemView - select proper cell
			buildItemView: function(item, ItemViewType, itemViewOptions){
				return app.widget(_.string.classify([item.get('cell'), 'cell'].join('-')), {
					tagName: 'td',
					model: item,

					row: this //link each cell with the row. (use/link it in cell's init())
				});
			}			
		});

		var Body = app.view({
			type: 'CollectionView',
			forceViewType: true,
			itemView: Row,
			itemViewEventPrefix: 'row',
			itemViewOptions: function(model, index){
				return {
					collection: app.collection(_.map(this._options.columns, function(column){
						return _.extend({
							value: app.extract(column.name || '', model.attributes),
							index: index
						}, column);
					}, this)),

					body: this //passing body to row view
				};
			},
			itemEvents: { //forward row events to grid
				'clicked': function(e, row){
					row.grid.trigger('row:clicked', row);
				},
				'dblclicked': function(e, row){
					row.grid.trigger('row:dblclicked', row);
				}
			}
		});
		return UI;

	});

})(Application);
;/**
 * The Default String Column Header Definition.
 *
 * @author Tim.Liu
 * @created 2013.11.25
 * @updated 2014.04.22
 */


;(function(app){

	app.widget('StringHeaderCell', function(){

		var UI = app.view({
			template: '<span><i class="{{icon}}"></i> {{{i18n label}}}</span>',
		});

		return UI;
	});

})(Application);
;/**
 * The Default String Column Cell Definition.
 *
 * @author Tim.Liu
 * @created 2013.11.25
 * @updated 2014.04.22
 */


;(function(app){

	app.widget('StringCell', function(){

		var UI = app.view({
			template: '<span>{{{value}}}</span>',
		});

		return UI;
	});

})(Application);
;/**
 * Cell that shows the seq number of record
 *
 * @author Tim.Liu
 * @created 2014.04.23
 */

;(function(app){

	app.widget('SeqCell', function(){
		var UI = app.view({
			template: '{{index}}'
		});

		return UI;
	});

})(Application);
;/**
 * This is the ActionCell definition 
 *
 * options
 * -------
 * passed down by this.model.get('actions')
 * 
 * actions: { (replace the actions)
 * 		'name': {
 * 			label: ...,
 * 			icon: ...,
 * 			tooltip: ...,
 * 			fn: function(){
 * 				this.model is the row record data model
 * 			}
 * 		},
 * 		...
 * }
 *
 * @author Tim.Liu
 * @created 2013.11.27
 * @updated 2014.04.22
 */

;(function(app){

	app.widget('ActionCell', function(){

		var UI = app.view({
			template: [
				'{{#each actions}}',
					'<span class="action-cell-item" action="{{@key}}" data-toggle="tooltip" title="{{i18n tooltip}}"><i class="{{icon}}"></i> {{i18n label}}</span> ',
				'{{/each}}'
			],
			className: 'action-cell',

			initialize: function(options){
				this.row = options.row;
				var actions = this.model.get('actions') || {};

					//default
					_.each({
						preview: {
							icon: 'fa fa-eye',
							tooltip: 'Preview'
						},
						edit: {
							icon: 'fa fa-pencil',
							tooltip: 'Edit'
						},
						'delete': {
							icon: 'fa fa-times',
							tooltip: 'Delete'
						}
					}, function(def, name){
						if(actions[name]){
							actions[name] = _.extend(def, actions[name]);
						}
					});


				//allow action impl overriden by action config.fn
				this.actions = this.actions || {};
				_.each(actions, function(action, name){
					if(action.fn){
						this.actions[name] = function($action){
							action.fn.apply(this.row, arguments);
							/*Warning:: If we use options.row here, it won't work, since the options object will change, hence this event listener will be refering to other record's row when triggered*/
						};
					}
				}, this);
				this.model.set('actions', actions);
				this.enableActionTags(true);
			},
			tooltips: true

		});

		return UI;

	});	

})(Application);

;/**
 * This is the Tree widget.
 *
 * <ul>
 * 	<li></li>
 * 	<li></li>
 * 	<li>
 * 		<a></a> -- item val
 * 		<ul>...</ul> -- nested children
 * 	</li>
 * 	...
 * </ul>
 *
 * options
 * -------
 * 1. data - [{
 * 		val: ...
 * 		icon: ...
 * 		children: []
 * }]
 * 2. node - default view definition config: see nodeViewConfig below
 *
 * 3. onSelected: callback
 *
 * override node view
 * ------------------
 * a. just template (e.g val attr used in template)
 * use node: {template: [...]}; don't forget <ul></ul> at the end of tpl string.
 * 
 * b. children array attr
 * use node: {
 * 		initialize: function(){
 * 			if(this.className() === 'node') this.collection = app.collection(this.model.get('[new children attr]'));
 * 		}
 * }
 *
 * note
 * ----
 * support search and expand a path (use $parent in node/leaf onSelected()'s first argument)
 *
 * @author Tim.Liu
 * @created 2014.04.24
 */

;(function(app){

	app.widget('Tree', function(){

		var nodeViewConfig = {
			type: 'CompositeView',
			forceViewType: true,
			tagName: 'li',
			itemViewContainer: 'ul',
			itemViewOptions: function(){
				return {parent: this};
			},
			className: function(){
				if(_.size(this.model.get('children')) >= 1){
					return 'node';
				}
				return 'leaf';
			},
			initialize: function(options){
				this.parent = options.parent;
				if(this.className() === 'node') this.collection = app.collection(this.model.get('children'));
				this.listenTo(this, 'render', function(){
					this.$el.addClass('clickable').data({
						//register the meta-data of this node/leaf view
						view: this,
						'$children': this.$el.find('> ul'),
						'$parent': this.parent && this.parent.$el
					});
				});
			},
			template: [
				'<a class="item" href="#"><i class="type-indicator"></i> <i class="{{icon}}"></i> {{{i18n val}}}</a>',
				'<ul class="children hidden"></ul>' //1--tree nodes default on collapsed
			]
		};

		var Root = app.view({
			type: 'CollectionView',
			forceViewType: true,
			className: 'tree tree-root',
			tagName: 'ul',
			initialize: function(options){
				this._options = options;
				this.itemView = this._options.itemView || app.view(_.extend({}, nodeViewConfig, _.omit(this._options.node, 'type', 'tagName', 'itemViewContainer', 'itemViewOptions', 'className', 'initialize')));
				this.onSelected = options.onSelected || this.onSelected;
			},
			onShow: function(){
				this.trigger('view:reconfigure', this._options);
			},
			onReconfigure: function(options){
				_.extend(this._options, options);
				this.trigger('view:render-data', this._options.data); //the default onRenderData() should be suffice.
			},
			events: {
				'click .clickable': function(e){
					e.stopPropagation();
					var $el = $(e.currentTarget);
					var meta = $el.data();
					if($el.hasClass('node')) this.trigger('view:toggleChildren', meta);
					this.trigger('view:selected', $el.data(), $el, e);
				}
			},
			onToggleChildren: function(meta){
				//2--click to become expanded
				meta.$children.toggleClass('hidden');
				meta.view.$el.toggleClass('expanded');	
			},

			//override this
			onSelected: function(meta, $el, e){
			
			}

		});

		return Root;

	});

})(Application);
;/**
 * Passive Paginator widget used with lists (CollectionView instances)
 *
 * options
 * -------
 * 0. target [opt] - target list view instance
 * 1. currentPage
 * 2. totalPages
 * 3. pageWindowSize - 3 means [1,2,3,...,] or [...,4,5,6,...] or [...,7,8,9] - default on 5
 *
 * format
 * ------
 * << [1,2,...] >>
 *
 * link with lists
 * ---------------
 * trigger('view:change-page', page number)
 * 
 * [listenTo(target, 'view:page-changed')] - if target is passed in through init options
 * [listenTo(this, 'view:change-page')] - if target is passed in through init options
 * 
 * @author Tim.Liu
 * @create 2014.05.05
 * @update 2014.12.01 (+pageWindowSize)
 */

;(function(app){

	app.widget('Paginator', function(){
		var UI = app.view({

			className: 'pagination',
			tagName: 'ul',
			
			template: [
				'<li {{#if atFirstPage}}class="disabled"{{/if}}><a href="#" action="goToFirstPage" data-page="--">'+_.escape('<<')+'</a></li>',
				'<li {{#if atFirstWindow}}class="hidden"{{/if}}><a href="#" action="goToAdjacentWindow" data-window="-">...</a></li>',
				'{{#each pages}}',
					'<li {{#if isCurrent}}class="active"{{/if}}><a href="#" action="goToPage" data-page="{{number}}">{{number}} <span class="sr-only">(current)</span></a></li>',
				'{{/each}}',
				'<li {{#if atLastWindow}}class="hidden"{{/if}}><a href="#" action="goToAdjacentWindow" data-window="+">...</a></li>',
				'<li {{#if atLastPage}}class="disabled"{{/if}}><a href="#" action="goToLastPage" data-page="++">'+_.escape('>>')+'</a></li>',
			],

			initialize: function(options){
				this._options = _.extend({
					pageWindowSize: 5,
				},options);
				//if options.target, link to its 'view:page-changed' event
				if(options.target) this.listenTo(options.target, 'view:page-changed', function(args){
					this.trigger('view:reconfigure', {
						currentPage: args.current,
						totalPages: args.total
					});
				});
			},
			onShow: function(){
				//this.trigger('view:reconfigure', this._options);
			},
			onReconfigure: function(options){
				_.extend(this._options, options);
				//use options.currentPage, totalPages to build config data - atFirstPage, atLastPage, pages[{number:..., isCurrent:...}]
				//calculate currentWindow dynamically
				this._options.currentWindow = Math.ceil(this._options.currentPage/this._options.pageWindowSize);
				var config = {
					atFirstPage: this._options.currentPage === 1,
					atLastPage: this._options.currentPage === this._options.totalPages,
					atFirstWindow: this._options.currentWindow === 1,
					atLastWindow: this._options.currentWindow === Math.ceil(this._options.totalPages/this._options.pageWindowSize),
					pages: _.reduce(_.range(1, this._options.totalPages + 1), function(memo, pNum){
						if(pNum > (this._options.currentWindow - 1) * this._options.pageWindowSize && pNum <= this._options.currentWindow * this._options.pageWindowSize)
							memo.push({
								number: pNum,
								isCurrent: pNum === this._options.currentPage
							});
						return memo;
					}, [], this)
				};

				this.trigger('view:render-data', config);
			},
			actions: {
				goToPage: function($btn, e){
					e.preventDefault();
					var page = $btn.data('page');
					if(page === this._options.currentPage) return;

					this.trigger('view:change-page', page);
				},
				goToFirstPage: function($btn, e){
					e.preventDefault();
					this.trigger('view:change-page', 1);
				},
				goToLastPage: function($btn, e){
					e.preventDefault();
					this.trigger('view:change-page', this._options.totalPages);
				},
				//Skipped atm.../////////////////////////
				// goToAdjacentPage: function($btn, e){
				// 	e.preventDefault();
				// 	var pNum = this._options.currentPage;
				// 	var op = $btn.data('page');
				// 	if(op === '+')
				// 		pNum ++;
				// 	else
				// 		pNum --;

				// 	if(pNum < 1 || pNum > this._options.totalPages) return;
				// 	if(pNum > this._options.currentWindow * this._options.pageWindowSize) this._options.currentWindow ++;
				// 	if(pNum <= (this._options.currentWindow - 1) * this._options.pageWindowSize) this._options.currentWindow --;
				// 	this.trigger('view:change-page', pNum);
				// },
				/////////////////////////////////////////
				goToAdjacentWindow: function($btn, e){
					e.preventDefault();
					var pWin = this._options.currentWindow;
					var op = $btn.data('window');
					if(op === '+')
						pWin ++;
					else
						pWin --;

					if (pWin < 1 || pWin > Math.ceil(this._options.totalPages/this._options.pageWindowSize)) return;
					this.trigger('view:change-page', (pWin == 1) ? 1 : (pWin-1) * this._options.pageWindowSize + 1);
				}
			},
			//////Can be overriden in options to add extra params///////
			onChangePage: function(pNum){
				//use the overriden version (see the stub impl below for what to override)
				if(this._options.onChangePage)
					return this._options.onChangePage.call(this, pNum);

				//use just a default stub implementation
				if(this._options.target) 
					this._options.target.trigger('view:load-page', {
						page: pNum
						//add more params/querys
					});
			}

		});

		return UI;
	});

})(Application);
;;app.stagejs = "1.8.5-902 build 1445479068737";