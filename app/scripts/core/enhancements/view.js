/**
 * Backbone.Marionette View Object Enhancements
 * 
 * component opt-ins: (use in component initialize func)
 * 1. +Action Tag listener mechanisms - View.
 * 2. +UI Locking support to view regions (without Application scope total lockdown atm...) - Layout.
 * 3. +View Region/UI auto-detects + optional fake content - Layout.
 * 4. +Window resize awareness - View.
 * 5. +SVG canvas support - View.
 * 6. +Tab layout support - View. 
 * 7. +Auto region resize evenly. - Layout.
 * 8. +Editors Activation - View.
 * 9. +Enable Form (with +addFormPart(view)) - View. 
 * 
 * planned:
 * b. tooltips activation upon 'show'
 * c. user action clicking statistics (use the view._uiDEVName set by enableActionTags(type.name.subname)) - type can be Context/Widget
 * d. region show effect support (override Region.prototype.open and View.prototype.openEffect)
 * 
 * 
 * @author Tim.Liu
 * @create 2013.09.11
 * @updated 2013.11.08
 * 
 */


/**
 * Action Tag listener hookups +actions{}
 * Usage:
 * 		1. add action tags to html template -> e.g <div ... action="method name"></div> 
 * 		2. implement the action method name in UI definition body's actions{} object. 
 * 		functions under actions{} are invoked with 'this' as scope (the view object).
 * 		functions under actions{} are called with a single param ($action) which is a jQuery object referencing the action tag.
 *
 * Note:
 * We removed _.bind() altogether from the enableActionTags() function and use Function.apply(scope, args) instead for listener invocation to avoid actions{} methods binding problem.
 * Functions under actions will only be bound ONCE to the first instance of the view definition, since _.bind() can not rebind functions that were already bound, other instances of
 * the view prototype will have all the action listeners bound to the wrong view object. This holds true to all nested functions, if you assign the bound version of the function back to itself
 * e.g. this.nest.func = _.bind(this.nest.func, this); - Do NOT do this in initialize()/constructor()!! Use Function.apply() for invocation instead!!!
 */
_.extend(Backbone.Marionette.View.prototype, {

	enableActionTags: function(uiName){ //the uiName is just there to output meaningful dev msg if some actions haven't been implemented.
		this.events = this.events || {};
		//add general action tag clicking event and listener
		_.extend(this.events, {
			'click [action]': '_doAction'
		});
		this.actions = this.actions || {}; 	
		this._uiDEVName = uiName;			
	},

	_doAction: function(e){
		e.stopPropagation(); //Important::This is to prevent confusing the parent view's action tag listeners.
		var $el = $(e.currentTarget);
		var action = $el.attr('action') || 'UNKNOWN';
		var doer = this.actions[action];
		if(doer) {
			doer.apply(this, [$el]); //use 'this' view object as scope when applying the action listeners.
		}else throw new Error('DEV::' + (this._uiDEVName || 'UI Component') + '::You have not yet implemented this action - [' + action + ']');
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
		if(this.regions){
			this._uilocks = _.reduce(this.regions, function(memo, val, key, list){
				memo[key] = false;
				return memo;
			}, {_all: false});
		}else {
			throw new Error('DEV::View::UI locks can only be applied to Layout view objects with valid regions...');
		}
	},

	//region, caller are optional
	lockUI: function(region, caller){
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
	},

	//region, caller are optional
	unlockUI: function(region, caller){
		region = this._checkRegion(region);

		caller = caller || '_default_';
		if(!this._uilocks[region]) return true; //not locked, bypass.
		if(this._uilocks[region] === caller){ //locked by caller, release it.
			this._uilocks[region] = false;
			return true;
		}
		//else throw error...
		throw new Error('DEV::View UI Locks::This region ' + region + ' is locked by ' + this._uilocks[region] + ', you can NOT unlock it with ' + caller);
	},

	isUILocked: function(region){
		region = this._checkRegion(region);

		return this._uilocks[region];
	},

	//=====Internal Workers=====
	_checkRegion: function(region){
		if(!this._uilocks) throw new Error('DEV::View::You need to enableUILocks() before you can use this...');

		if(!region)
			region = '_all';
		else
			if(!this.regions[region])
				throw new Error('DEV::View UI Locks::This region does NOT exist - ' + region);
		return region;
	}
	//=====Internal Workers=====				

});


