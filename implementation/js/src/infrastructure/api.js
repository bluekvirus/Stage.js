/**
 * Framework APIs (global - app.*)
 *
 * Note: View APIs are in view.js (view - view.*)
 * 
 * @author Tim Lauv
 * @created 2015.07.29
 * @updated 2017.04.04
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
		//pass in [name,] options to define view (named view will be registered)
		//pass in name to get registered view def
		//pass in options, true to create anonymous view
		view: function(name /*or options*/, options /*or instance flag*/){
			if(_.isString(name) && _.isPlainObject(options)){
				return app.Core.View.register(name, options);
			}

			if(_.isPlainObject(name)){
				var instance = options;
				options = name;
				var Def = app.Core.View.register(options);

				if(_.isBoolean(instance) && instance) return Def.create();
				return Def;
			}

			return app.Core.View.get(name);
		},

			//@deprecated---------------------
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
				console.warn('DEV::Application::context() method is deprecated, use .view() instead for', options.name || options /*as an indicator of anonymous view*/);
				return app.Core.Context.register(options);
			},
			//--------------------------------

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
			type = type || 'View';
			if(name)
				return app.Core[type] && app.Core[type].has(name);

			_.each(['Context', 'View', 'Widget', 'Editor'], function(t){
				if(!type && app.Core[t].has(name))
					type = t;
			});

			return type;
		},

		//(name can be of path form)
		//always return View definition.
		get: function(name, type, options){
			if(!name)
				return {
					'Context': app.Core.Context.get(),
					'View': app.Core.View.get(),
					'Widget': app.Core.Widget.get(),
					'Editor': app.Core.Editor.get()
				};

			if(_.isPlainObject(type)){
				options = type;
				type = undefined;
			}

			var Reusable, t = type || 'View';
			options = _.extend({fallback: false, override: false}, options);

			//try local
			if(!options.override)
				Reusable = (app.Core[t] && app.Core[t].get(name)) || (options.fallback && app.Core['View'].get(name));
			
			//try remote, if we have app.viewSrcs set to load the View def dynamically
			if(!Reusable && app.config && app.config.viewSrcs){
				var targetJS = _.compact([app.config.viewSrcs, t.toLowerCase()/*not view.category yet*/, app.nameToPath(name)]).join('/') + '.js';
				app.inject.js(
					targetJS, true //sync
				).done(function(){
					app.debug(t, name, 'injected', 'from', app.config.viewSrcs);
					if(app.has(name, t) || (options.fallback && app.has(name)))
						Reusable = app.get(name, t, {fallback: true});
					else
						throw new Error('DEV::Application::get() loaded definitions other than required ' + name + ' of type ' + t + ' from ' + targetJS + ', please check your view name in that file!');
				}).fail(function(jqXHR, settings, e){
					if(!options.fallback || (t === 'View'))
						throw new Error('DEV::Application::get() can NOT load definition for ' + name + ' - [' + e + ']');
					else
						Reusable = app.get(name, 'View');
				});
			}

			return Reusable;
		},

		//**Caveat**: spray returns the region (created on $anchor), upon returning, its 'show' event has already passed.
		spray: function($anchor, View /*or template or name or instance or options or svg draw(paper){} func */, options, parentCt){
			var $el = $($anchor);
			parentCt = parentCt || app.mainView;

			//check if $anchor is already a region
			var region = $el.data('region');
			var regionName = region && region._name;
			if(!regionName){
				regionName = $el.attr('region') || _.uniqueId('anonymous-region-');
				$el.attr('region', regionName);
				region = parentCt.addRegion(regionName, '[region="' + regionName + '"]');
				region.ensureEl(parentCt);
			} else 
				parentCt = region.parentCt;

			//see if it is an svg draw(paper){} function
			if(_.isFunction(View) && View.length === 1){
				//svg
				return parentCt.show(regionName, {
					template: '<div svg="canvas"></div>',
					data: options && options.data, //only honor options.data if passed in.
					svg: {
						canvas: View
					},
					onPaperCleared: function(paper){
						paper._fit($el);
					},
				});
			}else
				//view
				return parentCt.show(regionName, View, options); //returns the sub-regional view.
			
		},

		icing: function(name, flag, View, options){
			if(_.isBoolean(name)){
				options = View;
				View = flag;
				flag = name;
				name = 'default';
			}

			var regionName = ['icing', 'region', name].join('-');
			if(!app.mainView.getRegion(regionName) && !_.isBoolean(name)){
				options = flag;
				View = name;
				flag = true;
				name = 'default';
			}

			regionName = ['icing', 'region', name].join('-');
			var ir = app.mainView.getRegion(regionName);
			if(flag === false){
				ir.$el.hide();
				ir.currentView && ir.currentView.close();
			}
			else {
				ir.$el.show();
				app.mainView.show(regionName, View, options);
			}
		},

		coop: function(event){
			var args = _.toArray(arguments);
			args.unshift('app:coop');
			app.trigger.apply(app, args);
			args = args.slice(2);
			args.unshift('app:coop-' + event);
			app.trigger.apply(app, args);
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

		navPathArray: function(){
			return _.compact(window.location.hash.replace('#navigate', '').split('/'));
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
		
		download: function(ticket /*or url*/, options /*{params:{...}} only*/){
			return app.Util.download(ticket, options);
		},

		upload: function(url, options){
			return app.Util.upload(url, options);
		},

		//data push 
		//(ws channels)
		_websockets: {},
		/**
		 * returns a promise.
		 * 
		 * Usage
		 * -----
		 * register: app.config.defaultWebsocket or app.ws(socketPath);
		 * receive (e): view.coop['ws-data-[channel]'] or app.onWsData = custom fn;
		 * send (json): app.ws(socketPath)
		 * 								.then(function(ws){ws.channel(...).json({...});}); default per channel data
		 * 								.then(function(ws){ws.send(); or ws.json();}); anything by any contract
		 * e.websocket = ws in .then(function(ws){})
		 *
		 * Default messaging contract
		 * --------------------------
		 * Nodejs /devserver: json {channel: '..:..', payload: {..data..}} through ws.channel('..:..').json({..data..})
		 * Python ASGI: json {stream: '...', payload: {..data..}} through ws.stream('...').json({..data..})
		 *
		 * Reconnecting websockets
		 * -----------------------
		 * websocket path ends with '+' will be reconnecting websocket when created. 
		 * 
		 */
		ws: function(socketPath, coopEvent /*or callback or options*/){
			if(!Modernizr.websockets) throw new Error('DEV::Application::ws() Websocket is not supported by your browser!');
			socketPath = socketPath || app.config.defaultWebsocket || '/ws';
			var reconnect = false;
			if(_.string.endsWith(socketPath, '+')){
				socketPath = socketPath.slice(0, socketPath.length - 1);
				reconnect = true;
			}
			var d = $.Deferred();
			if(!app._websockets[socketPath]) { 

				app._websockets[socketPath] = new WebSocket("ws://" + location.host + socketPath);
				app._websockets[socketPath].path = socketPath;
				app._websockets[socketPath].reconnect = reconnect;
				//events: 'open', 'error', 'close', 'message' = e.data
				//apis: send(), +json(), +channel().json(), close()

				app._websockets[socketPath].json = function(data){
					app._websockets[socketPath].send(JSON.stringify(data));
				};
				app._websockets[socketPath].channel = function(channel){
					return {
						name: channel,
						websocket: app._websockets[socketPath],
						json: function(data){
							app._websockets[socketPath].json({
								channel: channel,
								stream: channel, //alias for ASGI backends
								payload: data
							});
						}
					};
				};
				app._websockets[socketPath].stream = app._websockets[socketPath].channel; //alias for ASGI backends
				app._websockets[socketPath].onclose = function(){
					var ws = app._websockets[socketPath];
					delete app._websockets[socketPath];

					if(ws.reconnect)
						app.ws(ws.path + '+');
				};
				app._websockets[socketPath].onopen = function(){
					return d.resolve(app._websockets[socketPath]);
				};

				//general ws data stub
				//server need to always send default json contract string {"channel/stream": "...", "payload": "..."}
				//Opt: override this through app.ws(path).then(function(ws){ws.onmessage=...});
				app._websockets[socketPath].onmessage = function(e){
					//opt a. override app.onWsData to active otherwise
					app.trigger('app:ws-data', {websocket: app._websockets[socketPath], raw: e.data});
					//opt b. use global coop event 'ws-data-[channel]' in views directly (default json contract)
					try {
						var data = JSON.parse(e.data);
						app.coop('ws-data-' + (data.channel || data.stream), data.payload, app._websockets[socketPath].channel(data.channel || data.stream));
					}catch(ex){
						console.warn('DEV::Application::ws() Websocket is getting non-default {channel: ..., payload: ...} json contract strings...');
					}
				};

				//register coopEvent or callback function or callback options
				if(coopEvent){
					//onmessage callback function
					if(_.isFunction(coopEvent)){
						//overwrite onmessage callback function defined by framework
						app._websockets[socketPath].onmessage = function(e){
							coopEvent(e.data, e, app._websockets[socketPath]);
						};
					}
					//object may contain onmessage, onerror, since onopen and onclose is done by the framework
					else if(_.isPlainObject(coopEvent)){
						//traverse through object to register all callback events
						_.each(coopEvent, function(fn, eventName){
							//guard events
							if(_.contains(['onmessage', 'onerror'], eventName))
								app._websockets[socketPath][eventName] = fn;
						});
					}
					//app coop event
					else if(_.isString(coopEvent)){
						//trigger coop event with data from sse's onmessage callback
						 app._websockets[socketPath].onmessage = function(e){
							app.coop('ws-data-' + coopEvent, e.data, e, app._websockets[socketPath]);
						};
					}
					//type is not right
					else
						console.warn('DEV::Application::ws() The coopEvent or callback function or callbacks\' options you give is not right.');
				}
				
			}else
				d.resolve(app._websockets[socketPath]);
			return d.promise();
		},

		//data polling 
		//(through later.js) and emit data events/or invoke callback
		_polls: {},
		poll: function(url /*or {options} for app.remote()*/, occurrence, coopEvent /*or callback or options*/) {
		    //stop everything
		    if (url === false)
		        return _.map(this._polls, function(card) {
		            return card.cancel();
		        });

		    var schedule;
		    if (_.isString(occurrence) && !Number.parseInt(occurrence)) {
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
		        timerId: undefined,
		        failed: 0,
		        valid: true,
		        occurrence: occurrence, //info only
		    };
		    this._polls[key] = card;

		    var call = _.isNumber(schedule) ? window.setTimeout : app.later.setTimeout;

		    //if coopEvent is an object. register options events before calling app.remote
		    if(_.isPlainObject(coopEvent)){
		    	//save url
		    	var temp = url;
		    	
		    	//build url as an object for app.remote
		    	url = {
		    		url: temp
		    	};
		    	_.each(coopEvent, function(fn, eventName){
		    		//guard for only allowing $.ajax events
		    		if(_.contains(['beforeSend', 'error', 'dataFilter', 'success', 'complete'], eventName))
		    			url[eventName] = fn;
		    	});
		    }

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
		    //+cancel()
		    var that = this;
		    card.cancel = function() {
		    	this.valid = false;
		        if (this.timerType === 'native')
		            !_.isUndefined(this.timerId) && window.clearTimeout(this.timerId);
		        else
		            !_.isUndefined(this.timerId) && this.timerId.clear();
		        delete that._polls[this._key];
		        return this;
		    };

		    //make the 1st call (eagerly)
		    worker();
		},

		//-----------------ee/observer with built-in state-machine----------------
		//use start('stateB') or trigger('stateA-->stateB') to swap between states
		//use ['stateA-->stateB', 'stateC<-->stateB', 'stateA<--stateC', ...] in edges to constrain state changes.
		ee: function(data, evtmap, edges){ //+on/once, off, +start/reset/stop/getState/getEdges; +listenTo/Once, stopListening; +trigger*;
			var dispatcher;

			data = _.extend({}, data, {cid: _.uniqueId('ee')});
			evtmap = _.extend({
				'initialize': _.noop,
				'finalize': _.noop,
			}, evtmap);
			edges = _.reduce(edges || {}, function(mem, val, index){
				var bi = val.match('(.*)<-->(.*)'),
				left = val.match('(.*)<--(.*)'),
				right = val.match('(.*)-->(.*)');

				if(bi){
					mem[bi[1] + '-->' + bi[2]] = true;
					mem[bi[2] + '-->' + bi[1]] = true;
				} else if (left)
					mem[left[2] + '-->' + left[1]] = true;
				else if (right)
					mem[val] = true;
				else
					console.warn('DEV::Application::ee() illegal edge format: ' + val);

				return mem;
			}, {});
			if(!_.size(edges)) edges = undefined;

			dispatcher = _.extend(data, Backbone.Events);
			var oldTriggerFn = dispatcher.trigger;
			var currentState = '';

			//add a state-machine friendly .trigger method;
			dispatcher.trigger = function(){
				var changeOfStates = arguments[0] && arguments[0].match('(.*)-->(.*)');
				if(changeOfStates && changeOfStates.length){
					var from = _.string.trim(changeOfStates[1]), to = _.string.trim(changeOfStates[2]);

					//check edge constraints
					if(from && to && edges && !edges[arguments[0]]){
						console.warn('DEV::Application::ee() edge constraint: ' + from + '-x->' + to);
						return this;
					}

					//check current state
					if(from != currentState){
						console.warn('DEV::Application::ee() current state is ' + (currentState || '\'\'') + ' not ' + from);
						return this;
					}

					this.trigger('leave', {to: to});
					//unregister event listeners in [from] state
					_.each(evtmap[from], function(listener, e){
						dispatcher.off(from + ':' + e);
					});
					//register event listeners in [to] state
					_.each(evtmap[to], function(listener, e){
						dispatcher.on(to + ':' + e, listener);
					});
					currentState = to;
					this.trigger('enter', {from: from});
				} else {
					if(evtmap[currentState] && evtmap[currentState][arguments[0]])
						arguments[0] = currentState + ':' + arguments[0];
					oldTriggerFn.apply(this, arguments);
				}
				return this;
			};

			//add an internal worker swap method;
			dispatcher._swap = function(targetState){
				targetState = targetState || '';
				this.trigger(currentState + '-->' + targetState);				
				return this;
			};

			//add a start method; (start at any state)
			dispatcher.start = function(targetState){
				targetState = targetState || currentState;
				return this._swap(targetState);
			};

			//add a reset method; (reset to '' state)
			dispatcher.reset = function(){
				return this._swap();
			};

			//add a clean-up method;
			dispatcher.stop = function(){
				this.trigger('finalize');
				this.off();
				this.stopListening();
			};

			//add some getters;
			dispatcher.getState = function(){
				return currentState;
			};

			dispatcher.getEdges = function(){
				return edges;
			};

			//mount shared events
			_.each(evtmap, function(listener, eOrStateName){
				if(!_.isFunction(listener)) return;

				dispatcher.on(eOrStateName, listener);
			});

			this.trigger('initialize');
			return dispatcher;
		},

		model: function(data, flat){
			if(_.isBoolean(data)){
				flat = data;
				data = undefined;
			}

			if(flat)
				return new Backbone.Model(data);
			//Warning: Possible performance impact...(default)
			return new Backbone.DeepModel(data);
			/////////////////////////////////////////
		},

		collection: function(data){
			if(data && !_.isArray(data))
				throw new Error('DEV::Application::collection You need to specify an array to init a collection');
			return new Backbone.Collection(data);
		},

		//selectn (dotted.key.path.val.extraction from any obj)
		extract: function(keypath, from){
			return selectn(keypath, from);
		},

		mock: function(schema, provider){
			return app.Util.mock(schema, provider);
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
		//sample usage: 'ready' --> app.animateItems();
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
					$el.anyone(app.ADE, function(){
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

		//Built-in web worker utility, bridged from app.Util.worker.
		worker: function(name/*web worker's name*/, coopEOrCallbackOrOpts){
			return app.Util.worker(name, coopEOrCallbackOrOpts);
		},

		//Built-in Server-Sent Event(SSE) utility, bridged from app.Util.sse
		sse: function(url/*sse's url*/, coopEOrCallbackOrOpts){
			return app.Util.sse(url, coopEOrCallbackOrOpts);
		},
		
		//----------------config.rapidEventDelay wrapped util--------------------
		//**Caveat**: if using cached version, pass `this` and other upper scope vars into fn as arguments, else
		//these in fn will be cached forever and might no longer exist or point to the right thing when called...
		throttle: function(fn, ms, cacheId){
			
			ms = ms || app.config.rapidEventDelay;
			fn = _.throttle(fn, ms);
			if(!cacheId)
				return fn;

			//cached version (so you can call right after wrapping it)
			this._tamedFns = this._tamedFns || {};
			var key = fn + cacheId + '-throttle' + ms;
			if(!this._tamedFns[key])
				this._tamedFns[key] = fn;
			return this._tamedFns[key];
		},

		debounce: function(fn, ms, cacheId){
			ms = ms || app.config.rapidEventDelay;
			fn = _.debounce(fn, ms);
			if(!cacheId)
				return fn;

			//cached version (so you can call right after wrapping it)
			this._tamedFns = this._tamedFns || {};
			var key = fn + cacheId + '-debounce' + ms;
			if(!this._tamedFns[key])
				this._tamedFns[key] = fn;
			return this._tamedFns[key];
		},

		//app wide e.preventDefault() util
		preventDefaultE: function(e){
			var $el = $(e.target);
			//Caveat: this clumsy bit here is due to the in-ability to check on the 'action-*' attributes on e.target...
			if($el.is('label') || $el.is('i') || $el.is('img') || $el.is('span') || $el.is('input') || $el.is('textarea') || $el.is('select') || ($el.is('a') && $el.attr('href')))
				return;
			e.preventDefault();
		},

		//wait until all targets fires e (asynchronously) then call the callback with targets (e.g [this.show(), ...], 'ready')
		until: function(targets, e, callback){
			targets = _.compact(targets);
			cb = _.after(targets.length, function(){
				callback(targets);
			});
			_.each(targets, function(t){
				t.once(e, cb);
			});
		},

		//----------------markdown-------------------
		//options.marked, options.hljs
		//https://guides.github.com/features/mastering-markdown/
		//our addition:
		//	^^^class class2 class3 ...
		//	...
		//	^^^
		markdown: function(md, $anchor /*or options*/, options){
			options = options || (!_.isjQueryObject($anchor) && $anchor) || {};
			//render content
			var html = marked(md, app.debug('marked options are', _.extend(app.config.marked, (options.marked && options.marked) || options, _.isjQueryObject($anchor) && $anchor.data('marked')))), hljs = window.hljs;
			//highlight code (use ```language to specify type)
			if(hljs){
				hljs.configure(app.debug('hljs options are', _.extend(app.config.hljs, options.hljs, _.isjQueryObject($anchor) && $anchor.data('hljs'))));
				var $html = $('<div>' + html + '</div>');
				$html.find('pre code').each(function(){
					hljs.highlightBlock(this);
				});
				html = $html.html();
			}
			if(_.isjQueryObject($anchor))
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
				view = app.get(view).create();

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

			//otherwise, collect available strings (so far) into an i18n object.
			return I18N.getResourceJSON(null, false);
		},

		//----------------debug----------------------
		
		//bridge app.debug()
		debug: function(){
			return app.Util.debugHelper.debug();
		},

		//bridge app.locate()
		locate: function(name /*el or $el*/){
			return app.Util.debugHelper.locate(name);
		},

		//bridge app.profile()
		profile: function(name /*el or $el*/){
			return app.Util.debugHelper.profile(name);
		},

		//bridge app.mark()
		mark: function(name /*el or $el*/){
			return app.Util.debugHelper.mark(name);
		},

		//bridge app.reload()
		reload: function(name, override/*optional*/){
			return app.Util.debugHelper.reload(name, override);
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

		// faker.js
		faker: faker,
	});

	//editor rules
	app.editor.validator = app.editor.rule = function(name, fn){
		if(!_.isString(name)) throw new Error('DEV::Validator:: You must specify a validator/rule name to use.');
		return app.Core.Editor.addRule(name, fn);
	};

	//alias
	app.page = app.context;
	app.area = app.regional;
	app.curtain = app.icing;

	/**
	 * API summary
	 */
	app._apis = [
		'ee', 'model', 'collection', 'mock',
		//view registery
		'view', 'widget', 'editor', 'editor.validator - @alias:editor.rule',
		//global action locks
		'lock', 'unlock', 'available', 
		//utils
		'has', 'get', 'spray', 'coop', 'navigate', 'navPathArray', 'icing/curtain', 'i18n', 'param', 'animation', 'animateItems', 'throttle', 'debounce', 'preventDefaultE', 'until',
		//com
		'remote', 'download', 'upload', 'ws', 'poll', 'worker', 'sse',
		//3rd-party lib short-cut
		'extract', 'markdown', 'notify', 'prompt', //wraps
		'cookie', 'store', 'moment', 'uri', 'validator', 'later', 'faker', //direct refs
		//supportive
		'debug', 'reload', 'locate', 'profile', 'mark', 'nameToPath', 'pathToName', 'inject.js', 'inject.tpl', 'inject.css',
		//@deprecated
		'create - @deprecated', 'regional - @deprecated', 'context - @alias:page - @deprecated'
	];

	/**
	 * Statics
	 */
	//animation done events used in Animate.css
	//Caveat: if you use $el.one(app.ADE) but still got 2+ callback calls, the browser is firing the default and prefixed events at the same time...
	//use $el.anyone() to fix the problem in using $el.one()
	app.ADE = 'animationend webkitAnimationEnd MSAnimationEnd oAnimationEnd transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd';
	//notification template
	app.NOTIFYTPL = Handlebars.compile('<div class="alert alert-dismissable alert-{{type}}"><button data-dismiss="alert" class="close" type="button">×</button><strong>{{title}}</strong> {{{message}}}</div>');

})(Application);