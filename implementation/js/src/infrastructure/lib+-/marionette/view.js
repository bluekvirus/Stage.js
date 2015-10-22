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
 * @author Tim.Liu
 * @created 2014.02.25
 * @updated 2015.08.03
 */


;(function(app){

	_.extend(Backbone.Marionette.View.prototype, {
		isInDOM: function(){
			if(!this.$el) return undefined;
			return $.contains(document.documentElement, this.$el[0]);
		}
	});

	/**
	 * Fixed enhancement
	 * +auto ui tags detection and register
	 * +meta event programming
	 * 	view:* (event-name) - on* (camelized)
	 *
	 * Override View.constructor to affect only decendents, e.g ItemView and CollectionView... 
	 * (This is the Backbone way of extend...)
	 * 
	 */
	Backbone.Marionette.View.prototype.constructor = function(options){
		options = options || {};

		//----------------------deprecated config---------------------------
		if((this.type || options.type) && !this.forceViewType)
			console.warn('DEV::View+::type is deprecated, please do not specify ' + (this.name?'in ' + this.name:''));

		//----------------------fixed enhancements--------------------------
		//fix default tpl to be ' '.
		this.template = options.template || this.template || ' ';
		//replace data configure
		this.data = options.data || this.data;

		//auto ui pick-up after render (to support dynamic template)
		this._ui = _.extend({}, this.ui, options.ui);
		this.listenTo(this, 'render', function(){
			var that = this;
			this.unbindUIElements();
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
		
		//---------------------optional view enhancements-------------------
		//actions (1-click uis)
		if(this.actions && this.enableActionTags) 
			this.enableActionTags(this.actions._bubble);
		
		//editors
		if(this.editors && this.activateEditors) this.listenTo(this, 'render', function(){
			this.activateEditors(this.editors);
		});

		//svg (if rapheal.js is present)
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

		//data ({}, [] or url for GET only)
		this.listenToOnce(this, 'show', function(){
			//supports getting parent data from useParentData.
			this.data = this.data || (this.parentCt && this.useParentData && this.parentCt.get(this.useParentData));
			if(this.data)
				this.set(this.data);
		});

		return Backbone.Marionette.View.apply(this, arguments);
	};


})(Application);