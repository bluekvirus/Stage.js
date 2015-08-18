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
					throw new Error('DEV::' + (uiName || 'UI Component') + '::You have not yet implemented this action - [' + action + ']');
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
	 * Meta-event Listeners (pre-defined)
	 * view:render-data
	 */
	_.extend(Backbone.Marionette.ItemView.prototype, {

		set: function(){
			if(!this.model){
				this.model = new Backbone.Model();
			}

			if(!this._oneWayBinded){
				this.listenTo(this.model, 'change', this.render);
				this._oneWayBinded = true;			
			}

			return this.model.set.apply(this.model, arguments);
		},

		get: function(){
			if(!this.model) throw new Error('DEV::ItemView:: You have not yet setup data in this view');
			
			if(arguments.length)
				return this.model.get.apply(this.model, arguments);
			return this.model.toJSON();
		},

		refresh: function(){
			if(!_.isString(this.data)) {
				console.log('DEV::ItemView::refresh Define a url data configure or override this method...');
				return;
			}

			var self = this;
			app.remote(this.data).done(function(d){
				self.trigger('view:render-data', d);
			}).fail(app.ajaxFailed);
		},

		onRenderData: function(data){
			if(_.isArray(data))
				this.set('items', data); //conform to original Backbone/Marionette settings
			else
				this.set(data);

			this.trigger('view:data-rendered');
		}
	});

})(Application);