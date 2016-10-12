/**
 * Framework APIs (global - app.*)
 *
 * Note: View APIs are in view.js (view - view.*)
 * 
 * @author Tim Lauv
 */

;(function(app){

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
		//pass in [name,] instance to create (named will be registered again)
		view: function(name /*or options*/, options /*or instance flag*/){
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
				console.warn('DEV::Application::regional() method is deprecated, use .view() instead for', options.name || options /*as an indicator of anonymous view*/);
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
		//always return View definition.
		get: function(name, type, fallback /*in effect only if you specify type*/){
			if(!name)
				return {
					'Context': app.Core.Context.get(),
					'View': app.Core.View.get(),
					'Widget': app.Core.Widget.get(),
					'Editor': app.Core.Editor.get()
				};

			var Reusable, t = type || 'View';

			//try local
			Reusable = (app.Core[t] && app.Core[t].get(name)) || (fallback && app.Core['View'].get(name));
			
			//try remote, if we have app.viewSrcs set to load the View def dynamically
			if(!Reusable && app.config && app.config.viewSrcs){
				app.inject.js(
					_.compact([app.config.viewSrcs, t.toLowerCase(), app.nameToPath(name)]).join('/') + '.js',
					true //sync
				).done(function(){
					app.debug(t, name, 'injected', 'from', app.config.viewSrcs);
					Reusable = app.get(name, t);
				}).fail(function(jqXHR, settings, e){
					if(!fallback || (t === 'View'))
						throw new Error('DEV::Application::get() can NOT load definition for ' + name + ' - [' + e + ']');
					else
						Reusable = app.get(name, 'View');
				});
			}

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
			return app.trigger('app:navigate', options, silent);
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

		//data push 
		//(ws channels)
		_websockets: {},
		/**
		 * returns a promise.
		 * 
		 * Usage
		 * -----
		 * register: app.config.websockets [] or app.ws(socketPath);
		 * receive (e): view.coop['ws-data-[channel]'] or app.onWsData = custom fn;
		 * send (json): app.ws(socketPath)
		 * 								.then(function(ws){ws.channel(...).json({...});}); default per channel data
		 * 								.then(function(ws){ws.send(); or ws.json();}); anything by any contract
		 * e.websocket = ws in .then(function(ws){})
		 *
		 * Default messaging contract
		 * --------------------------
		 * json {channel: '..:..', payload: {.data.}} through ws.channel('..:..').json({.data.})
		 */
		ws: function(socketPath){
			if(!Modernizr.websockets) throw new Error('DEV::Application::ws() Websocket is not supported by your browser!');
			socketPath = socketPath || '/ws';
			var d = $.Deferred();
			if(!app._websockets[socketPath]) { 

				app._websockets[socketPath] = new WebSocket("ws://" + location.host + socketPath);
				//events: 'open', 'error', 'close', 'message' = e.data
				//apis: send(), +json(), +channel().json(), close()

				app._websockets[socketPath].json = function(data){
					app._websockets[socketPath].send(JSON.stringify(data));
				};
				app._websockets[socketPath].channel = function(channel){
					return {
						json: function(data){
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

				//general ws data stub, override this through app.ws(path).then(function(ws){ws.onmessage=...});
				//Dev Server will always send default json contract string {"channel": "...", "payload": "..."}
				app._websockets[socketPath].onmessage = function(e){
					//opt a. override app.onWsData to active otherwise
					app.trigger('app:ws-data', {websocket: app._websockets[socketPath], path: socketPath, raw: e.data});
					//opt b. use global coop event 'ws-data-[channel]' in views directly (default json contract)
					try {
						var data = JSON.parse(e.data);
						app.coop('ws-data-' + data.channel, data.payload, {websocket: app._websockets[socketPath], path: socketPath});
					}catch(ex){
						console.warn('DEV::Application::ws() Websocket is getting non-default {channel: ..., payload: ...} json contract strings...');
					}
				};
				
			}else
				d.resolve(app._websockets[socketPath]);
			return d.promise();
		},

		//data polling 
		//(through later.js) and emit data events/or invoke callback
		_polls: {},
		poll: function(url /*or {options} for app.remote()*/, occurrence, coopEvent /*or callback*/) {
		    //stop everything
		    if (url === false)
		        return _.each(this._polls, function(card) {
		            card.cancel();
		        });

		    var schedule;
		    if (_.isString(occurrence)) {
		        schedule = app.later.parse.text(occurrence);
		        if (schedule.error !== -1)
		            throw new Error('DEV::Application::poll() occurrence string unrecognizable...');
		    } else if (_.isPlainObject(occurrence))
		        schedule = occurrence;
		    else //number
		        schedule = Number(occurrence);

		    //make a key from url, or {url: ..., params/querys}
		    var key = url;
		    if (_.isPlainObject(key))
		        key = [key.url, _.reduce((_.map(key.params || key.querys, function(qV, qKey) {
		            return [qKey, qV].join('='); 
		        })).sort(), function(qSignature, more) {
		            return [more, qSignature].join('&');
		        }, '')].join('?');

		    //cancel polling
		    if (occurrence === false) {
		        if (this._polls[key])
		            return this._polls[key].cancel();
		        console.warn('DEV::Application::poll() No polling card registered yet for ' + key);
		        return;
		    }

		    //cancel previous polling
		    if (this._polls[key])
		        this._polls[key].cancel();

		    //register polling card
		    if (!occurrence || !coopEvent)
		        throw new Error('DEV::Application::poll() You must specify an occurrence and a coop event or callback...');
		    var card = {
		        _key: key,
		        url: url,
		        eof: coopEvent,
		        timerId: 'unknown',
		        failed: 0,
		        valid: true,
		    };
		    this._polls[key] = card;

		    var call = _.isNumber(schedule) ? window.setTimeout : app.later.setTimeout;
		    var worker = function() {
		        app.remote(url).done(function(data) {
		            //callback
		            if (_.isFunction(card.eof))
		                card.eof(data, card);
		            //coop event
		            else
		                app.coop('poll-data-' + card.eof, data, card);
		        }).fail(function() {
		            card.failed++;
		            //Warning: Hardcoded 3 attemps here!
		            if (card.failed >= 3) card.cancel();
		        }).always(function() {
		            //go schedule the next call
		            if (card.valid)
		                card.timerId = call(worker, schedule);
		        });
		    };
		    //+timerType
		    card.timerType = (call === window.setTimeout) ? 'native' : 'later.js';
		    //+timerId
		    card.timerId = call(worker, schedule);
		    //+cancel()
		    var that = this;
		    card.cancel = function() {
		        if (this.timerType === 'native')
		            window.clearTimeout(this.timerId);
		        else
		            this.timerId.clear();
		        this.valid = false;
		        delete that._polls[this._key];
		    };
		},

		//-----------------dispatcher/observer/cache----------------
		dispatcher: function(obj){ //+on/once, off; +listenTo/Once, stopListening; +trigger;
			var dispatcher;
			if(_.isPlainObject(obj))
				dispatcher = _.extend(obj, Backbone.Events);
			else
				dispatcher = _.clone(Backbone.Events);
			dispatcher.dispose = function(){
				this.off();
				this.stopListening();
			};
			return dispatcher;
		}, reactor: function(){ return app.dispatcher.apply(this, arguments); }, //alias: reactor

		model: function(data){
			//return new Backbone.Model(data);
			//Warning: Possible performance impact...
			return new Backbone.DeepModel(data);
			/////////////////////////////////////////
		},

		collection: function(data){
			if(data && !_.isArray(data))
				throw new Error('DEV::Application::collection You need to specify an array to init a collection');
			return new Backbone.Collection(data);
		},

		//selectn
		extract: function(keypath, from){
			return selectn(keypath, from);
		},

		//----------------url params---------------------------------
		param: function(key, defaultVal){
			var params = URI.parseQuery(app.uri(window.location.href).search()) || {};
			if(key) return params[key] || defaultVal;
			return params;
		},
		
		//----------------raw animation (DON'T mix with jQuery fx)---------------
		//(specifically, don't call $.animate() inside updateFn)
		//(you also can NOT control the rate the browser calls updateFn, its 60 FPS all the time...)
		animation: function(updateFn, condition, ctx){
			var id;
			var stepFn = function(t){
				updateFn.call(ctx);//...update...(1 tick)
				if(!condition || (condition && condition.call(ctx)))//...condition...(to continue)
					move();
			};
			var move = function(){
				if(id === undefined) return;
				id = app._nextFrame(stepFn);
			};
			var stop = function(){
				app._cancelFrame(id);
				id = undefined;
			};
			return {
				start: function(){id = -1; move();},
				stop: stop
			};
		},

		_nextFrame: function(stepFn){
			//return request id
			return window.requestAnimationFrame(stepFn);
		},

		_cancelFrame: function(id){
			return window.cancelAnimationFrame(id);
		},

		//effects see https://daneden.github.io/animate.css/
		//sample usage: 'view:data-rendered' --> app.animateItems();
		animateItems: function(selector /*or $items*/, effect, stagger){
			var $selector = $(selector); 
			if(_.isNumber(effect)){
				stagger = effect;
				effect = undefined;
			}
			effect = effect || 'flipInX';
			stagger = stagger || 150;
			var inOrOut = /In/.test(effect)? 1: (/Out/.test(effect)? -1: 0);

			$selector.each(function(i, el){
				var $el = $(el);
				//////////////////different than region.show effect because of stagger delay//////////////////
				if(inOrOut)
					if(inOrOut === 1) $el.css('opacity', 0);
					else $el.css('opacity', 1);
				//////////////////////////////////////////////////////////////////////////////////////////////
				_.delay(function($el){
					var fxName = effect + ' animated';
					$el.one(app.ADE, function(){
						$el.removeClass(fxName);
					}).addClass(fxName);
					///////////////reset opacity immediately, not after ADE///////////////
					if(inOrOut)
						if(inOrOut === 1) $el.css('opacity', 1);
						else $el.css('opacity', 0);
					//////////////////////////////////////////////////////////////////////
				}, i * stagger, $el);
			});
		},
		//----------------config.rapidEventDelay wrapped util--------------------
		//**Caveat: must separate app.config() away from app.run(), put view def (anything)
		//that uses app.config in between in your index.html. (the build tool automatically taken care of this)
		throttle: function(fn, ms){
			return _.throttle(fn, ms || app.config.rapidEventDelay);
		},

		debounce: function(fn, ms){
			return _.debounce(fn, ms || app.config.rapidEventDelay);
		},

		//----------------markdown-------------------
		//options.marked, options.hljs
		//https://guides.github.com/features/mastering-markdown/
		//our addition:
		//	^^^class class2 class3 ...
		//	...
		//	^^^
		markdown: function(md, $anchor /*or options*/, options){
			options = options || (!($anchor instanceof jQuery) && $anchor) || {};
			//render content
			var html = marked(md, app.debug('marked options are', _.extend(app.config.marked, (options.marked && options.marked) || options, $anchor instanceof jQuery && $anchor.data('marked')))), hljs = window.hljs;
			//highlight code (use ```language to specify type)
			if(hljs){
				hljs.configure(app.debug('hljs options are', _.extend(app.config.hljs, options.hljs, $anchor instanceof jQuery && $anchor.data('hljs'))));
				var $html = $('<div>' + html + '</div>');
				$html.find('pre code').each(function(){
					hljs.highlightBlock(this);
				});
				html = $html.html();
			}
			if($anchor instanceof jQuery)
				return $anchor.html(html).addClass('md-content');
			return html;
		},

		//----------------notify/overlay/popover---------------------
		notify: function(title /*or options*/, msg, type /*or otherOptions*/, otherOptions){
			if(_.isString(title)){
				if(_.isPlainObject(type)){
					otherOptions = type;
					type = undefined;
				}
				if(otherOptions && otherOptions.icon){
					//theme awesome ({.icon, .more})
					$.amaran(_.extend({
						theme: 'awesome ' + (type || 'ok'),
						//see http://ersu.me/article/amaranjs/amaranjs-themes for types
						content: {
							title: title,
							message: msg,
							info: otherOptions.more || ' ',
							icon: otherOptions.icon
						}
					}, otherOptions));
				} else {
					//custom theme
					$.amaran(_.extend({
						content: {
							themeName: 'stagejs',
							title: title,
							message: msg, 
							type: type || 'info',
						},
						themeTemplate: app.NOTIFYTPL
					}, otherOptions));
				}
			}
			else
				$.amaran(title);
		},

		//overlay or popover
		prompt: function(view, anchor, placement, options){
			if(_.isFunction(view))
				view = new view();
			else if(_.isString(view))
				view = new (app.get(view))();

			//is popover
			if(_.isString(placement)){
				options = options || {};
				options.placement = placement;
				return view.popover(anchor, options);
			}

			//is overlay
			options = placement;
			return view.overlay(anchor, options);
		},

		//----------------i18n-----------------------
		i18n: function(key, ns){
			if(key){
				//insert translations to current locale
				if(_.isPlainObject(key))
					return I18N.insertTrans(key);
				//return a translation for specified key, ns/module
				return String(key).i18n(ns);
			}
			return I18N.getResourceJSON(null, false); //collect available strings (so far) into an i18n object.
		},

		//----------------debug----------------------
		//Note: debug() will always return the last argument as return val. (for non-intrusive inline debug printing)
		debug: function(){
			var fn = console.debug || console.log;
			if(app.param('debug') === 'true')
				fn.apply(console, arguments);
			return arguments.length && arguments[arguments.length - 1];
		},

		//find a view instance by name or its DOM element.
		locate: function(name /*el or $el*/){
			//el, $el for *contained* view names only
			if(!_.isString(name)){
				var all;
				if(name)
					all = $(name).find('[data-view-name]');
				else
					all = $('[data-view-name]');

				all = all.map(function(index, el){
					return $(el).attr('data-view-name');
				}).get();
				return all;
			}

			//name string, find the view instance and sub-view names
			var view = $('[data-view-name="' + name + '"]').data('view');
			return view && {view: view, 'sub-views': app.locate(view.$el)};
		},

		//output performance related meta info so far for a view by name or its DOM element.
		profile: function(name /*el or $el*/){
			//el, $el for *contained* views total count and rankings
			if(!_.isString(name)){
				var all;
				if(name)
				 	all = $(name).find('[data-render-count]');
				else
					all = $('[data-render-count]');

				all = all.map(function(index, el){
					var $el = $(el);
					return {name: $el.data('view-name'), 'render-count': Number($el.data('render-count')), $el: $el};
				}).get();
				return {total: _.reduce(all, function(memo, num){ return memo + num['render-count']; }, 0), rankings: _.sortBy(all, 'render-count').reverse()};
			}

			//name string, profile the specific view and its sub-views
			var result = app.locate(name), view;
			if(result) view = result.view;
			return view && {name: view.$el.data('view-name'), 'render-count': view.$el.data('render-count'), $el: view.$el, 'sub-views': app.profile(view.$el)};
		},

		//mark views on screen. (hard-coded style, experimental)
		mark: function(name /*el or $el*/){
			var nameTagPairing = [], $body;
			if(_.isString(name)){
				var result = app.locate(name);
				if(!result) return;
				$body = result.view.parentRegion.$el;
			}else if(name){
				$body = $(name);
			}else
				$body = $('body');

			//clear all name tag
			$body.find('.dev-support-view-name-tag').remove();
			//round-1: generate border and name tags
			_.each(app.locate($body), function(v){
				var result = app.locate(v), $container;
				//add a container style
				if(result.view.category !== 'Editor')
					$container = result.view.parentRegion && result.view.parentRegion.$el;
				else
					$container = result.view.$el;
				//else return;
				if(!$container) return;

				$container.css({
					'padding': '1.5em', 
					'border': '1px dashed black'
				});
				//add a name tag (and live position it to container's top left)
				var $nameTag = $('<span class="label label-default dev-support-view-name-tag" style="position:absolute;">' + result.view.$el.data('view-name') + '</span>');
				//add click event to $nameTag
				$nameTag.css({cursor: 'pointer'})
				.on('click', function(){
					app.reload(result.view.$el.data('view-name'), true);
				});
				$body.append($nameTag);
				nameTagPairing.push({$tag: $nameTag, $ct: $container, view: result.view});
			});
			//round-2: position the name tags
			$window.trigger('resize');//trigger a possible resizing globally.
			_.defer(function(){
				_.each(nameTagPairing, function(pair){
					pair.$tag.position({
						my: 'left top',
						at: 'left top',
						of: pair.$ct
					});
					pair.view.on('close', function(){
						pair.$tag.remove();
					});
				});
			});
		},

		//reload everything, or override a view with newer version.
		reload: function(name, override/*optional*/){
			//reload globally
			if(!name)
				return window.location.reload();

			var result = app.locate(name);
			if(!result){
				app.mark();//highlight available views.
				throw new Error('DEV::app.reload():: Can NOT find view with given name: ' + name);
			}

			var v = result.view,
				region = v.parentRegion,
				category;
			//get type of the named object
			_.each(app.get(), function(data, key){
				if(data.indexOf(name) >= 0){
					category = key;
					return;
				}
			});
			if(!category)
				throw new Error('DEV::app.reload():: No category can be found with given view: ' + name);
			override = override || false;
			//override old view
			if(override){
				//clear template cache in cache
				app.Util.Tpl.cache.clear(v.template);
				//un-register the view
				app.Core[category].remove(name);
				//re-show the new view
				try{
					var view = new (app.get(name, category))();
					view.once('view:all-region-shown', function(){
						app.mark(name);
					});
					region.show(view);
				}catch(e){
					console.warn('DEV::app.reload()::Abort, this', name, 'view is not defined alone, you need to find its source.', e);
				}
			}else{
				//re-render the view
				v.refresh();
			}
			//return this;
		},

		inject: {
			js: function(){
				return app.Util.inject.apply(null, arguments);
			},

			tpl: function(){
				return app.Util.Tpl.remote.apply(app.Util.Tpl, arguments);
			},

			css: function(){
				return loadCSS.apply(null, arguments);
			}
		},

		//--------3rd party lib pass-through---------
		
		// js-cookie (former jquery-cookie)
		//.set(), .get(), .remove()
		cookie: Cookies,

		// store.js (localStorage)
		//.set(), .get(), .getAll(), .remove(), .clear()
		store: store.enabled && store,

		// validator.js (form data type,val,deps validation)
		validator: validator,

		// moment.js (date and time)
		moment: moment,

		// URI.js (uri,query and hash in the url)
		uri: URI,

		// later.js (schedule repeated workers, e.g poll RESTful data)
		later: later,
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
		'dispatcher/reactor', 'model', 'collection',
		//view related
		'context - @alias:page', 'view', 'widget', 'editor', 'editor.validator - @alias:editor.rule',
		//global action locks
		'lock', 'unlock', 'available', 
		//utils
		'has', 'get', 'coop', 'navigate', 'icing/curtain', 'i18n', 'param', 'animation', 'animateItems', 'throttle', 'debounce',
		//com
		'remote', 'download', 'ws', 'poll',
		//3rd-party lib short-cut
		'extract', 'markdown', 'notify', 'prompt', //wraps
		'cookie', 'store', 'moment', 'uri', 'validator', 'later', //direct refs
		//supportive
		'debug', 'reload', 'locate', 'profile', 'mark', 'nameToPath', 'pathToName', 'inject.js', 'inject.tpl', 'inject.css',
		//@deprecated
		'create - @deprecated', 'regional - @deprecated'
	];

	/**
	 * Statics
	 */
	//animation done events used in Animate.css
	app.ADE = 'webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend';
	//notification template
	app.NOTIFYTPL = Handlebars.compile('<div class="alert alert-dismissable alert-{{type}}"><button data-dismiss="alert" class="close" type="button">×</button><strong>{{title}}</strong> {{{message}}}</div>');

})(Application);