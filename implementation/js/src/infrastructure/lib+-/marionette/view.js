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
 * 		|+fixed enhancements, +ui recognition,
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
 * View render() implementation is in item-view.js:render()! This in turn will be triggered by model:change in Marionette v1.8
 *
 * ---------------
 *
 * View life-cycle:
 * ---------------
 * new View(cfg) --> render()* +$el with template, events and enhancements --> show()* +DOM, svg and data --> ready() re-rendered with data.
 * 
 * Fixed enhancement:
 * ---------------
 * +pick additional live options
 * +rewire get/set to getVal/setVal for Editor view.
 * +auto ui tags detection and register
 * +meta event programming (view:* (event-name) - on* (camelized))
 * +coop e support
 * +useParentData support
 * +view name to $el metadata
 * (see ItemView for the rest of optional abilities, e.g template, data, actions, editors, tooltips, overlay, popover, ...)
 *
 * List of view options passed through new View(opt) that will be auto-merged as properties:
 * 		a. from Backbone.View ['model', 'collection', 'el', 'id', 'attributes', 'className', 'tagName', 'events'];
 * 		b*. from M.View ['templateHelpers']; (through M.getOption() -- tried both this and this.options)
 *   	c. from us ['effect', 'template', 'layout', 'data'/'useParentData', 'ui', 'coop', 'actions', 'editors', 'tooltips', 'overlay', 'popover', 'svg'];
 *
 * Tip:
 * All new View(opt) will have this.options = opt ready in initialize(), also this.*[all auto-picked properties above].
 * 
 * Note: that 'svg' is deprecated and will be changed in the future.
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
 */


;(function(app){

	//+api
	_.extend(Backbone.Marionette.View.prototype, {
		//expose isInDOM method (hidden in marionette.domRefresh.js)
		isInDOM: function(){
			if(!this.$el) return undefined;
			return $.contains(document.documentElement, this.$el[0]);
		},

		//override to give default empty template
		getTemplate: function(){
			return Marionette.getOption(this, 'template') || (
				(Marionette.getOption(this, 'editors') || Marionette.getOption(this, 'svg') || Marionette.getOption(this, 'layout'))? ' ' /*must have 1+ space*/ : '<div class="wrapper-full bg-warning"><p class="h3" style="margin:0;"><span class="label label-default" style="display:inline-block;">No Template</span> ' + this.name + '</p></div>'
			);
		},

		//local collaboration under the same parentCt (Trick: use this.coop() instead of this._coop())
		_coop: function(){
			var pCt = this.parentCt, listener = app.Util.metaEventToListenerName(arguments[0]);
			while (pCt && !pCt[listener]) pCt = pCt.parentCt;
			if(pCt) pCt[listener].apply(pCt, _.toArray(arguments).slice(1));
		},

		//activate tooltips (bootstrap version)
		_enableTooltips: function(options){
			this.listenTo(this, 'render', function(){
				//will activate tooltip with specific options object - see /libs/bower_components/bootstrap[x]/docs/javascript.html#tooltips
				this.$('[data-toggle="tooltip"]').tooltip(options);
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
		 * 1. uiName - [_UNKNOWN_.View] this is optional, mainly for better debugging msg;
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
		 * B. We only do e.stopPropagation for you, if you need e.preventDefault(), do it yourself in the action impl;
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
		_enableActionTags: function(uiName, passOn){ //the uiName is just there to output meaningful dev msg if some actions haven't been implemented.

			if(_.isBoolean(uiName)){
				passOn = uiName;
				uiName = '';
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
			uiName = uiName || this.name || '_UNKNOWN_.View';

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
					e.preventDefault();
					app.trigger('app:locked', action, lockTopic);
					return;
				}

				if($el.hasClass('disabled') || $el.parent().hasClass('disabled')) {
					e.stopPropagation();
					e.preventDefault();					
					return;
				}

				//Special: only triggering a meta event (e.g action-dblclick=view:method-name) without doing anything.
				var eventForwarding = String(action).split(':');
				if(eventForwarding.length >= 2) {
					while(eventForwarding.length > 2)
						eventForwarding.shift();
					e.stopPropagation(); //Important::This is to prevent confusing the parent view's action tag listeners.
					return this.trigger(eventForwarding.join(':'));
				}

				//Normal: call the action fn
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
					throw new Error('DEV::' + (uiName || 'UI Component') + '::_enableActionTags() You have not yet implemented this action - [' + action + ']');
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
				if(anchor instanceof jQuery)
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
	 			if(anchor instanceof jQuery)
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
	 			else{
	 				this.listenTo(options.bond, 'close', function(){
						if($anchor.data('bs.popover')){
							var tempID = $anchor.data('bs.popover').$tip[0].id;
							//remove elements on anchor
			 				$anchor.popover('destroy');
			 				//remove popover div
			 				$('#'+tempID).remove();	
						}
					});
	 			}
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
				.on('hidden.bs.popover', function(){
					//trigger view close method
					that.close();
				})
				.popover('toggle');
				//possible solution for repositioning the visible popovers on window resize event (experimental)
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

		//----------------------deprecated config---------------------------
		if((this.type || options.type) && !this.forceViewType)
			console.warn('DEV::View+::type is deprecated, please do not specify ' + (this.name?'in ' + this.name:''));
		//------------------------------------------------------------------

		//----------------------fixed view enhancements---------------------
		//auto-pick live init options
		_.extend(this, _.pick(options, ['effect', 'template', 'layout', 'data', 'useParentData', 'ui', 'coop', 'actions', 'dnd', 'selectable', 'editors', 'tooltips', 'overlay', 'popover', 'svg', /*'canvas'*/]));

		//re-wire this.get()/set() to this.getVal()/setVal(), data model in editors is used as configure object.
		if(this.category === 'Editor'){
			this.get = this.getVal;
			this.set = this.setVal;
		}

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

		//add data-view-name meta attribute to view.$el and also view to view.$el.data('view')
		this.listenToOnce(this, 'render', function(){
			this.$el.attr('data-view-name', this.name || _.uniqueId('anonymous-view-'));
			this.$el.data('view', this);
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
		//recover local (same-ancestor) collaboration
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

		//tooltip
		if(this.tooltips) {
			this._enableTooltips(this.tooltips);
		}

		//overlay (use this view as overlay)
		//unconditional 1.9.2+
		this._enableOverlay();

		//popover (use this view as popover)
		//unconditional 1.9.2+
		this._enablePopover();

		//editors -- doesn't re-activate upon re-render (usually used with non-data bound template or no template)
		if(this.editors && this._activateEditors) this.listenToOnce(this, 'render', function(){
			this._activateEditors(this.editors);
		});

		//svg (if rapheal.js is present) -- doesn't re-activate upon re-render (usually used with no template)
		if(this.svg && this._enableSVG) {
			this.listenToOnce(this, 'show', this._enableSVG);
		}

		//--------------------+ready event---------------------------		
		//ensure a ready event for static views (align with data and form views)
		//Caveat: re-render a static view will not trigger 'view:ready' again...
		this.listenTo(this, 'show', function(){
			//call view:ready (if not waiting for data render after 1st `show`)
			if(!this.data && !this.useParentData)
			    this.trigger('view:ready');
			    //note that form view will not re-render on .set(data) so there should be no 2x view:ready triggered.
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
		    if (this.data)
		        this.set(this.data);
		});

		return Backbone.Marionette.View.apply(this, arguments);
	};


})(Application);