/**
 * Region/UI auto detection, (+ putting fake content into regions).
 * Do auto-detect in initialize().
 * Do fake region content in show().
 */
_.extend(Backbone.Marionette.View.prototype, {
	//in init()
	autoDetectUIs: function(){
		this.ui = this.ui || {};
		var that = this;
		$('<div>' + $(this.template).html() + '</div>').find('[ui]').each(function(index, el){
			var ui = $(this).attr('ui');
			that.ui[ui] = '[ui="' + ui + '"]';
		});
		//this.bindUIElements();
	},

	autoDetectRegions: function(){
		if(!this.addRegions) throw new Error('DEV::View::You should use a Marionette.Layout object for region auto-detection');
		
		var that = this;
		$('<div>' + $(this.template).html() + '</div>').find('[region]').each(function(index, el){
			var r = $(this).attr('region');
			that.regions[r] = '[region="' + r + '"]';
		});
		this.addRegions(this.regions);
	},

	//in show() - only useful during development...
	fakeRegions: function(){
		try {
			_.each(this.regions, function(selector, name){
				this[name].ensureEl();
				this[name].$el.html('<p class="alert">Region <strong>' + name + '</strong></p>');
			}, this);
		}catch(e){
			throw new Error('DEV::View::You should define a proper Layout object to use fakeRegions()');
		}
	}
});


/**
 * Respond to window resize event. (during initialize)
 * + Fire a event [view:resized] local to the view object so that sub-modules/widgets can listen to it.
 * + Added a cb for this event as default [this.onWindowResize()] - to be extended.
 */
_.extend(Backbone.Marionette.View.prototype, {
	hookUpWindowResize: function(){
		var that = this;
		function onResize(e){
			if(that.onWindowResize) that.onWindowResize(e);
			that.trigger('view:resized', e);
		}
		onResize = _.debounce(onResize, 200);			
		$(window).on('resize', onResize);
		this.listenTo(this, 'item:before:close', function(){
			$(window).off('resize', onResize);
		});
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
		this.listenTo(this, 'view:resized', function(e){
			this.paper.setSize(this.$el.width(), this.$el.height());
		});
	}
});


/**
 * Enable Tabbable (Bootstrap 2.3.2) sub-views/wigets in View (ItemView/Layout).
 * + addTab([View object]) 
 * + removeTab([id or number])
 * + showTab([id or number]) - for co-op event response to other part of the app.
 *
 * ---------
 * direction: top (default), right, below, and left
 * ---------
 *
 * ---------
 * tab Title/Icon (icon css className)
 * ---------
 * Use view.tab.{title: ..., icon: ...} to config. So make sure your defined it in the View object definition.
 * 
 * Do this in onShow() instead of initialize.
 */
_.extend(Backbone.Marionette.View.prototype, {
	enableTabLayout: function(direction, region){
		//1. prepare tab-layout skeleton
		var skeleton = [
			'<div class="tabbable tabs-{{direction}}">',
				'{{#is direction "below"}}',
					'<div class="tab-content"></div>',
					'<ul class="nav nav-tabs"></ul>',
				'{{else}}',
					'<ul class="nav nav-tabs"></ul>',
					'<div class="tab-content"></div>',
				'{{/is}}',
			'</div>'
		];

		skeleton = Handlebars.compile(skeleton.join(''));
		var html = skeleton({
			direction: direction || 'top'
		});

		//2. show the skeleton
		if(region && this.regions && this[region]){
			//Layout
			this[region].ensureEl();
			this[region].$el.html(html);
		}else {
			//ItemView
			this.$el.html(html);
		}
		//cache the ui locator.
		var $tabs = {
			navi: this.$('ul.nav-tabs'),
			content: this.$('.tab-content')
		}

		//3. instrument this view with add, remove and show tab methods
		//3.1 add - WRNING::no duplication check!
		//		-view is a view instance with view.tabTitle set.
		//		-cb is the callback function that used to setup additional event hooks to the tab layout. 
		//		e.g hook up view:resized event if the tab layout has window-resize hook enabled.
		this.addTab = function(view, cb){
			var tabId = _.uniqueId('tab-view');
			if(!view.tab) throw new Error('DEV::View::You are adding a tab view without the necessary view.tab config block!');
			$tabs.navi.append('<li><a data-toggle="tab" href="#' + tabId + '"><i class="' + (view.tab.icon || 'icon-question-sign') + '"></i> ' + (view.tab.title || 'UNKNOWN Tab') + '</a></li>');
			$tabs.content.append(view.render().$el.addClass('tab-pane').attr('id', tabId));
			cb && cb(view, this);
			if(view.onShow) view.onShow();//call onShow() for view object.
		}

		//3.2 remove - by id/title TBI
		
		//3.3 show - by id/title/index
		this.showTab = function(target){
			if(_.isNumber(target)){
				//index
				$tabs.navi.find('li:eq(' + target + ') a').tab('show');
			}else if (_.string.startsWith('tab-view')){
				//id - TBI
			}else {
				//title - TBI
			}
		}

		//3.4 tab:switch event response - co-op with others. TBI
	}
});


