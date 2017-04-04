/**
 * This is where we extend and enhance the abilities of a View through init,lifecycle augmentation.
 * 
 * View hierarchy:
 * ---------------
 * the View
 * 		|
 * 		is
 * 		|
 * [M.Layout*] see layout.js
 * 		|+render()*, +close()*, +regions recognition (+effects recognition)
 * 		|
 * M.ItemView
 * 		|+render() --> this.getTemplate() --> M.Renderer.render --> M.TemplateCache.get --> cache.load --> cache.loadTemplate
 * 		|+set()/get() [for data loading, 1-way binding (need 2-way binders?)]
 * 		|[use bindUIElements() in render()]
 * 		|
 * [M.View.prototype.constructor*] (this file, does NOT have render())
 * 		|+fixed enhancements (see below)
 * 		|+pick and activate optional ones (b, see below List of view options...)
 * 		|
 * M.View.apply(this)
 * 		|+close, +this.options, +bindUIElements
 * 		|
 * BB.View.prototype.constructor
 * 		|+events, +remove, +picks (a, see below List of view options...)
 * 		|
 * 	 ._ensureElement()
 *   .initialize(options) [options is already available in this.options]
 * 	 .delegateEvents() (pickup .events)
 * 		|
 * ---------------
 *
 * View render() implementation is in item-view.js:set() and render()!
 *
 * ---------------
 *
 * View life-cycle:
 * ---------------
 * new View(cfg) --> render()* +$el with template, events and enhancements --> show()* +DOM, data --> ready() call onReady(), +navigation-chain, svg, poll, channels upon re-rendered with data.
 * 
 * Fixed enhancement:
 * ---------------
 * +pick additional live options
 * +actions
 * +auto ui tags pickup
 * +meta event programming (view:* (event-name) - on* (camelized))
 * +coop e support
 * +view name to $el metadata
 * +twitter bootstrap 3 tooltips/popovers
 * +use view as popover 
 * +use view as overlay
 * +dnd(with sortable)/selectable
 * +activations
 * +poll
 * +channels
 * (see ItemView/Layout/Region for the rest of abilities, e.g template/layout(render), data/useParentData, editors, svg, more, tab, lock, effect...)
 *
 * List of view options passed through new View(opt) that will be auto-merged as properties:
 * 		a. from Backbone.View ['model', 'collection', 'el', 'id', 'attributes', 'className', 'tagName', 'events'];
 * 		b*. from M.View ['templateHelpers']; (through M.getOption() -- tried both this and this.options)
 *   	c. from us ['effect', 'template', 'layout', 'data/useParentData', 'useFlatModel', 'coop', 'dnd', 'selectable', 'actions', 'editors', 'tooltips/popovers', 'svg', 'poll', 'channels'];
 *
 * Tip:
 * All new View(opt) will have this.options = opt ready in initialize(), also this.*[all auto-picked properties above].
 * 
 * Note: override View.constructor to affect only decendents, e.g ItemView and CollectionView... 
 * (This is the Backbone way of extend...)
 * Note: this.name and this.category comes from core.reusable registry.
 * Note: $.plugin effects are from jQuery.UI, view/region effects are from animate.css
 * 
 * 
 * @author Tim Lauv
 * @created 2014.02.25
 * @updated 2015.08.03
 * @updated 2016.10.25
 * @updated 2017.03.10
 */


