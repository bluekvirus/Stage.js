;
;/*
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
		* rapidEventDelay,
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
window.app = window.Application = new Backbone.Marionette.Application();
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
			contextRegion: 'app', //alias: navRegion, preferred: navRegion
			defaultContext: 'Default', //This is the context (name) the application will sit on upon loading.
			fullScreen: false, //This will put <body> to be full screen sized (window.innerHeight).
	        rapidEventDelay: 200, //in ms this is the rapid event delay control value shared within the application (e.g window resize).
	        baseAjaxURI: '', //Modify this to fit your own backend apis. e.g index.php?q= or '/api',
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
			////////////////cache the screen size/////////////
			Application.screenSize = screenSize;
			//////////////////////////////////////////////////
			if(Application.config.fullScreen){
				$body.height(screenSize.h);
				$body.width(screenSize.w);
			}
			if(!silent)
				Application.trigger('app:resized', screenSize);
		}
		trackScreenSize(null, true);
		$window.on('resize', _.debounce(trackScreenSize, Application.config.rapidEventDelay));

		//Track window scroll
		function trackScroll(){
			var top = $window.scrollTop();
			Application.trigger('app:scroll', top);
		}
		$window.on('scroll', _.throttle(trackScroll, Application.config.rapidEventDelay));
		
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
			Application.inject.css('themes/'+theme+'/css/main.css', $('#theme-roller')[0]);
			Application.currentTheme = theme;
		}

		if(Application.config.viewTemplates)
			Application.inject.tpl('all.json');

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
				var TargetContext = Application.Core.Context.get(context);
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
					//allow context to check/do certain stuff before navigated to (similar to guard() above)
					if(targetCtx.onBeforeNavigateTo &&  !targetCtx.onBeforeNavigateTo()){
						Application.trigger('app:navigation-aborted', targetCtx.name);
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
				if(silent || Application.hybridEvent)
					navigate(path);//hybrid app will navigate using the silent mode.
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

			//0. rewire general error.
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
				if(!Application.Core.Context.get(Application.config.defaultContext))
					console.warn('DEV::Application::You might want to define a Default context using app.create(\'Context Name\', {...})');
				else
					window.location.hash = ['#navigate', Application.config.defaultContext].join('/');
			}

			//4. Start the app
			Application.start();

		}

		if(hybridEvent){
			//Mobile development
			Application.hybridEvent = hybridEvent; //window.cordova is probably true.
		    Application.onError = function(err){
		    	//override this to have remote debugging assistant
		        console.error(err, err.target);
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

		view: function(options /*or name*/, instant){
			if(_.isBoolean(options)) throw new Error('DEV::Application.view::pass in {options} or a name string...');
			if(_.isString(options) || !options) return Application.Core.Regional.get(options);

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
				if(!name) return Application.Core.Context.get();
				options = name;
				name = '';
			}else {
				if(!options) return Application.Core.Context.get(name);
			}
			options = options || {};
			_.extend(options, {name: name});
			return Application.Core.Context.create(options);
		},

		regional: function(name, options){
			if(!_.isString(name)) {
				if(!name) return Application.Core.Regional.get();
				options = name;
				name = '';
			}else {
				if(!options) return Application.Core.Regional.get(name);
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
			if(!options) return Application.Core.Widget.get(name);
			if(_.isFunction(options)){
				//register
				Application.Core.Widget.register(name, options);
				return;
			}
			return Application.Core.Widget.create(name, options);
			//you can not get the definition returned.
		},

		editor: function(name, options){
			if(!options) return Application.Core.Editor.get(name);
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
		},

		download: function(ticket){
			return Application.Util.download(ticket);
		},

		inject: {
			js: function(){
				return Application.Util.inject.apply(null, arguments);
			},

			tpl: function(){
				return Application.Util.Tpl.remote.load.apply(Application.Util.Tpl.remote, arguments);
			},

			css: function(){
				return loadCSS.apply(null, arguments);
			}
		},

		navigate: function(options, silent){
			return Application.trigger('app:navigate', options || Application.config.defaultContext, silent);
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
		options = options || {};
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
		'download',
		'create - @deprecated'
	];

})();




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
	    drone.attr('src', (new URI(ticket.url || '/').addQuery(_.omit(ticket, 'url'))).toString());
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
					console.log('DEV::APP.Util.Template::', name, 'overriden');
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
								console.log('DEV::APP.Util.Template::', name, 'overriden');	
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
							console.log('DEV::APP.Util.Template::', name, 'overriden');	
						}
						result = that.map[name] = tpl;
					}).fail(function(){
						throw new Error('DEV::View Template::Can not load template...' + url + ', re-check your app.config.viewTemplates setting');
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
			app.trigger('app:script-injected', url);
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
;/**
 * This is the Remote data interfacing core module of this application framework.
 * (Replacing the old Data API module)
 *
 * options:
 * --------
 * a. url string
 * or 
 * b. object:
 * 	1. + entity[_id][_method] - string
 *  2. + params(alias:querys) - object
 *  3. + payload - object (payload._id overrides _id)
 *  4. $.ajax options (without -data, -type, -processData, -contentType)
 *
 * events:
 * -------
 * app:ajax - change global ajax options here
 * app:success - notify
 * app:error - notify
 * app:ajax-start - progress
 * app:ajax-stop - progress
 * app:remote-pre-get - fine grind op stub
 * app:remote-pre-change - fine grind op stub
 * 
 * @author Tim.Liu
 * @created 2014.03.24
 */

;(function(app, _, $){

	var definition = app.module('Core.Remote');

	function fixOptions(options){
		if(!options) throw new Error('DEV::Core.Remote::options empty, you need to pass in at least a url string');
		if(_.isString(options)) 
			options	= { 
				url: options,
				type: 'GET'
			};
		else {
			//default options
			_.extend(options, {
				type: undefined,
				data: undefined,
				processData: false,
				contentType: 'application/json; charset=UTF-8', // req format
				dataType: 'json' //res format
			});
			//process entity[_id] and strip off options.querys(alias:params)
			if(options.entity){
				var entity = options.entity;
				options.url = entity;
			}
			if(options.payload && options.payload._id){
				if(options._id) console.warn('DEV::Core.Remote::options.payload._id', options.payload._id,'overriding options._id', options._id);
				options._id = options.payload._id;
			}
			if(options._id || options._method){
				var url = new URI(options.url);
				options.url = url.path(_.compact([url.path(), options._id, options._method]).join('/')).toString();
			}
			options.params = options.querys || options.params;
			if(options.params){
				options.url = (new URI(options.url)).search(options.params).toString();
			}
		}
		app.trigger('app:ajax', options);		
		return options;
	}

	function notify(jqXHR){
		jqXHR
		.done(function(data, textStatus, jqXHR){
			app.trigger('app:success', {
				data: data, 
				textStatus: textStatus,
				jqXHR: jqXHR,
			});
		})
		.fail(function(jqXHR, textStatus, errorThrown){
			app.trigger('app:error', {
				errorThrown: errorThrown,
				textStatus: textStatus,
				jqXHR: jqXHR
			});
		});
		return jqXHR;
	}

	_.extend(definition, {

		//GET
		get: function(options){
			options = fixOptions(options);
			options.type = 'GET';
			app.trigger('app:remote-pre-get', options);
			return notify($.ajax(options));
		},

		//POST(no payload._id)/PUT/DELETE(payload = {_id: ...})
		change: function(options){
			options = fixOptions(options);
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
			return notify($.ajax(options));
		}

	});

	//Global ajax event triggers
	$document.ajaxStart(function() {
		app.trigger('app:ajax-start');
	});
	$document.ajaxStop(function() {
		app.trigger('app:ajax-stop');
	});
	

})(Application, _, jQuery);
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
 */

(function(app){

	function makeRegistry(regName){
		regName = _.string.classify(regName);
		var manager = app.module('Core.' + regName);
		_.extend(manager, {

			map: {},
			has: function(name){
				if(!_.isString(name) || !name) throw new Error('DEV::Application.editor::You must specify the name of the ' + regName + ' to look for.');
				if(this.map[name]) return true;
				return false;
			},
			register: function(name, factory){
				if(!_.isString(name) || !name) throw new Error('DEV::Application.editor::You must specify a ' + regName + ' name to register.');
				if(this.has(name))
					console.warn('DEV::Overriden::' + regName + '.' + name);
				this.map[name] = factory();
				this.map[name].prototype.name = name;
			},

			create: function(name, options){
				if(!_.isString(name) || !name) throw new Error('DEV::Application.editor::You must specify the name of the ' + regName + ' to create.');
				if(this.has(name))
					return new (this.map[name])(options);
				throw new Error('DEV::' + regName + '.Registry:: required definition [' + name + '] not found...');
			},

			get: function(name){
				if(!name) return _.keys(this.map);
				return this.map[name];
			}

		});

		return manager;

	}

	makeRegistry('Widget');
	makeRegistry('Editor');

})(Application);
;/**
 * This is the Application context registry. 
 * A context defines the scope of a group of modules that represent a phase/mode/page of the Application. 
 * (e.g. Login, Admin, AppUser, AppPublic(can be the same thing as Login) ...etc.)
 *
 * 
 * Design
 * ------
 * Context switch can be triggered by 
 * 	a. use event on app app:navigate (path);
 *  b. click <a href="#/navigate/[contextName][/subPath]"/> tag;
 *
 * 
 * Usage
 * -----
 * ###How to define one? 
 * app.Core.Context.create({
 * 		name: 'name of the context',
 * 		template: 'html template of the view as in Marionette.Layout',
 * 							- region=[] attribute --- mark a tag to be a region container
 * 							- view=[] attribute --- mark this region to show an new instance of specified view definition (in context.Views, see context.create below)
 *      guard: function(){
 *      	return undefined/''/false for pass
 *      	return error msg/object for blocking - triggers app:context-guard-error on app with the error returned
 *      }
 * });
 * or
 * app.context('name', {config});
 *
 * ###How to swap regional view on a region?
 * use this.[region name].show()
 * or
 * use this.[region name].trigger('region:load-view', [view name])
 *
 * **Note** that this refers to the context module not the layout view instance.
 * 
 * @author Tim.Liu
 * @created 2013.09.21
 * @updated 2014.02.21 (1.0.0-rc1)
 * @updated 2014.07.18 (1.5.0)
 */

;(function(app, _){

	var def = app.module('Core.Context');
	var map = {};

	_.extend(def, {
		create: function(config){
			_.extend(config, {
				name: config.name || 'Default',
				className: 'context context-' + _.string.slugify(config.name) + ' ' + (config.className || ''),
				isContext: true
			});

			return this.set(config.name, Backbone.Marionette.Layout.extend(config));
		},

		set: function(name, Layout){
			if(map[name]) console.warn('DEV::Core.Context::You have overriden context \'', name, '\'');
			map[name] = Layout;
			return Layout;
		},

		get: function(name){
			if(!name) return _.keys(map);
			return map[name];
		}

	});

})(Application, _);



;/**
 * This is a registry for saving 'named' view definitions.
 * 
 * [We moved the static regional view listing from the Marionette.Layout class]
 *
 * @author Tim.Liu
 * @create 2014.03.11
 */
;(function(app, _, M){

	var definition = app.module('Core.Regional');
	var map = {};

	_.extend(definition, {

		create: function(config){
			if(!config.name) throw new Error('DEV::Core.Regional::You must give this regional view a name...');
			if(map[config.name]) console.warn('DEV::Core.Regional::You have overriden regional view \'', config.name, '\'');
			
			map[config.name] = M[config.type || 'Layout'].extend(config);
			return map[config.name];
			
		},

		get: function(name, options){
			if(!name) return _.keys(map);
			
			var Def = map[name];
			if(options) return new Def(options);
			return Def;
		}

	});

})(Application, _, Marionette);
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
			if(!_.isString(topic) || !topic) throw new Error('DEV::Core.Lock::You must give this lock a name/topic ...');
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
 * 1. open()+
 * --------------
 * a. consult view.effect animation names (from Animate.css or your own) when showing a view;
 * b. inject parent view as parentCt to sub-regional view;
 * c. store sub view as parent view's _fieldsets[member];
 * 
 *
 * @author Tim.Liu
 * @updated 2014.03.03
 */

;(function(app){

	_.extend(Backbone.Marionette.Region.prototype, {
		open: function(view){

			/**
			 * Effect config in view & region
			 * use the css animation name as enter & exit effect name.
			 * e.g 'lightSpeedIn' or {enter: 'lightSpeedIn', exit: '...'}
			 * e.g data-effect="lightSpeedIn" or data-effect-enter="lightSpeedIn" data-effect-exit="..."
			 *
			 * animationName:defer means calling view.enter() to animate out the effect instead of right after 'show' event.
			 * 
			 */
			if(view.effect !== false)
				view.effect = (_.isObject(view.effect)?view.effect.enter:view.effect) || this.$el.data('effect') || this.$el.data('effectEnter');
			if(view.effect){
				var meta = view.effect.split(':'); //effectName:defer?
				view.$el.css('opacity', 0).addClass(meta[0]);
				this.$el.empty().append(view.el);

				function enter(){
					_.defer(function(){
						view.$el.addClass('animated');
						_.defer(function(){
							view.$el.css('opacity', 1);
						});
					});
				}

				if(meta[1] === 'defer')
					view.enter = enter;
				else
					view.once('show', function(){
						enter();
					});
			}
			else 
				this.$el.empty().append(view.el);

			//inject parent view container through region into the regional views
			if(this._parentLayout){
				view.parentCt = this._parentLayout;
				//also passing down the name of the outter-most context container.
				if(this._parentLayout.isContext) view.parentCtx = this._parentLayout;
				else if (this._parentLayout.parentCtx) view.parentCtx = this._parentLayout.parentCtx;
			}

			//store sub region form view by fieldset
			if(view.fieldset) {
				this._parentLayout._fieldsets = this._parentLayout._fieldsets || {};
				this._parentLayout._fieldsets[view.fieldset] = view;
			}

			//trigger view:resized anyway upon its first display
			if(this._contentStyle){
				//view.$el.css(this._contentStyle); //Tricky, use a .$el.css() call to smooth dom sizing/refreshing after $el.empty().append()
				var that = this;
				_.defer(function(){
					view.trigger('view:resized', {region: that}); //!!Caution: this might be racing if using view.effect as well!!
				});			
			}

			view.parentRegion = this;

			return this;
		},

		//you don't need to calculate paddings on a region, since we are using $.innerHeight()
		resize:function(options){
			options = options || {};

			/*Note that since we use box-sizing in css, if using this.$el.css() to set height/width, they are equal to using innerHeight/Width()*/
			this._contentStyle = _.extend({}, options, this._contentOverflow);
			this.$el.css(this._contentStyle);
			
			var that = this;
			_.defer(function(){ //give browser a chance to catch up with style changes.
				if(that.currentView) {
					//this.currentView.$el.css(this._contentStyle);
					that.currentView.trigger('view:resized', {region: that});
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
 * Optional
 * --------
 * 1. action tags auto listener hookup with mutex-locking
 * 2. tooltip
 * 3. overlay - use this view as an overlay
 * 
 *
 * Fixed
 * -----
 * auto ui tags detect and register.
 * +meta event programming
 * 	view:* (event-name) - on* (camelized)
 *
 * 
 * @author Tim.Liu
 * @create 2014.02.25 
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
	_.extend(Backbone.Marionette.View.prototype, {

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
					throw new Error('DEV::' + (uiName || 'UI Component') + '::You have not yet implemented this action - [' + action + ']');
				}
			};		
		},

			
	});


	/**
	 * Enable Tooltips (do it in initialize())
	 * This is used for automatically activate tooltips after render
	 *
	 * Options
	 * -------
	 * bootstrap tooltip config
	 */

	_.extend(Backbone.Marionette.View.prototype, {

		enableTooltips: function(options){
			this.listenTo(this, 'render', function(){
				//will activate tooltip with specific options object - see /libs/bower_components/bootstrap[x]/docs/javascript.html#tooltips
				this.$('[data-toggle="tooltip"]').tooltip(options);
			});
		}

	});


	/**
	 * Fixed enhancement
	 * +auto ui tags detection and register
	 * +meta event programming
	 * 	view:* (event-name) - on* (camelized)
	 *
	 * Override View.constructor to affect only decendents, e.g ItemView and CollectionView... (This is the Backbone way of extend...)
	 * 
	 */
	Backbone.Marionette.View.prototype.constructor = function(options){
		options = options || {};

		//fix default tpl to be ' '.
		this.template = options.template || this.template || ' ';

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
		//auto detect and enable view enhancements: actions, [paper(SVG), editors - in item-view enhancement]
		if(this.actions) this.enableActionTags(this.actions._bubble);
		if(this.editors && this.activateEditors) this.listenTo(this, 'render', function(){
			this.activateEditors(this.editors);
		});
		if(this.svg && this.enableSVG) {
			this.listenTo(this, 'render', this.enableSVG);
		}
		if(this.tooltips) {
			this.enableTooltips(this.tooltips);
		}
		if(this.overlay){ //give this view the overlaying ability
			this._overlayConfig = _.isBoolean(this.overlay)? {}: this.overlay;
			this.overlay = function(options){
				/**
				 * options:
				 * 1. anchor - css selector of parent html el
				 * 2. rest of the $.overlay plugin options without content and onClose
				 */
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

		return Backbone.Marionette.View.apply(this, arguments);
	};


})(Application);
;/**
 * Marionette.ItemView Enhancements (can be used in Layout as well) - Note that you can NOT use these in a CompositeView.
 *
 * 1. SVG (view:fit-paper, view:paper-resized, view:paper-ready)
 * 2. Basic Editors (view as form piece)
 * 3. Render with data (view:render-data, view:data-rendered)
 *
 * @author Tim.Liu
 * @create 2014.02.26
 */

;(function(app){

	/**
	 * Inject a svg canvas within view. - note that 'this' in cb means paper.
	 * Do this in onShow() instead of initialize.
	 */
	_.extend(Backbone.Marionette.ItemView.prototype, {
		enableSVG: function(){
			if(!Raphael) throw new Error('DEV::View::You did NOT have Raphael.js included...');
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
			if(this._editors.attachView) throw new Error('DEV::ItemView::activateEditors enhancements will need this._editors object, it is now a Region!');

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
					Editor = app.Core.Editor.map[config.type] || app.Core.Editor.map.Basic;
					editor = new Editor(config);					
				}else {
					//if config is a view definition use it directly 
					//(compound editor, e.g: app.view({template: ..., editors: ..., getVal: ..., setVal: ...}))
					Editor = config;
					config = _.extend({}, global);
					editor = new Editor();
					editor.name = name;
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
					throw new Error('DEV::ItemView::activateEditors - You need to pass in messages object instead of ' + options);
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
	 * Meta-event Listeners (pre-defined)
	 * view:render-data
	 */
	_.extend(Backbone.Marionette.ItemView.prototype, {

		onRenderData: function(data){
			if(!this.model){
				this.model = new Backbone.Model();
				this.listenTo(this.model, 'change', this.render);
			}
			if(_.isArray(data))
				this.model.set('items', data); //conform to original Backbone/Marionette settings
			else
				this.model.set(data);

			this.trigger('view:data-rendered');
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
					_.each(['overflowX', 'overflowX', 'overflow'], function(oKey){
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
						//Widget?
						if(app.Core.Widget.has(name)) {
							this.show(app.Core.Widget.create(name, options));
							return;
						}
						//Named View?
						var View = app.Core.Regional.get(name);
						if(View){
							this.show(new View(options));
							return;
						}
						//Template mockups?
						if(_.string.startsWith(name, '@')){
							this.show(app.view({
								template: name,
								type: 'Layout'
							}, true));
							return;
						}
						//throw new Error('DEV::Layout::View required ' + name + ' can NOT be found...use app.create(\'Regional\', {name: ..., ...}).');
						console.warn('DEV::Layout::View required ' + name + ' can NOT be found...use app.create(\'Regional\', {name: ..., ...}).');
					});
					
				},this);
			});

			//Automatically shows the region's view="" attr indicated View/Widget or @remote.tpl.html
			this.listenTo(this, 'show', function(){
				_.each(this.regions, function(selector, r){
					if(this.debug) this[r].$el.html('<p class="alert alert-info">Region <strong>' + r + '</strong></p>'); //give it a fake one.
					this[r].trigger('region:load-view', this[r].$el.attr('view')); //found corresponding View def.
				}, this);
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
						console.warn('DEV::Layout::View', 'invalid navRegion', this.navRegion, 'in', this.name || options.name);
						return;
					}
					
					var targetViewName = pathArray.shift();
					var TargetView = app.Core.Regional.get(targetViewName);

					if(TargetView){
						var navRegion = this.getRegion(this.navRegion);
						if(!navRegion.currentView || TargetView.prototype.name !== navRegion.currentView.name){
							//new
							var view = new TargetView();
							if(navRegion.currentView) navRegion.currentView.trigger('view:navigate-away');
							navRegion.show(view);
							view.trigger('view:navigate-chain', pathArray);
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
	_.extend(Backbone.Marionette.View.prototype, {

		/////////////////////////////
		onRenderData: function(data){

			if(!_.isArray(data)) throw new Error('DEV::CollectionView+::You need to have an array passed in as data...');
			
			if(!this.collection){
				this.collection = new Backbone.Collection();
				this.listenTo(this.collection, 'add', this.addChildView);
				this.listenTo(this.collection, 'remove', this.removeItemView);
				this.listenTo(this.collection, 'reset', this.render);
			}
			this.collection.reset(data);

			this.trigger('view:data-rendered');
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
 * i18n loading file
 * dependencies: jQuery, underscore, store.js, [Handlebars]
 *
 * ======
 * Config
 * ======
 * I18N.configure(options) - change the resource folder path or key-trans file name per locale.
 * 	options:
 * 		resourcePath: ... - resource folder path without locale
 * 		translationFile: ... - the file name that holds the key trans pairs for a certain locale.
 *
 * =====
 * APIs
 * =====
 * .getResourceProperties(flag) -- get all i18n keys and trans rendered in the app in "key" = "val" format;
 * .getResourceJSON(flag) -- get the above listing in JSON format;
 *
 * use flag = true in the above functions if you only want to get un-translated entries;
 * 
 * =====
 * Usage
 * =====
 * 1. load this i18n.js before any of your modules/widgets
 * 2. use '...string...'.i18n() instead of just '...string...',
 * 3. use {{i18n vars/paths or '...string...'}} in templates, {{{...}}} for un-escaped.
 * 4. use $.i18n(options) to translate html tags with [data-i18n-key] [data-i18n-module] data attributes. 
 *
 * 
 * @author Yan Zhu, Tim Liu
 * @created 2013-08-26
 * @updated 2014-08-06
 * 
 */
var I18N = {};
;(function($, _, URI) {
	
	//----------------configure utils------------------
	var configure = {
		resourcePath: 'static/resource',
		translationFile: 'i18n.json'
	};

	var params = URI(window.location.toString()).search(true);
	var locale = params.locale;
	var localizer = params.localizer;
	
	var resources;	
	I18N.configure = function(options){
		_.extend(configure, options);
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
			
			//Localizer mode, merge resources with localStorage, cache is modified upon localizer's DnD action (modified property file).
			if (localizer) {
				var resources_cache_key = ['resources_', locale].join('');
				var cached_resources = store.get(resources_cache_key);
				if (cached_resources) {
					_.each(cached_resources, function(trans, key){
						//favor cached_ over loaded resources.
						if(!trans) return;
						if(!resources[key]) {
							resources[key] = trans;
							return;
						}
						//if we had a string trans, let cache (object/string) override resource.
						if(_.isString(resources[key])) resources[key] = trans;
						//if we had a trans object(with ns), only extend if cached is a trans object.
						else if(_.isObject(resources[key]) && _.isObject(trans)) _.extend(resources[key], trans);
					});
				}
			}
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
			cacheResources();
			return key;
		} else if (typeof(translation) === 'object') {
			//console.log('translation', translation, 'is object');
			var ns = (options && options.module) || '_default';
			translation = translation[ns];
			if (typeof(translation) === 'undefined') {
				//console.log('translation', translation, 'is undefined');
				// report this namespace
				resources[key][ns] = '';
				cacheResources();
				return key;
			}
		}
		translation = String(translation);
		if (translation.trim() === '') {
			return key;
		}
		return translation;
	};
	
	function cacheResources() {
		//console.log('cacheResources', 'localizer', localizer);
		if (localizer) {
			store.set(resources_cache_key, resources);
		}
	}

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
	I18N.clearResourceCache = function(){
		var resources_cache_key = ['resources_', locale].join('');
		store.remove(resources_cache_key);
	};

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
	  		return String(key).i18n(ns && {module:ns});
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


})(jQuery, _, URI);

;/**
 * This is the jquery plugin that fetch and show static .md contents through markd js lib
 * (If you have highlight.js, the code block will be themed for you...)
 *
 * Usage
 * =====
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
 * ====
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

		return this.each(function(index, el){
			var $el = $(el);
			var config = $el.data();
			var url = options.url || config.url;
			$.get(url).done(function(res){
				var content;
				if(config.md && config.md.data === res) {
					content = config.md.content;
				}else {
					content = marked(res, options.marked);
					//cache the md data and calculation
					$el.data('md', {
						data: res,
						content: content
					});
				}

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

		var UI = Backbone.Marionette.ItemView.extend({

			template: '#editor-basic-tpl',
			className: 'form-group', //this class is suggested to be removed if there is no label in this editor options.

			events: {
				//fired on both parentCt and this editor
				'change': '_triggerEvent', 
				'keyup input, textarea': '_triggerEvent', 
				'focusout': '_triggerEvent', 
				'focusin': '_triggerEvent' 
			},

			initialize: function(options){
				//[parentCt](to fire events on) as delegate
				this.parentCt = options.parentCt;
				
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
								this.ui.upload.removeClass('hide').show();
							this.ui.clearfile.removeClass('hide').show();
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
							this.upload(options.upload);
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
					this.ui.msg.html(msg);

				}else {
					//clear
					this.$el
						.removeClass(this.$el.data('type-class'))
						.removeData('type-class');
					this.ui.msg.empty();
				}
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
		
			}

		});

		return UI;

	});



	app.Util.Tpl.build('editor-basic-tpl', [
		'{{#if label}}',
			'<label class="control-label {{#if layout}}{{layout.label}}{{/if}}" for="{{uiId}}">{{label}}</label>',
		'{{/if}}',
		'<div class="{{#if layout}}{{layout.field}}{{/if}}" data-toggle="tooltip" title="{{tooltip}}">', //for positioning with the label.

			//1. select
			'{{#is type "select"}}',
				'<select ui="input" name="{{#if fieldname}}{{fieldname}}{{else}}{{name}}{{/if}}" class="form-control" id="{{uiId}}" {{#if multiple}}multiple="multiple"{{/if}} style="margin-bottom:0">',
					'{{#if options.grouped}}',
						'{{#each options.data}}',
						'<optgroup label="{{@key}}">',
							'{{#each this}}',
							'<option value="{{value}}">{{label}}</option>',
							'{{/each}}',
						'</optgroup>',
						'{{/each}}',
					'{{else}}',
						'{{#each options.data}}',
						'<option value="{{value}}">{{label}}</option>',
						'{{/each}}',
					'{{/if}}',
				'</select>',
			'{{else}}',
				//2. textarea
				'{{#is type "textarea"}}',
					'<textarea ui="input" name="{{#if fieldname}}{{fieldname}}{{else}}{{name}}{{/if}}" class="form-control" id="{{uiId}}" rows="{{rows}}" placeholder="{{placeholder}}" style="margin-bottom:0"></textarea>',
				'{{else}}',
					//3. input
					//checkboxes/radios
					'{{#if options}}',
						'<div ui="inputs" id={{uiId}}>',
						'{{#each options.data}}',
							'{{#unless ../options.inline}}<div class="{{../../type}}">{{/unless}}',
							'<label class="{{#if ../options.inline}}{{../../type}}-inline{{/if}}">',
								//note that the {{if}} within a {{each}} will impose +1 level down in the content scope.  
								'<input ui="input" name="{{#if ../fieldname}}{{../../fieldname}}{{else}}{{../../name}}{{/if}}{{#is ../type "checkbox"}}[]{{/is}}" type="{{../type}}" value={{value}}> {{label}}',
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
								'<input ui="input" name="{{#if fieldname}}{{fieldname}}{{else}}{{name}}{{/if}}" type="checkbox" value="{{value}}"> {{boxLabel}}',
							'</label>',
						'{{else}}',
							//normal field
							'{{#is type "ro"}}',//read-only
								'<div ui="input-ro" data-value="{{{value}}}" class="form-control-static">{{{value}}}</div>',
							'{{else}}',
								'<input ui="input" name="{{#if fieldname}}{{fieldname}}{{else}}{{name}}{{/if}}" {{#isnt type "file"}}class="form-control"{{else}} style="display:inline;" {{/isnt}} type="{{type}}" id="{{uiId}}" placeholder="{{placeholder}}" value="{{value}}"> <!--1 space-->',
								'{{#is type "file"}}',
									'<span action="upload" class="hide file-upload-action-trigger" ui="upload" style="cursor:pointer;"><i class="glyphicon glyphicon-upload"></i> <!--1 space--></span>',
									'<span action="clear" class="hide file-upload-action-trigger" ui="clearfile"  style="cursor:pointer;"><i class="glyphicon glyphicon-remove-circle"></i></span>',
									'<span ui="result" class="file-upload-result"></span>',
								'{{/is}}',							
							'{{/is}}',
						'{{/is}}',
						'</div>',	
					'{{/if}}',
				'{{/is}}',
			'{{/is}}',

			//msg & help
			'{{#if help}}<span class="help-block editor-help-text" style="margin-bottom:0"><small>{{help}}</small></span>{{/if}}',
			'<span class="help-block editor-status-text input-error" ui="msg">{{msg}}</span>',
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
 * options
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
 * events
 * ------
 * 1. row:clicked
 * 2. row:dblclicked
 * 
 * 
 * note
 * ----
 * the details row appears under each normal data row;
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
			type: 'Layout',
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
				this._options.data = options.data || this._options.data;
				_.each(options.columns, function(column){
					//TBI column ['name' or {}, '-name']
				}, this);

				//2. rebuild header cells - let it rerender with new column array
				_.each(this._options.columns, function(column){
					column.header = column.header || 'string';
					column.cell = column.cell || column.header || 'string';
					column.label = column.label || _.string.titleize(column.name);
				});				
				this.header.currentView.trigger('view:render-data', this._options.columns);

				//3. rebuild body rows - let it rerender with new data array
				this.body.currentView._options = this._options;
				this.body.currentView.trigger('view:render-data', this._options.data);
			},
			onRenderData: function(data){
				//override the default data rendering meta-event responder
				this.trigger('view:reconfigure', {data: data});
			}
		});

		var HeaderRow = app.view({
			type: 'CollectionView',
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
			itemView: Row,
			itemViewEventPrefix: 'row',
			itemViewOptions: function(model, index){
				return {
					collection: app.collection(_.map(this._options.columns, function(column){
						return _.extend({
							value: selectn(column.name || '', model.attributes),
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
			template: '<span><i class="{{icon}}"></i> {{{label}}}</span>',
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
					'<span class="action-cell-item" action="{{@key}}" data-toggle="tooltip" title="{{tooltip}}"><i class="{{icon}}"></i> {{label}}</span> ',
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
				'<a class="item" href="#"><i class="type-indicator"></i> <i class="{{icon}}"></i> {{{val}}}</a>',
				'<ul class="children hidden"></ul>' //1--tree nodes default on collapsed
			]
		};

		var Root = app.view({
			type: 'CollectionView',
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
 * 3. visibleIndices [TBI] - 3 means [1,2,3,...,last page] or [...,4,5,6,..., last page]
 *
 * format
 * ------
 * << [1,2,...,last] >>
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
 */

;(function(app){

	app.widget('Paginator', function(){
		var UI = app.view({

			className: 'pagination',
			tagName: 'ul',
			
			template: [
				'<li {{#if atFirstPage}}class="disabled"{{/if}}><a href="#" action="goToAdjacentPage" data-page="-">&laquo;</a></li>',
				'{{#each pages}}',
					'<li {{#if isCurrent}}class="active"{{/if}}><a href="#" action="goToPage" data-page="{{number}}">{{number}} <span class="sr-only">(current)</span></a></li>',
				'{{/each}}',
				'<li {{#if atLastPage}}class="disabled"{{/if}}><a href="#" action="goToAdjacentPage" data-page="+">&raquo;</a></li>',
			],

			initialize: function(options){
				this._options = options || {};
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
				var config = {
					atFirstPage: this._options.currentPage === 1,
					atLastPage: this._options.currentPage === this._options.totalPages,
					pages: _.map(_.range(1, this._options.totalPages + 1), function(pNum){
						return {
							number: pNum,
							isCurrent: pNum === this._options.currentPage
						};
					}, this)
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
				goToAdjacentPage: function($btn, e){
					e.preventDefault();
					var pNum = this._options.currentPage;
					var page = $btn.data('page');
					if(page === '+')
						pNum ++;
					else
						pNum --;

					if(pNum < 1 || pNum > this._options.totalPages) return;
					this.trigger('view:change-page', pNum);
				},
			},
			//////can be overriden///////
			onChangePage: function(pNum){
				//just a default stub implementation
				if(this._options.target) 
					this._options.target.trigger('view:load-page', {
						page: pNum
					});
			}

		});

		return UI;
	});

})(Application);
;;app.stagejs = "1.7.4-792 build 1416086799224";