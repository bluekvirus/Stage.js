/**
 * Here we extend the html tag attributes to be auto-recognized by a Marionette.View.
 * This simplifies the view creation by indicating added functionality through template string. (like angular.js?)
 *
 * 1. action tags auto listener hookup with mutex-locking on other action listeners.
 * 2. basic form editors (editor, fieldset, piece, whole and tooltip/pop-over activation) (ui tag detection?)
 * 3. svg paper
 * 4. flyTo
 *
 * @author Tim.Liu
 * @create 2014.02.25 
 */


;(function(app){
/**
 * Action Tag listener hookups +actions{}
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
			this.enableUILocks();

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
			this._uiDEVName = uiName || 'UNKNOWN.View';

			this._doAction = function(e){
				if(this.isUILocked()) {
					e.stopPropagation();
					e.preventDefault();
					return; //check on the general lock first (not per-region locks)
				}
				var $el = $(e.currentTarget);
				var action = $el.attr('action') || 'UNKNOWN';

				//allow triggering certain event only.
				var eventForwarding = action.split(':');
				if(eventForwarding.length >= 2) {
					eventForwarding.shift();
					e.stopPropagation(); //Important::This is to prevent confusing the parent view's action tag listeners.
					return this.trigger(eventForwarding.join(':'));
				}

				var doer = this.actions[action];
				if(doer) {
					e.stopPropagation(); //Important::This is to prevent confusing the parent view's action tag listeners.
					doer.apply(this, [$el, e]); //use 'this' view object as scope when applying the action listeners.
				}else {
					if(passOn){
						return;
					}else {
						e.stopPropagation(); //Important::This is to prevent confusing the parent view's action tag listeners.
					}
					throw new Error('DEV::' + (this._uiDEVName || 'UI Component') + '::You have not yet implemented this action - [' + action + ']');
				}
			};		
		},

			
	});


	/**
	* UI Locks support
	* Add a _uilocks map for each of the UI view on screen, for managing UI action locks for its regions
	* Also it will add in a _all region for locking the whole UI
	* Usage: 
	* 		1. lockUI/unlockUI([region], [caller])
	* 		2. isUILocked([region])
	*/
	_.extend(Backbone.Marionette.View.prototype, {
		//only for layouts
		enableUILocks: function(){
			//collect valid regions besides _all
			this._uilocks = _.reduce(this.regions, function(memo, val, key, list){
				memo[key] = false;
				return memo;
			}, {_all: false});

			//region, caller are optional
			this.lockUI = function(region, caller){
				region = this._checkRegion(region);

				caller = caller || '_default_';
				if(!this._uilocks[region]){ //not locked, lock it with caller signature!
					this._uilocks[region] = caller;
					return true;
				}
				if(this._uilocks[region] === caller) //locked by caller already, bypass.
					return true;
				//else throw error...since it is already locked, by something else tho...
				throw new Error('DEV::View UI Locks::This region ' + region + ' is already locked by ' + this._uilocks[region]);
			};

			//region, caller are optional
			this.unlockUI = function(region, caller){
				region = this._checkRegion(region);

				caller = caller || '_default_';
				if(!this._uilocks[region]) return true; //not locked, bypass.
				if(this._uilocks[region] === caller){ //locked by caller, release it.
					this._uilocks[region] = false;
					return true;
				}
				//else throw error...
				throw new Error('DEV::View UI Locks::This region ' + region + ' is locked by ' + this._uilocks[region] + ', you can NOT unlock it with ' + caller);
			};

			this.isUILocked = function(region){
				region = this._checkRegion(region);

				return this._uilocks[region];
			};

			//=====Internal Workers=====
			this._checkRegion = function(region){
				if(!this._uilocks) throw new Error('DEV::View::You need to enableUILocks() before you can use this...');

				if(!region)
					region = '_all';
				else
					if(!this.regions || !this.regions[region])
						throw new Error('DEV::View UI Locks::This region does NOT exist - ' + region);
				return region;
			};
			//=====Internal Workers=====		
		}				

	});


	/**
	 * Inject a svg canvas within view. - note that 'this' in cb means paper.
	 * Do this in onShow() instead of initialize.
	 */
	_.extend(Backbone.Marionette.View.prototype, {
		enableSVGCanvas: function(cb){
			if(!Raphael) throw new Error('DEV::View::You did NOT have Raphael.js included in the libs.');
			if(cb){
				var that = this;
				Raphael(this.el, this.$el.width(), this.$el.height(), function(){
					that.paper = this;
					cb.apply(this, arguments);
				});
			}else {
				this.paper = Raphael(this.el, this.$el.width(), this.$el.height());
			}
			//resize paper upon window resize event.
			this.listenTo(app, 'view:resized', function(e){
				this.paper.setSize(this.$el.width(), this.$el.height());
			});
		}
	});

	/**
	 * Editor Activation - do it in onShow() or onRender()
	 * Turn tags in the template into real editors.
	 * You can activate editors in any view object, it doesn't have to be a enableForm() instrumented view.
	 * You can also send a view with activated editors to a form by using addFormPart()[in onShow() or onRender()] after enableForm()
	 *
	 * options
	 * -------
	 * appendTo: [selector] - general appendTo cfg
	 * triggerOnShow: true|false[default],
	 * editors: {
	 * 	name: {
	 * 		type: ..., (*required)
	 * 		label: ...,
	 * 		help: ...,
	 * 		tooltip: ...,
	 * 		placeholder: ...,
	 * 		options: ...,
	 * 		validate: ...,
	 * 		fieldname: ..., optional for collecting values through $.serializeForm()
	 * 		... (see specific editor options in core/parts/editors)
	 * 		
	 * 		appendTo: ... - per editor appendTo cfg
	 * 	},
	 * 	...,
	 * }
	 *
	 * This will add *this.editors* to the view object. Do NOT use a region name with region='editors'...
	 * 
	 * Add new: You can repeatedly invoke this method to add new editors to the view.
	 * Remove current: You can find the editor by name and use editor.close to remove it.
	 *
	 * optionally you can implement setValues()/getValues()/validate() in your view, and that will get invoked by the outter form view if there is one.
	 * 
	 */

	_.extend(Backbone.Marionette.View.prototype, {

		activateEditors: function(options){
			this.editors = this.editors || {};
			if(this.editors.attachView) throw new Error('DEV::View::activateEditors enhancements will need this.editors object, it is now a Region!');

			_.each(options.editors, function(editorCfg, name){
				//1. instantiate
				editorCfg.type = editorCfg.type || 'text'; 
				try{
					var editorDef = Application.Editor.get(editorCfg.type);
				}catch(e){
					var editorDef = Application.Editor.get('Basic');
				}
				var editor = new editorDef(_.extend(editorCfg, {name: name, parentCt: this}));
				this.editors[name] = editor.render();
				//2. add it into view (specific, appendTo(editor cfg), appendTo(general cfg), append)
				var $position = this.$('[editor="' + name + '"]');
				if($position.length === 0 && editorCfg.appendTo)
					$position = this.$(editorCfg.appendTo);
				if($position.length === 0 && options.appendTo)
					$position = this.$(options.appendTo);
				if($position.length === 0)
					$position = this.$el;
				$position.append(editor.el);
				if(options.triggerOnShow) editor.trigger('show');
			}, this);

			this.listenTo(this, 'before:close', function(){
				_.each(this.editors, function(editorview){
					editorview.close();
				});
			});
		}

	});


	/**
	 * Enable Form - do it in initialize(); (though addformPart should be in onShow or onRender)
	 * Note that a form part will not be registered with a name, so do NOT try to co-op between form parts.
	 * This will turn a view into a form by giving it the following methods:
	 * required:
	 * 0. addFormPart(view, [{region: '' or appendTo: '' + cb: ''}]) * add an isolated form piece (an activateEditors instrumented view) into a region or tag selector or append to this.$el; 
	 * 1. getValues() * - default implementation will be to collect values by this.editors{} and merge with this.parts[]'s editors (the form parts will also have a chance to override getValues)
	 * 2. setValues(vals) * - default implementation will be to set values by this.editors{} and this.parts[]'s editors (the form parts will have a chance to override setValues)
	 * 3. validate(show) * - default implementation will be to validate by this.editors{} and this.parts[]'s editors (can be voerriden by the form part view)
	 * Note that after validation(show:true) got errors, those editors will become eagerly validated, it will turn off as soon as the user has input-ed the correct value.
	 * 
	 * optional: button action implementations, you still have to code your button's html into the template.
	 * 4. submit
	 * 5. reset
	 * 6. refresh
	 * 7. cancel
	 *
	 * No setVal getVal
	 * ----------------
	 * This is because we don't permit co-op between form parts, so there is no short-cut for getting/setting single editor/field value.
	 *
	 * Pass in activateEditors options
	 * -------------------------------
	 * You can mix enableForm's options with activateEditors' options, so the view will be rendered with a starting set of editors and the ability to add more as form parts.
	 */

	_.extend(Backbone.Marionette.View.prototype, {

		enableForm: function(options){
			options = options || {};
			//this.tagName = 'form'; - this has no effect, do it in init.options.
			this.template = options.template || this.template || '#_blank';
			//0. addFormPart
			this.parts = this.parts || options.parts || [];
			this.listenTo(this, 'render', function(){
				this.activateEditors(options);
			});
			this.addFormPart = function(view, opt){
				this.parts.push(view);
				opt = opt || {};
				if(opt.region) this[opt.region].show(view);
				else {
					var $position = opt.appendTo && this.$(opt.appendTo);
					if(!$position || $position.length === 0) $position = this.$el;
					$position.append(view.render().el);
					opt.cb && opt.cb(view);
				}
			};
			//a little clean-up setups
			this.listenTo(this, 'before:close', function(){
				_.each(this.parts, function(partview){
					partview.close();
				});
			});

			//1. getValues (O(n) - n is the total number of editors on this form)
			this.getValues = function(){
				var vals = {};
				_.each(this.editors, function(editor, name){
					vals[name] = editor.getVal();
				});
				_.each(this.parts, function(part){
					if(part.getValues)
						_.extend(vals, part.getValues());
					else {
						_.each(part.editors, function(editor, name){
							vals[name] = editor.getVal();
						});
					}
				});
				return vals;
			};

			//2. setValues (O(n) - n is the total number of editors on this form)
			this.setValues = function(vals, loud){
				_.each(this.editors, function(editor, name){
					if(vals[name])
						editor.setVal(vals[name], loud);
				});
				_.each(this.parts, function(part){
					if(part.setValues)
						part.setValues(vals, loud);
					else {
						_.each(part.editors, function(editor, name){
							if(vals[name])
								editor.setVal(vals[name], loud);
						});
					}
				});
			}

			//3. validate
			this.validate = function(show){
				var errors = {};
				_.each(this.editors, function(editor, name){
					var e = editor.validate(show);
					if(e) errors[name] = e;
				});
				_.each(this.parts, function(part){
					if(part.validate) _.extend(errors, part.validate(show));
					else {
						_.each(part.editors, function(editor, name){
							var e = editor.validate(show);
							if(e) errors[name] = e;
						});
					}
				});
				if(_.size(errors) === 0) return;
				return errors; 
			}
			
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

	_.extend(Backbone.Marionette.View.prototype, {

		enableTooltips: function(options){
			this.listenTo(this, 'render', function(){
				//will activate tooltip with specific options object - see /libs/bower_components/bootstrap[x]/docs/javascript.html#tooltips
				this.$('[data-toggle="tooltip"]').tooltip(options);
			});
		}

	});

	/**
	 * Enable FlyTo (do it in initialize())
	 *
	 * Options
	 * -------
	 * anchor - where to hide this view initially, this will affect the view's position when the anchor scrolls (up-down), the default anchor is 'body'
	 * 
	 */

	_.extend(Backbone.Marionette.View.prototype, {

		enableFlyTo: function(anchor){
			if(!anchor) anchor = 'body';
			if(_.isString(anchor)) anchor = $(anchor);
			this.id = _.uniqueId('free-flow-');

			this.flyTo = function(options){
				// console.log($('#' + this.id));
				if(!$('#' + this.id).length) {
					this.render().$el.attr('id', this.id).css('position', 'absolute');
					anchor.append(this.el);
					if(this.onShow) this.onShow();
				}
				this.$el.show();
				this.shown = true;
				this.adjust = function(){
					if(this.shown)
						this.$el.position(options);//remember the last $.position config
				}
				this.adjust();
				
			};

			this.adjust = $.noop;

			this.hide = function(){
				this.$el.hide();
				this.shown = false;
			};

			return this;
		}

	});

})(Application)