;(function(app){

	//+obj api
	_.extend(Backbone.Marionette.View.prototype, {

		//expose isInDOM method (hidden in marionette.domRefresh.js)
		isInDOM: function($el){
			if(!$el && !this.$el) return undefined;
			return $.contains(document.documentElement, ($el || this.$el)[0]);
		},

		//override to give default empty template
		getTemplate: function(asHTMLString){
			if(!asHTMLString)
				return Marionette.getOption(this, 'template') || (
					(Marionette.getOption(this, 'editors') || Marionette.getOption(this, 'svg') || Marionette.getOption(this, 'layout'))? ' ' /*must have 1+ space*/ : '<div class="wrapper-full bg-warning"><p class="h3" style="margin:0;"><span class="label label-default" style="display:inline-block;">No Template</span> ' + this._name + '</p></div>'
				);
			else
				//return the fully resolved HTML template string (not as a cached tpl fn)
				return app.Util.Tpl.Cache.get(this.getTemplate(), asHTMLString);
		},

		//override triggerMethod again to use our version (since it was registered through closure)
		triggerMethodInversed: Marionette.triggerMethodInversed,

		//local collaboration under the same parentCt (Trick: use this.coop() instead of this._coop())
		_coop: function(){
			var pCt = this.parentCt, listener = app.Util.metaEventToListenerName(arguments[0]);
			while (pCt && !pCt[listener]) pCt = pCt.parentCt;
			if(pCt) pCt[listener].apply(pCt, _.toArray(arguments).slice(1));
		},

		//enable global coop e (callback is optional)
		_enableGlobalCoopEvent: function(e, callback){
			this.listenTo(app, 'app:coop-' + e, function(){
				if(_.isFunction(callback))
					callback.apply(this, arguments);
				var args = _.toArray(arguments);
				args.unshift('view:' + e);
				this.trigger.apply(this, args);
			});
		},

		//activate tooltip/popover (bootstrap version)
		_enableBootstrapJS: function(type, options){
			this.listenTo(this, 'render', function(){
				//will activate tooltip/popover with specific options object - see /libs/bower_components/bootstrap[x]/docs/javascript.html#tooltips or popovers
				this.$('[data-toggle="' + type + '"]')[type](options);
			});
			this.listenTo(this, 'close', function(){
				this.$('[data-toggle="' + type + '"]')[type]('destroy');
			});
		},

		/**
		 * Action Tag listener hookups +actions{} (do it in initialize())
		 * + event forwarding ability to action tags
		 * Usage
		 * -----
		 * 		1. add action tags to html template -> e.g  <div ... action="listener"></div>
		 * 													<div ... action-dblclick="listener"></div>
		 * 													<div ... action-scroll="view:method-name"></div>
		 * 		2. implement the action method name in UI definition body's actions{} object. 
		 * 		functions under actions{} are invoked with 'this' as scope (the view object).
		 * 		functions under actions{} are called with a 2 params ($action, e) which is a jQuery object referencing the action tag and the jQuery prepared event object, use e.originalEvent to get the DOM one.
		 *
		 * Options
		 * -------
		 * 1. debugViewNameTag - this is optional, mainly for better debugging msg;
		 * 2. passOn - [false] this is to let the event of action tags bubble up if an action listener is not found. 
		 *
		 * Caveat
		 * ------
		 * Your listeners might need to be _.throttled() with app.config.rapidEventDelay.
		 * 
		 * Note:
		 * A. We removed _.bind() altogether from the _enableActionTags() function and use Function.apply(scope, args) instead for listener invocation to avoid actions{} methods binding problem.
		 * Functions under actions will only be bound ONCE to the first instance of the view definition, since _.bind() can not rebind functions that were already bound, other instances of
		 * the view prototype will have all the action listeners bound to the wrong view object. This holds true to all nested functions, if you assign the bound version of the function back to itself
		 * e.g. this.nest.func = _.bind(this.nest.func, this); - Do NOT do this in initialize()/constructor()!! Use Function.apply() for invocation instead!!!
		 *
		 */
		_enableSpecialActionTags: function(){
			var that = this;
			_.each(['scroll', 'scroll-bottom', 'scroll-top', /*'left,right'*/ 'error', 'load'], function(e){
				this.$el.find('[action-' + e + ']').each(function(index, el){
					//extra e.sub-events are handled by e listener, so skip.
					var tmp = e.split('-');
					var $el = $(this);
					if($el.data('special-e-' + tmp[0])) return;

					$el.on(tmp[0], function(innerE){
						//dirty hack to make scroll-bottom/-top [/-left/-right] work in actions
						if(innerE.type === 'scroll'){
							if($el.attr('action-scroll-bottom'))
								//window scroll distance  + window height (include padding) === inner doc height.
								($el.scrollTop() + $el.innerHeight() === $el.prop('scrollHeight')) && (innerE.type += '-bottom');
							if($el.attr('action-scroll-top'))
								($el.scrollTop() === 0) && (innerE.type += '-top');
							// case 'left':
							// case 'right':
							//**NOTE: that, scroll-* will always be triggered by scroll, we just ignore it when there is no action-scroll tag
							if(innerE.type === 'scroll' && !$el.attr('action-scroll'))
								return;
						}
						that._doAction(innerE);
					}).data('special-e-' + tmp[0], 'registered');
				});
			}, this);
		},
		_enableActionTags: function(debugViewNameTag, passOn){ //the debugViewNameTag is just there to output meaningful dev msg if some actions haven't been implemented.

			if(_.isBoolean(debugViewNameTag)){
				passOn = debugViewNameTag;
				debugViewNameTag = '';
			}
			passOn = passOn || false;
			this.events = this.events || {};
			//hookup general action tag event listener dispatcher
			//**Caveat**: _doAction is not _.throttled() with app.config.rapidEventDelay atm.
			_.extend(this.events, {
				//------------default------------------------------
				'click [action]': '_doAction',

				//------------<any>--------------------------------
				'click [action-click]': '_doAction',
				'dblclick [action-dblclick]': '_doAction',
				'contextmenu [action-contextmenu]': '_doAction',

				'mousedown [action-mousedown]': '_doAction',
				'mousemove [action-mousemove]': '_doAction',
				'mouseup [action-mouseup]': '_doAction',
				'mouseenter [action-mouseenter]': '_doAction', //per tag, [not a bubble event in some browser, use mouseover]
				'mouseleave [action-mouseleave]': '_doAction', //per tag, [not a bubble event in some browser, use mouseout]
				'mouseover [action-mouseover]': '_doAction', //=enter but bubble
				'mouseout [action-mouseout]': '_doAction', //=leave but bubble

				//note that 'hover' is not a valid event.

				'keydown [action-keydown]': '_doAction',
				'keyup [action-keyup]': '_doAction',
				//'keypress [action-keypress]': '_doAction', //use keydown instead (non-printing keys and focus-able diff)

				//'focus [action-focus]': '_doAction', //use focusin instead (non bubble even with passOn: true in IE)
				'focusin [action-focusin]': '_doAction', //tabindex=seq or -1
				'focusout [action-focusout]': '_doAction', //tabindex=seq or -1
				//'blur [action-blur]': '_doAction', //use focusin instead (non bubble even with passOn: true in IE, FF)

				//------------<input>, <select>, <textarea>--------
				'change [action-change]': '_doAction',
				'select [action-select]': '_doAction', //text selection only <input>, <textarea>
				'submit [action-submit]': '_doAction', //<input type="submit">, <input type="image"> or <button type="submit">

				//------------<div>, <any.overflow>----------------
				//'scroll [action-scroll]': '_doAction', //non bubble, see _enableSpecialActionTags
				//'scroll-bottom'
				//'scroll-top'

				//------------<script>, <img>, <iframe>------------
				//'error [action-error]': '_doAction', //non bubble, _enableSpecialActionTags
				//'load [action-load]': '_doAction' //non bubble, _enableSpecialActionTags

				//window events:
				// load [use $(ready-fn) instead],
				// unload, 
				// resize [use coop 'window-resized'], 
				// scroll [use coop 'window-scroll'],

			});
			this.actions = this.actions || {}; 	

			//captured events will not bubble further up (due to e.stopPropagation)
			this._doAction = function(e){

				//**Caveat: non-bubble event will not change e.currentTarget to be current el (the one has [action-*])
				var $el = $(e.currentTarget);
				var action = $el.attr('action-' + e.type) || $el.attr('action') || ('_NON-BUBBLE_' + e.type);
				var lockTopic = $el.attr('lock'),
				unlockTopic = $el.attr('unlock');

				if(unlockTopic) app.unlock(unlockTopic);

				if(lockTopic && !app.lock(lockTopic)){
					e.stopPropagation();
					app.preventDefaultE(e);
					app.trigger('app:locked', action, lockTopic);
					return;
				}

				if($el.hasClass('disabled') || $el.parent().hasClass('disabled')) {
					e.stopPropagation();
					app.preventDefaultE(e);					
					return;
				}

				//Special: only triggering a meta event (e.g action-dblclick=view:method-name) without doing anything.
				var eventForwarding = String(action).split(':');
				if(eventForwarding.length >= 2) {
					while(eventForwarding.length > 2)
						eventForwarding.shift();
					e.stopPropagation(); //Important::This is to prevent confusing the parent view's action tag listeners.
					app.preventDefaultE(e);
					return this.trigger(eventForwarding.join(':'));
				}

				//Normal: call the action fn
				var doer = this.actions[action];
				if(doer) {
					e.stopPropagation(); //Important::This is to prevent confusing the parent view's action tag listeners.
					app.preventDefaultE(e);
					doer.apply(this, [$el, e, lockTopic]); //use 'this' view object as scope when applying the action listeners.
				}else {
					if(passOn){
						return;
					}else {
						e.stopPropagation(); //Important::This is to prevent confusing the parent view's action tag listeners.
						app.preventDefaultE(e); //kill <a> with no href= but let go <a href=...>, <input>, <select> and <textarea> 
					}
					throw new Error('DEV::' + (debugViewNameTag || this._name) + '::_enableActionTags() You have not yet implemented this action - [' + action + ']');
				}
			};		
		},

		/**
		 * Activation tags (similar to actions but only for a limited group of mouse events)
		 *
		 * Note that it only fires the `activated` events on the view and adds `.active` or user specified classes (after :...) to the tag
		 * 
		 * Usage
		 * -----
		 * 1. add activate="group-name[:classes]" to your div/li/span/input or any tags;
		 * 2. use "*group-name[:classes]" for multi-activation otherwise it will be exclusive activation only (e.g only one element with .active class at a given time);
		 * 3. use deactivate="group-name" for auto reverse effect of the above; (only removes the classes on current tag)
		 *
		 * When it adds classes upon user io trigger, it also fires the `view:item-activated` event on the view;
		 * When it removes classes, it also fires the `view:item-deactivated` event (only for click/dblclick atm ...>.<...) on the view;
		 *
		 * Supported e
		 * -----------
		 * You can use activate-<trigger e>="..." and deactivate-<trigger e>="..." for other supported mouse triggers
		 *
		 * Symmetrical:
		 * 		click (default)
		 *   	dblclick
		 *
		 * Asymmetrical:
		 * 		mouseover/mouseout
		 *   	focusin/focusout
		 * 
		 */
		_enableActivationTags: function(){
			this.events = this.events || {};
			_.extend(this.events, {
				//------------default------------------------------
				'click [activate]': '_doActivation',
				'click [deactivate]': '_doDeactivation',

				//------------<any>--------------------------------
				'click [activate-click]': '_doActivation',
				'click [deactivate-click]': '_doDeactivation',
				'dblclick [activate-dblclick]': '_doActivation',
				'dblclick [deactivate-dblclick]': '_doDeactivation',
				//asymm
				'mouseover [activate-mouseover]': '_doActivation', //=enter but bubble
				'mouseout [deactivate-mouseout]': '_doDeactivation', //=leave but bubble
				'focusin [activate-focusin]': '_doActivation', //tabindex=seq or -1
				'focusout [deactivate-focusout]': '_doDeactivation', //tabindex=seq or -1
			});

			//Note: Need to use $el.data instead of $el._var for persisting marks and states on el.
			this._doActivation = function(e, silent){
				var $el = $(e.currentTarget);
				var activate = ($el.attr('activate-' + e.type) || $el.attr('activate')).split(':');
				var group = activate[0], classes = activate[1] || 'active';
				if($el.data('deactivation-' + group)) return; //skip already activated item

				//0. set $el._cancelDeactivation = true (single group single e.type) if it hasn't been;
				if(!$el.data('cancel-deactivation'))
					$el.data('cancel-deactivation', true);
				//1. if group didn't starts with *, go remove all other in-group $el's classes (within this view.$el);
				if(!_.string.startsWith(group, '*')){
					this.$el.find('[activate^=' + group + ']').removeClass(classes).removeData('deactivation-' + group);
					this.$el.find('[activate-' + e.type + '^=' + group + ']').removeClass(classes).removeData('deactivation-' + group);
				}
				//2. add classes to $el, mark the activated item;
				$el.addClass(classes);
				$el.data('deactivation-' + group, classes);
				//3. fire the view:item-activated event
				if(!silent)
					this.trigger('view:item-activated', $el, group, classes);

				//finally
				e.stopPropagation(); //Important::This is to prevent confusing the parent view's activation tag listener.
			};

			//Caveat: 'view:item-deactivated' only triggers on click and dblclick deactivations...(-?-)
			this._doDeactivation = function(e){
				var $el = $(e.currentTarget);
				var group = $el.attr('deactivate-' + e.type) || $el.attr('deactivate');
				if(!group) return; //abort

				//0. if $el._cancelDeactivation remove it and abort, this is for not deactivate right after activate with deactivate="true"; 
				if($el.data('cancel-deactivation')) {
					$el.removeData('cancel-deactivation')
					return;
				}

				//1. remove classes from $el;
				var classes = $el.data('deactivation-' + group);
				if(classes){
					$el.removeClass(classes);
					$el.removeData('deactivation-' + group);
					//1. fire the view:item-deactivated event
					this.trigger('view:item-deactivated', $el, group, classes);
				}
				
				//finally
				e.stopPropagation(); //Important::This is to prevent confusing the parent view's activation tag listener.
			};

			//+Manual api (for silent feedback calls - no 'view:item-activated' event fired by default)
			this.activate = function(group, matchFn /*or index or [attr=""] selector*/, loud){
				var $items, attr, events = ['', 'click', 'dblclick', 'mouseover', 'focusin']; //Refactor: Cache it!
				if(_.isNumber(matchFn)){
					var index = matchFn;
					matchFn = function(i){
						return i == index;
					};
				}
				//search for group (per event)
				for(var i in events){
					var e = events[i];
					attr = e ? 'activate-' + e : 'activate';
					$items = this.$el.find(app.debug('[' + attr + '^=' + group + ']'));
					if($items.length)
						return $items.filter(matchFn).trigger(e || 'click', !loud);
				}
			};
		},

		/**
		 * Overlay
		 * options:
		 * 1. anchor - css selector of parent html el
		 * 2. rest of the $.overlay plugin options without content and onClose
		 */
		_enableOverlay: function(){
			this._overlayConfig = _.isBoolean(this.overlay)? {}: this.overlay;
			this.overlay = function(anchor, options){
				var $anchor;
				if(_.isjQueryObject(anchor))
					$anchor = anchor;
				else if(_.isPlainObject(anchor)){
					options = anchor;
					anchor = options.anchor;
				}
				//'selector' or 'el'
				if(anchor)
					$anchor = $(anchor);
				else
					$anchor = $('body');
				options = options || {};

				var that = this;
				this.listenTo(this, 'close', function(){
					$anchor.overlay();//close the overlay if this.close() is called.
				});
				$anchor.overlay(_.extend(this._overlayConfig || {}, options, {
					content: function(){
						return that.render().$el;
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
		},

		/**
		 * Popover
		 * options:
		 * 1. anchor - css selector or el/$el
		 * 2. res of $.popover plugin options from bootstrap
		 */
	 	_enablePopover: function(){
	 		this._popoverConfig = _.isBoolean(this.popover)? {}: this.popover;
	 		this.popover = function(anchor, options){
	 			//default options
	 			var that = this,
	 				defaultOptions = {
		 				animation: false,
		 				html: true,
		 				content: this.render().$el,
		 				container: 'body',
		 				placement: 'auto right',//default placement is right
		 				//style: {..css..}
		 			},
		 			$anchor;
		 		//check para1(anchor point) is a jquery object or a DOM element
	 			if(_.isjQueryObject(anchor))
	 				//jquery object
	 				$anchor = anchor;
				else if(_.isPlainObject(anchor)){
					//none, check options.anchor
					options = anchor;
					anchor = options.anchor;
				}
	 			//'selector', 'el'
	 			if(anchor)
	 				$anchor = $(anchor);
	 			else{
	 				//wrong type of object
	 				throw new Error("RUNTIME::popover:: You must specify a anchor to use for this popover view...");
	 			}

	 			//check whether there is already a popover attach to the anchor
	 			//Caveat: animated popover might still be in the process of closing but invisible. (empty extra click)
	 			if($anchor.data('bs.popover')){
	 				var tempID = $anchor.data('bs.popover').$tip[0].id;
	 				//remove elements attached on anchor
	 				$anchor.popover('destroy');	
	 				//remove popover div
	 				$('#'+tempID).remove();
	 				//do NOT re-open it
	 				return;
	 			}
	 			//check whether user has data-content, if yes throw warning
	 			var dataOptions = $anchor.data() || {};
	 			if(dataOptions.content || dataOptions.html)
	 				console.warn('DEV::Popover::define data-content in the template will cause incorrect display for the popover view!');
	 			//merge user data with default option
	 			_.extend(defaultOptions, dataOptions);
	 			//merge options with default options
	 			options = options || {};
	 			options = _.extend(defaultOptions, this._popoverConfig, options);
	 			//check whether the placement has auto for better placement, if not add auto
	 			if(options.placement.indexOf('auto') < 0)
	 				options.placement = 'auto '+options.placement;
	 			//check whether user has given custom container
	 			if(options.container !== 'body'){
	 				console.warn('DEV::Popover::You have overwritten the container. It might cause incorrect in display.');
	 			}
	 			//check whether user has given the bond view
	 			if(!options.bond)
	 				console.warn('DEV::Popover::You have not provided a bond view. It might cause view close incorrectly');
	 			
	 			//bind view/bond-view close --> popover close
	 			_.each([this, options.bond], function(v){
	 				if(!v) return;
	 				this.listenTo(v, 'close', function(){
						if(this.isInDOM($anchor) && $anchor.data('bs.popover')){
							var tempID = $anchor.data('bs.popover').$tip[0].id;
							//remove elements on anchor
			 				$anchor.popover('destroy');
						}
		 				//remove popover div
		 				$('#'+tempID).remove();
					});
	 			}, this);
	 			
	 			//initialize the popover
	 			$anchor.popover(options)
	 			//add options.style (alias: css)
				.on('show.bs.popover', function(){
					that.$el.css(options.style || options.css || {});
				})
	 			//adjust the bottom placement, since it does not work well with auto
	 			.on('shown.bs.popover', function(){
					//auto + bottom does not work well, recheck on show event
					if(options.placement === 'auto bottom'){
						var $this = $(this),
							popId = $this.attr('aria-describedby'),
							$elem = $('#'+popId);
						//check whether already flipped
						if($elem[0].className.indexOf('top') > 0){
							var offset = $this.offset(),
								height = $this.height();
							//check necessity
							if(offset.top + height + $elem.height() < $window.height()){
								$anchor.data('bs.popover').options.placement = 'bottom';
								$anchor.popover('show');	
							}
						}
					}
					//that.trigger('show'); //Trigger 'show' doesn't invoke onShow, use triggerMethod the Marionette way!
					that.triggerMethod('show'); //trigger event while invoking on{Event};
				})
				//bind popover close --> view close
				.on('hidden.bs.popover', function(){
					//trigger view close method
					that.close();
				})
				.popover('toggle');
				//possible solution for repositioning the visible popover on window resize event (experimental)
 				/*$window.on("resize", function() {
				    $(".popover").each(function() {
				        var popover = $(this),
				        	ctrl = $(popover.context);
				        if (popover.is(":visible")) {
				            ctrl.popover('show');
				        }
				    });
				});*/
				return this;
	 		};
	 	}
	});

	//*init cycle, 3 patching stages: new()* -- render($el)* -- show(DOM)* --> ready(data)
	Backbone.Marionette.View.prototype.constructor = function(options){

		options = options || {};
		this._name = this.name || _.uniqueId('anonymous-view-');

		//----------------------deprecated config---------------------------
		if((this.type || options.type) && !this.forceViewType)
			console.warn('DEV::View+::type is deprecated, please do not specify in ' + this._name);
		//------------------------------------------------------------------

		//----------------------fixed view enhancements---------------------
		//auto-pick live init options
		_.extend(this, _.pick(options, ['effect', 'template', 'layout', 'data', 'useParentData', 'useFlatModel', 'coop', 'actions', 'dnd', 'selectable', 'editors', 'tooltips', 'popovers', 'svg', /*'canvas', */, 'poll', 'channels']));

		//add data-view-name meta attribute to view.$el and also view to view.$el.data('view')
		this.listenToOnce(this, 'render', function(){
			this.$el.attr('data-view-name', this._name);
			this.$el.data('view', this);
			if(this.name)
				this.$el.addClass(this.category.toLowerCase() + ' ' + _.string.slugify(this.category + '-' + this.name));
		});

		//add data-render-count meta attribute to view.$el
		this._renderCount = 0;
		this.listenTo(this, 'render', function(){
			this.$el.attr('data-render-count', ++this._renderCount);
			//**Caveat: data-attribute change will not change $.data(), it is one way and one time in jQuery.
			this.$el.data('render-count', this._renderCount);
		});

		//meta-event programming ability
		app.Util.addMetaEvent(this, 'view');

		//extend ui collection after first render (to support inline [ui=""] mark in template)
		//**Caveat: bindUIElements in item-view render() will not pick up changes made here. (we re-init [ui=]tags manually)
		this.listenTo(this, 'render', function(){
			var that = this;
			this.ui = this.ui || {};
			_.each(_.unique(this.$el.find('[ui]').map(function(){
				return $(this).attr('ui');
			})), function(key){
				that.ui[key] = that.$el.find('[ui=' + key + ']');
			});
		});

		//global co-op (global events forwarding through app), use false to ignore all global co-ops;
		if(this.coop !== false)
			this.coop = this.coop || [];
		//by default all view starts with 1 global co-op event;
		if(_.isArray(this.coop)) {
			this.coop.push('window-resized'); //every one should have this.(easy .svg canvas auto-resizing)
			this.coop = _.uniq(this.coop); //for possible double entry in the array.

			//register (Caveat: due to this._coop api recovery timing, we register coop listening even before view render)
			_.each(this.coop, this._enableGlobalCoopEvent, this);
		}
		//recover local (same-ancestor) collaboration (@deprecate soon > 1.10)
		this.coop = this._coop;

		//enable i18n
		if(I18N.locale) {
			this.listenTo(this, 'render', function(){
				this.$el.i18n({search: true});
			});
		}

		//---------------------optional view enhancements-------------------
		//dnd (drag, drop, and sortables) 
		if(this.dnd) {
			this.listenTo(this, 'render', function(){
				var that = this;
				if(this.dnd.sortables) delete this.dnd.drag;
				var dnd = this.dnd;
				//draggables
				if(dnd.drag){
					var defaultDragOpt = {
						zIndex: 100,
						//revert: true,
						helper: 'clone', //remember to keep size (done for you in default drag listener);
						items: '.ui-draggable-item', //+
						drag: function(e, ui){
							var $sample = that._cachedDraggableItem; //for better performance
							that.trigger('view:drag', $(ui.helper).width($sample.width()), ui, e);
						}
					};
					if(_.isString(dnd.drag))
						defaultDragOpt.items = dnd.drag;
					else
						_.extend(defaultDragOpt, dnd.drag);
					this._cachedDraggableItem = this.$el.find(defaultDragOpt.items).draggable(defaultDragOpt).first();
				}
				//droppable
				if(dnd.drop){
					var defaultDropOpt = {
						//container: '', //+
						zIndex: 50,
						activeClass: 'ui-droppable-active',
						hoverClass: 'ui-droppable-hover',
						accept: '.ui-draggable-item',
						drop: function(e, ui){
							that.trigger('view:drop', $(ui.draggable), ui, e);
						}
					};
					if(_.isString(dnd.drop))
						defaultDropOpt.accept = dnd.drop;
					else
						_.extend(defaultDropOpt, dnd.drop);
					var $ctDrop = (defaultDropOpt.container && this.$el.find(defaultDropOpt.container)) || this.$el;
					$ctDrop.droppable(defaultDropOpt);

					//provide a default onDrop to view
					if(!this.onDrop){
						this.onDrop = function($item, ui, e){
							$ctDrop.append($item.clone().removeClass(defaultDropOpt.accept.slice(1)).css('position', 'static'));
						};
					}
				}
				//sortable
				if(dnd.sort){
					var defaultSortOpt = {
						//container: '', //+
						placeholder: 'ui-sortable-placeholder', //remember to keep size in css (done for you in default sort listener)
						//revert: true,
						//helper: 'clone',
						items: '.ui-sortable-item',
						sort: function(e, ui){
							var $sample = that._cachedSortableItem;
							if(!$sample || !$sample.length)
								$sample = that._cachedSortableItem = that.$el.find(defaultSortOpt.items).first();
							$(ui.placeholder).height($sample.outerHeight()).css('border', '1px dashed grey');
							that.trigger('view:sort', $(ui.item), ui, e);
						},
						change: function(e, ui){
							that.trigger('view:sort-change', $(ui.item), ui, e);
						}
					};
					if(_.isString(dnd.sort))
						defaultSortOpt.items = dnd.sort;
					else
						_.extend(defaultSortOpt, dnd.sort);
					var $ctSort = (defaultSortOpt.container && this.$el.find(defaultSortOpt.container)) || this.$el;
					$ctSort.sortable(defaultSortOpt);
				}
			});
		}

		//selectable
		if(this.selectable){
			this.listenTo(this, 'render', function(){
				var that = this;
				var defaults = {
					filter: '.ui-selectable-item',
					selected: function(e, ui){
						that.trigger('view:item-selected', $(ui.selected), e);
					},
					unselected: function(e, ui){
						that.trigger('view:item-unselected', $(ui.unselected), e);
					},
					selecting: function(e, ui){ //.ui-selecting
						that.trigger('view:item-selecting', $(ui.selecting), e);
					},
					unselecting: function(e, ui){
						that.trigger('view:item-unselecting', $(ui.unselecting), e);
					},
					stop: function(e){ //.ui-selected
						that.trigger('view:selection-done', that.$el.find('.ui-selected'));
					},
					start: function(e){
						that.trigger('view:selection-begin');
					}
				};
				if(_.isString(this.selectable))
					defaults.filter = this.selectable;
				else
					_.extend(defaults, this.selectable);
				this.$el.selectable(defaults);
			});
		}

		//de/activations
		this._enableActivationTags();

		//actions - 1 (bubble events that can be delegated)
		if(this.actions) {
			this._enableActionTags(this.actions._bubble);
			//actions - 2 (non bubbling events)
			this.listenTo(this, 'render', function(){
				this._enableSpecialActionTags();
			});
		}

		//twitter bootstrap tooltips (default on)
		if(this.tooltips !== false) {
			this._enableBootstrapJS('tooltip', this.tooltips);
		}

		//twitter bootstrap popovers (default on)
		if(this.popovers !== false) {
			this._enableBootstrapJS('popover', this.popovers);
		}

		//overlay (use this view as overlay)
		//unconditional 1.9.2+
		this._enableOverlay();

		//popover (use this view as popover)
		//unconditional 1.9.2+
		this._enablePopover();

		//editors
		if(this.editors && this._activateEditors) this.listenTo(this, 'render', function(){
			this._activateEditors(this.editors);
		});

		//svg
		//similar to sub-region re-show/ready upon data change, we need to re-create the .paper object
		if(this.svg && this._enableSVG) {
			this.listenTo(this, 'render', function(){
				//draw functions given
				if(_.isPlainObject(this.svg)){
					var that = this;
					this.$el.find('[svg]').map(function(){
						var $svg = $(this), name = $svg.attr('svg');
						var paper = that._enableSVG($svg, name);
					});
					if(!this._svgPaperResizeBound){
						//hook up the draw() function (_.defer-ed so you have a chance to call $.css upon view 'ready')
						this.listenTo(this, 'ready view:window-resized', function(){
							_.each(this.paper, function(paper, name){
								//note that _.defer() does NOT return the function.
								var that = this;
								_.defer(function(){
									paper.clear();
									that.svg[name] && that.svg[name].call(that, paper); 
									//so this.get() still accesses view data in draw() fn.
								});
							}, this);
						});
						this._svgPaperResizeBound = true;

						//Note: since all view starts with 'window-resized' in its .coop [] array, 
						//svg="" tagged canvas are always auto adjusted upon window resizing.
					}
				}
				//no draw function (single canvas this.paper, manual ready and coop window-resized hook up)
				else
					this._enableSVG(_.isBoolean(this.svg)? '' : this.svg /*selector str*/);

			});
		}

		//data pollings
		//true, 'every 5 sec [| onFooBar/coop e]', 250, '250 [|onFooBar/coop e]' fn, or {'url1': 'occurance[|coop e or fn name]'/fn, ...}
		//Caveat: there is no 'every 0.5 sec'.
		if(this.poll){
			this.listenToOnce(this, 'ready', function(){
				if(!_.isPlainObject(this.poll) && _.isString(this.data)){
					var tmp = this.poll;
					this.poll = {};
					this.poll[this.data] = _.isBoolean(tmp)? app.config.dataPollingDelay : tmp;
				}
				_.each(this.poll, function(occurrenceAndEoMorF, url){
					var occurrence, eomorf;
					if(_.isString(occurrenceAndEoMorF)){
						var tmp = occurrenceAndEoMorF.split('|');
						occurrence = _.string.trim(tmp[0]);
						eomorf = _.string.trim(tmp[1]); //eom
					} else {
						if(_.isFunction(occurrenceAndEoMorF)){
							occurrence = app.config.dataPollingDelay;
							eomorf = occurrenceAndEoMorF; //f
						} else {
							occurrence = occurrenceAndEoMorF;//occur only
						}
					}

					if(_.isFunction(eomorf)) //f
						eomorf = _.bind(eomorf, this);
					else if (eomorf && _.isFunction(this[eomorf])) //m
						eomorf = _.bind(this[eomorf], this);
					else if (eomorf) //e
						this._enableGlobalCoopEvent('poll-data-' + eomorf);
					else //occur only, then use default f, which sets view's model data.
						eomorf = _.bind(function(data, card){
							this.set(data);
						}, this);

					app.poll(url, occurrence, eomorf);
				}, this);
			});

			this.listenTo(this, 'close', function(){
				_.each(this.poll, function(occurrenceAndEoMoF, url){
					app.poll(url, false);
				}, this);
			});
		}

		//websocket channels
		//{'channel': true/m/fn(data, channel)/{websocket: 'path', callback: m/fn(data, channel)}, ...}
		if(this.channels){
			//if you say 'channel': true, we hook you with the default op here,
			var defaultOp = function(data){
				this.set(data);
			};
			this.listenToOnce(this, 'ready', function(){
				_.each(this.channels, function(optOrF, channelName){
					var meta = optOrF;
					if(_.isFunction(meta))
						meta = {callback: meta};
					else if (_.isString(meta))
						meta = {callback: this[meta] || defaultOp};
					else if (_.isPlainObject(meta)){ //<---very important { here
						if(_.isString(meta.callback))
							meta.callback = this[meta.callback] || defaultOp;
					} //<---very important } here
					else
						meta = {callback: defaultOp};

					app.ws(meta.websocket).done(_.bind(function(websocket){
						this._enableGlobalCoopEvent('ws-data-' + channelName, function(data, wschannel){
							meta.callback.apply(this, arguments);
						});
						this.trigger('view:channel-hooked', websocket.channel(channelName));
					}, this));

				}, this);
			});
		}

		//--------------------+ready event---------------------------		
		//ensure a ready event for static views (align with data and form views)
		//Caveat: re-render a static view will not trigger 'ready' again...
		this.listenToOnce(this, 'show', function(){
			//call view `ready` (if not waiting for data render after 1st `show`, static and local data view only)
			if(!this.data && !this.useParentData){
				//a view should always have a parentRegion (since shown by a region), but we do not enforce it when firing 'ready'.
				//e.g manual view life-cycling (very rare)
				_.defer(_.bind(function(){
					this.triggerMethodInversed('ready');
				}, this));//fake as ajax-ed data view;
			}
		});

		//data / useParentData ({}, [] or url for GET only)
		this.listenToOnce(this, 'show', function() {
		    //supports getting parent data from useParentData.
		    if (this.parentCt && this.useParentData) {
		        var tmp = this.parentCt.get(this.useParentData);
		        //wrap non-object data into an object with same key indicated by .useParentData.
		        if (!_.isUndefined(tmp) && !_.isPlainObject(tmp)) {
		            var tmpwrap = {};
		            tmpwrap[this.useParentData] = tmp;
		            tmp = tmpwrap;
		        }
		        this.data = tmp;
		    }
		    if (this.data){
		        this.set(this.data);
		    }
		});

		return Backbone.Marionette.View.apply(this, arguments);
	};


})(Application);