/**
 * Auto even Layout region size.
 * Do this in onShow() or initialize.
 * !Note! that you should also use 7.hookUpWindowResize() to make the even process keeps up with window resizing.
 * -------
 * options
 * -------
 * mode: vertical (default) | horizontal
 * min: 100 (default)
 */
_.extend(Backbone.Marionette.Layout.prototype, {
	
	evenRegionSize: function(options){

		if(!this.regions) throw new Error('DEV::View::You can only even regions in a Layout object');
		var keys = _.keys(this.regions) ;
		var numOfRegions = _.size(this.regions);
		options = _.extend({
			mode: 'vertical',
			min: 100,
			hFloat: 'left',
		}, options);

		if(options.mode === 'horizontal'){
			this.listenTo(this, 'view:resized', function(e){

				var w = this.$el.width();
				var perRegionWidth = Math.round(w/numOfRegions - 0.6); //manually fixing what Math.floor() or -1 couldn't fix here.
				perRegionWidth = perRegionWidth > options.min? perRegionWidth: options.min;

				_.each(this.regions, function(selector, r){							
					this[r].ensureEl();
					this[r].$el.width(perRegionWidth).css('float', options.hFloat);
					this[r].currentView && this[r].currentView.trigger('view:resized', {w: perRegionWidth, h: null});
				},this);
			});			
		}else if(options.mode === 'vertical'){
			this.listenTo(this, 'view:resized', function(e){						
				
				var h = Application.fullScreenContextHeight.bodyOnly;
				var perRegionHeight = h/numOfRegions;
				perRegionHeight = perRegionHeight > options.min? perRegionHeight: options.min;

				_.each(this.regions,function(selector, r){							
					this[r].ensureEl();
					this[r].$el.height(perRegionHeight);
					this[r].currentView && this[r].currentView.trigger('view:resized', {w: null, h: perRegionHeight});
				},this);
			});	 	
		}

		this.trigger('view:resized');
	
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
 * triggerOnShow: true|false,
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
	}

});


/**
 * Enable Form - do it in initialize(); (though addformPart should be in onShow or onRender)
 * Note that a form part will not be registered with a name, so do NOT try to co-op between form parts.
 * This will turn a view into a form by giving it the following methods:
 * required:
 * 0. addFormPart(view, [{region: '' or appendTo: '' + cb: ''}]) * add an isolated form piece (an activateEditors instrumented view) into a region or tag selector or append to this.$el; 
 * 1. getValues() * - default implementation will be to collect value by this.editors{} and merge with this.parts[]'s editors (the form parts will also have a chance to override getValues)
 * 2. setValues(vals) * - default implementation will be to set value by this.editors{} and this.parts[]'s editors (the form parts will have a chance to override setValues)
 * 3. validate(show) * - default implementation will be to validate by this.editors{} and this.parts[]'s editors (can be voerriden by the form part view)
 * Note that after validation(show:true) got errors, those editors will become eagerly validated, it will turn off as soon as the user has input-ed the correct value.
 * 
 * optional: button action implementations, you still have to code your button's html into the template.
 * 4. submit
 * 5. reset
 * 6. refresh
 * 7. cancel
 */

_.extend(Backbone.Marionette.View.prototype, {

	enableForm: function(options){
		this.tagName = 'form';
		//0.
		this.parts = this.parts || [];
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

		//1
	}

});

