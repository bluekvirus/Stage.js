/**
 * Here we extend the html tag attributes to be auto-recognized by a Marionette.View.
 * This simplifies the view creation by indicating added functionality through template string. (like angular.js?)
 *
 * Fixed
 * -----
 * 0. shiv empty template.
 * 1. auto ui tags detection in template.
 * 2. +meta event programming
 * 	view:* (event-name) <--> on* (camelized)
 * 3. global coop events.
 *
 * 
 * @author Tim Lauv
 * @created 2014.02.25
 * @updated 2015.08.03
 * @updated 2016.01.29
 */


;(function(app){

	_.extend(Backbone.Marionette.View.prototype, {
		//expose isInDOM method (hidden in marionette.domRefresh.js)
		isInDOM: function(){
			if(!this.$el) return undefined;
			return $.contains(document.documentElement, this.$el[0]);
		},

		//override to give default empty template
		getTemplate: function(){
			return Marionette.getOption(this, 'template') || (Marionette.getOption(this, 'editors')? ' ' : '<div class="wrapper-full bg-warning"><p class="h3" style="margin:0;"><span class="label label-default" style="display:inline-block;">No Template</span> ' + this.name + '</p></div>');
		},
	});

	/**
	 * View life-cycle:
	 * ---------------
	 * new View
	 * 		|
	 * 		is
	 * 		|
	 * new M.Layout
	 * 		|+render()*, +close()*, regions
	 * 		|
	 * M.ItemView
	 * 		|+render() --> M.Renderer.render --> M.TemplateCache.get
	 * 		|
	 * [M.View.prototype.constructor*] (this file)
	 * 		|+enhancements, +picks (b, see below List of view options...)
	 * 		|
	 * M.View.apply(this)
	 * 		|+close, +options, +bindUIElements
	 * 		|
	 * BB.View.prototype.constructor
	 * 		|+events, +remove, +picks (a, see below List of view options...)
	 * 		|
	 * .initialize()
	 * ---------------
	 * 
	 * Fixed enhancement:
	 * +auto ui tags detection and register
	 * +meta event programming (view:* (event-name) - on* (camelized))
	 * +coop e support
	 * +useParentData support
	 *
	 * Override View.constructor to affect only decendents, e.g ItemView and CollectionView... 
	 * (This is the Backbone way of extend...)
	 *
	 * List of view options passed through new View(opt) that will be auto-merged as properties:
  	 * a. from Backbone.View ['model', 'collection', 'el', 'id', 'attributes', 'className', 'tagName', 'events'];
  	 * b. from us ['effect', 'template', 'data'/'useParentData', 'ui', 'coop', 'actions', 'editors', 'tooltips', 'overlay', 'popover', 'svg'];
  	 *
  	 * Tip:
  	 * All new View(opt) will have this.options = opt ready in initialize(), also this.*[all auto-picked properties above].
  	 * 
  	 * Note that 'svg' is deprecated and will be changed to canvas in the future.
	 * 
	 */
	Backbone.Marionette.View.prototype.constructor = function(options){
		options = options || {};

		//----------------------deprecated config---------------------------
		if((this.type || options.type) && !this.forceViewType)
			console.warn('DEV::View+::type is deprecated, please do not specify ' + (this.name?'in ' + this.name:''));
		//------------------------------------------------------------------

		//----------------------fixed view enhancements---------------------
		//auto-pick live init options
		_.extend(this, _.pick(options, ['effect', 'template', 'data', 'useParentData', 'ui', 'coop', 'actions', 'editors', 'tooltips', 'overlay', 'popover', 'svg', /*'canvas'*/]));

		//auto ui pick-up after first render (to support inline [ui=""] mark in template)
		this._ui = _.extend({}, this.ui);
		this.listenToOnce(this, 'render', function(){
			var that = this;
			//this.unbindUIElements(); automatically called by bindUIElements();
			this.ui = this._ui;
			$(this.el.outerHTML).find('[ui]').each(function(index, el){
				var ui = $(this).attr('ui');
				that.ui[ui] = '[ui="' + ui + '"]';
			});
			this.bindUIElements();
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

		//data / useParentData ({}, [] or url for GET only)
		this.listenToOnce(this, 'show', function(){
			//supports getting parent data from useParentData.
			this.data = this.data || (this.parentCt && this.useParentData && this.parentCt.get(this.useParentData));
			if(this.data)
				this.set(this.data);
		});		
		
		//---------------------optional view enhancements-------------------
		//actions (1-click uis)
		if(this.actions && this.enableActionTags) 
			this.enableActionTags(this.actions._bubble);
		
		//editors
		if(this.editors && this.activateEditors) this.listenTo(this, 'render', function(){
			this.activateEditors(this.editors);
		});

		//svg (if rapheal.js is present, deprecated...use canvas instead (TBI))
		if(this.svg && this.enableSVG) {
			this.listenTo(this, 'render', this.enableSVG);
		}

		//tooltip
		if(this.tooltips && this.enableTooltips) {
			this.enableTooltips(this.tooltips);
		}

		//overlay (use this view as overlay)
		if(this.overlay && this.enableOverlay){
			this.enableOverlay();
		}

		//auto-enable i18n
		if(I18N.locale) {
			this.listenTo(this, 'render', function(){
				this.$el.i18n({search: true});
			});
		}

		//popover
		if(this.popover && this.enablePopover){
			this.enablePopover();
		}

		return Backbone.Marionette.View.apply(this, arguments);
	};


})(Application);