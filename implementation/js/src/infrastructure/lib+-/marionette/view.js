/**
 * This is where we extend and enhance the abilities of a View through init,lifecycle augmentation.
 * 
 * View life-cycle:
 * ---------------
 * new View
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
 * [M.View.prototype.constructor*] (this file)
 * 		|+fixed enhancements, +ui recognition,
 * 		|+pick and activate optional ones (b, see below List of view options...)
 * 		|
 * M.View.apply(this)
 * 		|+close, +this.options, +bindUIElements
 * 		|
 * BB.View.prototype.constructor
 * 		|+events, +remove, +picks (a, see below List of view options...)
 * 		|
 * .initialize(options) [options is already available in this.options]
 * ---------------
 * 
 * Fixed enhancement:
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
 *   	c. from us ['effect', 'template', 'data'/'useParentData', 'ui', 'coop', 'actions', 'editors', 'tooltips', 'overlay', 'popover', 'svg'];
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
 * @updated 2016.02.01
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
				(Marionette.getOption(this, 'editors') || Marionette.getOption(this, 'svg') || Marionette.getOption(this, 'layout'))? ' ' : '<div class="wrapper-full bg-warning"><p class="h3" style="margin:0;"><span class="label label-default" style="display:inline-block;">No Template</span> ' + this.name + '</p></div>'
			);
		},
	});

	//*init, life-cycle
	Backbone.Marionette.View.prototype.constructor = function(options){
		options = options || {};

		//----------------------deprecated config---------------------------
		if((this.type || options.type) && !this.forceViewType)
			console.warn('DEV::View+::type is deprecated, please do not specify ' + (this.name?'in ' + this.name:''));
		//------------------------------------------------------------------

		//----------------------fixed view enhancements---------------------
		//auto-pick live init options
		_.extend(this, _.pick(options, ['effect', 'template', 'data', 'useParentData', 'ui', 'coop', 'actions', 'dnd', 'selectable', 'editors', 'tooltips', 'overlay', 'popover', 'svg', /*'canvas'*/]));

		//re-wire this.get()/set() to this.getVal()/setVal(), data model in editors is used as configure object.
		if(this.category === 'Editor'){
			this.get = this.getVal;
			this.set = this.setVal;
		}

		//extend ui collection after first render (to support inline [ui=""] mark in template)
		//**Caveat: Don't put anything as [ui=] in {{#each}}, they will overlap. 
		//			bindUIElements in item-view render() will not pick up changes made here. (we re-init [ui=]tags manually)
		this.listenTo(this, 'render', function(){
			var that = this;
			this.ui = this.ui || {};
			this.$el.find('[ui]').each(function(index, el){
				var $el = $(el);
				var key = $el.attr('ui');
				that.ui[key] = $el;
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

		//data / useParentData ({}, [] or url for GET only)
		this.listenToOnce(this, 'show', function(){
			//supports getting parent data from useParentData.
			this.data = this.data || (this.parentCt && this.useParentData && this.parentCt.get(this.useParentData));
			if(this.data)
				this.set(this.data);
		});
		
		//---------------------optional view enhancements-------------------
		//editors
		if(this.editors && this.activateEditors) this.listenTo(this, 'render', function(){
			this.activateEditors(this.editors);
		});

		//svg (if rapheal.js is present, deprecated...use canvas instead (TBI))
		if(this.svg && this.enableSVG) {
			this.listenTo(this, 'render', this.enableSVG);
		}

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

		//actions (1-click uis) - Suggestion: move from +M.ItemView to this file
		if(this.actions && this.enableActionTags) 
			this.enableActionTags(this.actions._bubble);
		
		//tooltip - Suggestion: move from +M.ItemView to this file
		if(this.tooltips && this.enableTooltips) {
			this.enableTooltips(this.tooltips);
		}

		//overlay (use this view as overlay) - Suggestion: move from +M.ItemView to this file
		if(this.overlay && this.enableOverlay){
			this.enableOverlay();
		}

		//popover - Suggestion: move from +M.ItemView to this file
		if(this.popover && this.enablePopover){
			this.enablePopover();
		}

		//auto-enable i18n
		if(I18N.locale) {
			this.listenTo(this, 'render', function(){
				this.$el.i18n({search: true});
			});
		}

		return Backbone.Marionette.View.apply(this, arguments);
	};


})(Application);