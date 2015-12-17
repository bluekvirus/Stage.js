/*
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
		* timeout (ms)
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
 * @author Tim Lauv
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
			timeout: 5 * 60 * 1000, //general communication timeout (ms). for app.remote and $.fileupload atm.

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
			if(!silent){
				app.trigger('app:resized', screenSize);
				app.coop('window-resized', screenSize);
			}
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
			app.coop('window-scroll', top);
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
				app.trigger('app:locked', options);
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
						app.currentContext = targetCtx;
						//fire a notification to app as meta-event.
						app.trigger('app:context-switched', app.currentContext.name);
						app.coop('context-switched', app.currentContext.name);
						//notify regional views in the context (views further down in the nav chain)
						app.currentContext.trigger('context:navigate-chain', path);
					});
					targetRegion.show(targetCtx);
				}else
					//notify regional views in the context (with old flag set to true)
					app.currentContext.trigger('context:navigate-chain', path, true);

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



