/**
 * Marionette.ItemView Enhancements (can be used in Layout as well) - Note that you can NOT use these in a CompositeView.
 *
 * 0. actions
 * 1. svg (view:fit-paper, view:paper-resized, view:paper-ready)
 * 2. basic Editors (view as form piece)
 * 3. tooltips
 * 4. overlay
 * 5. data event listener (view:render-data, view:data-rendered)
 *
 * @author Tim Lauv
 * @created 2014.02.26
 * @updated 2015.08.03
 */

;(function(app){

	//Original M.ItemView render, close (as a Reference here, to be overriden later)
	_.extend(Backbone.Marionette.ItemView.prototype, {

		// Override the default close event to add a few
		// more events that are triggered.
		close: function(_cb) {
		    if (this.isClosed) {
		    	_cb && _cb();
		        return;
		    }

		    this.triggerMethod('item:before:close');
		    Marionette.View.prototype.close.apply(this, arguments);
		    this.triggerMethod('item:closed');
		    _cb && _cb();
		}

	});

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
				'mouseenter [action-mouseenter]': '_doAction', //per tag, no bubble even with passOn: true
				'mouseleave [action-mouseleave]': '_doAction', //per tag, no bubble even with passOn: true
				'mouseover [action-mouseover]': '_doAction', //=enter but bubble
				'mouseout [action-mouseout]': '_doAction', //=leave but bubble

				//note that 'hover' is not a valid event.

				'keydown [action-keydown]': '_doAction',
				'keyup [action-keyup]': '_doAction',
				//'keypress [action-keypress]': '_doAction', //use keydown instead (non-printing keys and focus-able diff)

				//'focus [action-focus]': '_doAction', //use focusin instead (no bubble even with passOn: true in IE)
				'focusin [action-focusin]': '_doAction', //tabindex=seq or -1
				'focusout [action-focusout]': '_doAction', //tabindex=seq or -1
				//'blur [action-blur]': '_doAction', //use focusin instead (no bubble even with passOn: true in IE, FF)

				//------------<input>, <select>, <textarea>--------
				'change [action-change]': '_doAction',
				'select [action-select]': '_doAction', //text selection only <input>, <textarea>
				'submit [action-submit]': '_doAction', //<input type="submit">, <input type="image"> or <button type="submit">

				//------------<div>, <any.overflow>----------------
				'scroll [action-scroll]': '_doAction',

				//------------<script>, <img>, <iframe>------------
				'error [action-error]': '_doAction',
				'load [action-load]': '_doAction'

				//window events:
				//load [use $(ready-fn) instead], unload, resize, scroll

			});
			this.actions = this.actions || {}; 	
			uiName = uiName || this.name || '_UNKNOWN_.View';

			//captured events will not bubble (due to e.stopPropagation)
			this._doAction = function(e){

				//**Caveat: non-bubble event will not change e.currentTarget to be current el (the one has [action-*])
				var $el = $(e.currentTarget);
				var action = $el.attr('action') || $el.attr('action-' + e.type) || ('_NON-BUBBLE_' + e.type);
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

				//Special: only triggering a meta event (e.g action-dblclick=view:method-name) without doing anything.
				var eventForwarding = String(action).split(':');
				if(eventForwarding.length >= 2) {
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
	 * 		getVal: ...,
	 * 		setVal: ...,
	 * 		validate: ...,
	 * 		status: ...,
	 * 		[editors: ...,]
	 * 		[disable: ...,]
	 * 		[isEnabled: ...,]
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
					
					//Tempo Fix: remove type so it won't confuse View init with Item/Collection/CompositeView types.
					if(Editor !== app.Core.Editor.map.Basic)
						delete config.type;
					////////////////////////////////////////////////////////////////////////////////////////////////

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

			//0. getEditor(name)
			this.getEditor = function(name){
				return this._editors[name];
			};

			//1. getValues (O(n) - n is the total number of editors on this form)
			this.getValues = function(){
				var vals = {};
				_.each(this._editors, function(editor, name){
					var v = editor.getVal();
					if(v !== undefined && v !== null) vals[name] = v;
				});
				//Warning: Possible performance impact...
				return app.model(vals).toJSON(); //construct a deep model for editor 'a.b.c' getVal();
				/////////////////////////////////////////
			};

			//2. setValues (O(n) - n is the total number of editors on this form)
			this.setValues = function(vals, loud){
				if(!vals) return;
				_.each(this._editors, function(editor, name){
					var v = vals[name] || app.extract(name, vals);
					if(v !== null && v !== undefined){
						editor.setVal(v, loud);
					}
				});
			};

			//3. validate
			this.validate = function(show){
				var errors = {};

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
	 * Popover
	 */
	 _.extend(Backbone.Marionette.ItemView.prototype, {

	 	enablePopover: function(){

	 		this.popover = function(anchor, options){
	 			//default options
	 			var that = this,
	 				defaultOptions = {
		 				animation: false,
		 				html: true,
		 				content: this.render().$el,
		 				container: 'body',
		 				placement: 'auto right',//default placement is right
		 			},
		 			$anchor;
		 		//check para1(anchor point) is a jquery object or a DOM element
	 			if( anchor.jquery ){
	 				//jquery object
	 				$anchor = anchor;
	 			}else if( anchor.nodeType ){
	 				//DOM object
	 				$anchor = $(anchor);
	 			}else{
	 				//wrong type of object
	 				throw new Error("RUNTIME::popover:: the type of anchor argument is incorrent. It can only be a DOM element or a jQuery object.");
	 			}
	 			//check whether there is already a popover attach to the anchor
	 			if( $anchor.data('bs.popover') ){
	 				var tempID = $anchor.data('bs.popover').$tip[0].id;
	 				//remove elements attached on anchor
	 				$anchor.popover('destroy');	
	 				//remove popover div
	 				$('#'+tempID).remove();
	 			}
	 			//check whether user has data-content, if yes throw warning
	 			var dataOptions = $anchor.data() || {};
	 			if(dataOptions.content || dataOptions.html)
	 				console.warn('DEV::Popover::define data-content in the template will cause incorrect display for the popover view!');
	 			//merge user data with default option
	 			_.extend(defaultOptions, dataOptions);
	 			//merge options with default options
	 			options = options || {};
	 			options = _.extend(defaultOptions, options);
	 			//check whether the placement has auto for better placement, if not add auto
	 			if(options.placement.indexOf('auto') < 0)
	 				options.placement = 'auto '+options.placement;
	 			//check whether the content has been overwritten by the options
	 			if( options.content !== this.render().$el )
	 				console.warn('DEV::Popover::You have overwritten the content in your options, make sure that is what you intend to do!');
	 			//check whether user has given custom container
	 			if( options.container !== 'body' ){
	 				console.warn('DEV::Popover::You have overwritten the container. It might cause incorrect in display.');
	 			}
	 			//check whether user has given the bond view
	 			if( !options.bond )
	 				console.warn('DEV::Popover::You have not provided a bond view. It might cause view close incorrectly');
	 			else{
	 				this.listenTo(options.bond, 'close', function(){
						if( $anchor.data('bs.popover') ){
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
	 			//adjust the bottom placement, since it does not work well with auto
	 			.on('shown.bs.popover', function(){
					//auto + bottom does not work well, recheck on show event
					if( options.placement === 'auto bottom'){
						var $this = $(this),
							popId = $this.attr('aria-describedby'),
							$elem = $('#'+popId);
						//check whether already flipped
						if( $elem[0].className.indexOf('top') > 0 ){
							var offset = $this.offset(),
								height = $this.height();
							//check necessity
							if( offset.top + height + $elem.height() < $window.height() ){
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
				//possible solution for repositioning the visible popovers on window resize event
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

	/**
	 * Data handling enhancements.
	 * 1. View as normal tpl + data
	 * 2. view as form with editors (tpl = layout, data = values)
	 */
	_.extend(Backbone.Marionette.ItemView.prototype, {

		//Editors don't render according to the underlying backbone model.
		_renderTplOrResetEditors: function(){
			if(this._editors){
				this.setValues(this.model.toJSON());
				//note that as a form view, updating data does NOT refresh sub-regional views...
				this.trigger('view:editors-updated');
			}
			else {
				this.render();
				//note that this will re-render the sub-regional views.
				this.trigger('view:data-rendered');
			}
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
				if(arguments.length) {
					var editor = this.getEditor.apply(this, arguments);
					if(editor)
						return editor.getVal();
					return;
				}
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
		refresh: function(options){
			if(!this.data) return console.warn('DEV::ItemView+::refresh() You must set view.data to use this method.');
			
			this.model && this.model.clear({silent: true});
			if(_.isString(this.data)){
				var self = this;
				return app.remote(this.data, null, options).done(function(d){
					self.set(d);
				});
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