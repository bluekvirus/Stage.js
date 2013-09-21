/**
 * Dashboard module
 *
 * @author Yan Zhu
 * @date 2013-08-06
 */

(function(app) {

	var context = app.Context.Admin;
	var module = context.module('Dashboard');

	module.portlets = [];

	module.orderList = [];

	module.PortletCollection = Backbone.Collection.extend({
		comparator: function(model1, model2) {
			var index1 = _.indexOf(module.orderList, model1.get('id'));
			var index2 = _.indexOf(module.orderList, model2.get('id'));
			return (index1 > index2 ? 1 : (index1 < index2 ? -1 : 0));
		}
	});

	///////////////////////// Config ////////////////////////////////////////
	module.Config = {
		// Refresh the dashboard as a whole or not. If false, refresh each portlet by itself
		wholeRefresh: false,

		// If wholeRefresh true, this is dashboard auto-refresh time when it is a number greater than 0, otherwise dashboard auto-refreshing is forbidden.
		// If wholeRefresh false, this means allow portlet auto-refreshing or not, depends on its value is truthy or falsy
		autoRefresh: true,

		// Dashboard auto-refresh function, should implement it when wholeRefresh true
		refresh: function() {
			console.log('Dashboard refresh: unimplemented');
		}
	};

	///////////////////////// Cache (use store.js) //////////////////////////

	// Cache all hidden portlets ids in an array named with this key
	var cache_key_hidden_portlets = 'ftnt_fortiextender_dashboard_hidden_portlets';

	// Cache portlets order in an array named with this key
	var cache_key_portlets_order = 'ftnt_fortiextender_dashboard_portlets_order';

	// Clear dashboard cache
	module.clearCache = function() {
		_.each(
			[
				cache_key_hidden_portlets,
				cache_key_portlets_order
			],
			function(cacheKey, index) {
				store.remove(cacheKey);
			}
		);
	};

	///////////////////////// View /////////////////////////////////////////
	module.View = {};

	module.View.Portlet = Backbone.Marionette.ItemView.extend({

		template: '#custom-tpl-default-portlet',

		className: 'portlet',

		ui: {
			header: '.header',
			body: '.body'
		},

		events: {
			'click .tool-refresh': 'refreshPortlet',
			'click .tool-toggle': 'togglePortlet',
			'click .tool-fullsize': 'fullSizePortlet',
			'click .tool-close': 'closePortlet'
		},

		initialize: function(options) {
			this.setElId();
			this.widgetType = this.model.get('widgetType');
			this.widgetOptions = this.model.get('widgetOptions');
			this.autoRefresh = this.model.get('autoRefresh');
			this.widget = app.Widget.create(this.widgetType, this.widgetOptions);

			_.bindAll(this, 'onResize');
			$(window).on('resize.'+this.getElId(), _.debounce(this.onResize, 100));
		},

		onRender: function() {
			console.log('Portlet onRender');
			this.ui.body.empty().append(this.widget.render().el);

			// If refreshing dashboard as a whole, portlet refresh is forbidden
			if (module.Config.wholeRefresh) {
				this.ui.header.find('.tool-refresh').remove();
			}
		},

		onShow: function() {
			console.log('Portlet onShow');
			this.widget.trigger('parentCt:shown', this);
			this.handleAutoRefresh();
		},

		onClose: function() {
			console.log('Portlet onClose');
			this.stopAutoRefresh();
			$(window).off('resize.'+this.getElId());
		},

		setElId: function() {
			this.$el.attr('id', this.model.get('id'));
		},

		getElId: function() {
			return this.$el.attr('id');
		},

		onResize: function(event) {
			console.log('Portlet onResize');
			this.widget.trigger('parentCt:resize', this);
		},

		stopAutoRefresh: function() {
			console.log('Portlet stopAutoRefresh');
			if (this.timerId) {
				clearInterval(this.timerId);
				this.timerId = null;
			}
		},

		handleAutoRefresh: function() {
			console.log('Portlet handleAutoRefresh');

			this.stopAutoRefresh();

			if (!module.Config.wholeRefresh && module.Config.autoRefresh) {

				if (typeof(this.autoRefresh) === 'number' && this.autoRefresh > 0) {

					if (typeof(this.widget.refresh) !== 'function') {
						app.error('Portlet Auto-refresh Error', 'widget ', this.widgetType, ' does not provide [refresh] method');
						return;
					}

					this.timerId = setInterval(_.bind(function() {

													this.widget.refresh();

												}, this), this.autoRefresh * 1000);
				}
			}
		},

		refreshPortlet: function(event) {
			console.log('Portlet refreshPortlet');
			if (typeof(this.widget.refresh) !== 'function') {
				app.error('Portlet Refresh Error', 'widget ', this.widgetType, ' does not provide [refresh] method');
				return;
			}

			this.widget.refresh();

			// this.handleAutoRefresh();
		},

		togglePortlet: function(event) {
			// console.log('Portlet togglePortlet');
			this.$el.width(this.$el.width());
			this.ui.body.slideToggle();

			$(event.currentTarget).find('i').toggleClass('icon-chevron-up icon-chevron-down');
		},

		fullSizePortlet: function(event) {
			console.log('Portlet fullSizePortlet');
			$('body').elMask({
				overlap: true,
				onShow: _.bind(function($el, options) {
									console.log('elMask onShow');
									var $overlap = $el.find(options.overlapSelector);
									var closeHandler = $el.data('unmask');
									var portletView = new module.View.FullSizePortlet({
										model: this.model,
										closeHandler: closeHandler,
										// originPortlet: this
									});
									$overlap.html(portletView.render().el);
									// Call FullSizePortlet.onShow() to inform fullsize portlet is shown
									portletView.onShow();
									$overlap.data('portlet', portletView);

									// Stop auto-refresh of this portlet
									this.stopAutoRefresh();
								}, this),
				onCancel: _.bind(function($el, options) {
									console.log('elMask onCancel');
									var $overlap = $el.find(options.overlapSelector);
									var portletView = $overlap.data('portlet');
									$overlap.empty();
									// Call FullSizePortlet.onClose() to inform fullsize portlet is closed
									portletView.onClose();

									// Start auto-refresh of this portlet
									this.handleAutoRefresh();
								}, this)
			});
		},

		closePortlet: function(event) {
			console.log('Portlet closePortlet');
			module.shownPortletCollection.remove(this.model);
			module.hiddenPortletCollection.add(this.model);
		}
	});

	module.View.FullSizePortlet = module.View.Portlet.extend({

		className: 'portlet fullsize-portlet',

		initialize: function(options) {
			module.View.Portlet.prototype.initialize.call(this, options);

			this.closeHandler = options.closeHandler;
			// this.originPortlet = options.originPortlet;
		},

		onRender: function() {
			console.log('FullSizePortlet onRender');
			module.View.Portlet.prototype.onRender.call(this);

			this.ui.header.find('.tool-toggle, .tool-fullsize').remove();
		},

		setElId: function() {
			this.$el.attr('id', this.model.get('id')+'-fullsize');
		},

		onResize: function() {
			console.log('FullSizePortlet onResize', 'do nothing');
		},

		closePortlet: function(event) {
			console.log('FullSizePortlet closePortlet');
			if ($.isFunction(this.closeHandler)) {
				this.closeHandler();
			}
		}
	});

	module.View.HiddenPortlet = Backbone.Marionette.ItemView.extend({

		template: '#custom-tpl-default-hidden-portlet',

		className: 'hidden-portlet',

		events: {
			'click .tool-show': 'showPortlet'
		},

		showPortlet: function(event) {
			// console.log('showPortlet');
			module.shownPortletCollection.add(this.model);
			module.hiddenPortletCollection.remove(this.model);
		}
	});

	module.View.HiddenPortlets = Backbone.Marionette.CollectionView.extend({

		className: 'hidden-portlets',

		itemView: module.View.HiddenPortlet,

		collectionEvents: {
			'add': 'portletAdded',
			'remove': 'portletRemoved'
		},

		portletAdded: function(model, collection, options) {
			// console.log('portlet added to hidden portlets');
			var hiddenIds = store.get(cache_key_hidden_portlets) || [];
			hiddenIds.push(model.get('id'));
			store.set(cache_key_hidden_portlets, hiddenIds);
		},

		portletRemoved: function(model, collection, options) {
			// console.log('portlet removed from hidden portlets');
			var hiddenIds = store.get(cache_key_hidden_portlets) || [];
			hiddenIds = _.without(hiddenIds, model.get('id'));
			store.set(cache_key_hidden_portlets, hiddenIds);
		}
	});

	module.View.Dashboard = Backbone.Marionette.CompositeView.extend({

		template: '#custom-tpl-default-dashboard',

		className: 'dashboard',

		itemView: module.View.Portlet,
		itemViewContainer: '.body',

		ui: {
			header: '.header',
			body: '.body',
			footer: '.footer'
		},

		events: {
			'click .btn[action="refresh"]': 'refreshDashboard',
			'click .btn[action="autoRefresh"]': 'toggleDashboardAutoRefresh'
		},

		initialize: function(options) {
			var shownPortlets = [],
				hiddenPortlets = [],
				hiddenIds = store.get(cache_key_hidden_portlets) || [];
			
			module.orderList = store.get(cache_key_portlets_order) || [];

			this.bindPortlets();

			if (hiddenIds.length === 0) {
				shownPortlets = module.portlets;
			} else {
				_.each(module.portlets, function(portlet, index) {
					if (_.contains(hiddenIds, portlet.id)) {
						hiddenPortlets.push(portlet);
					} else {
						shownPortlets.push(portlet);
					}
				});
			}
			
			this.collection = module.shownPortletCollection = new module.PortletCollection(shownPortlets);
			module.hiddenPortletCollection = new module.PortletCollection(hiddenPortlets);

			_.bindAll(this, 'onResize');
			$(window).on('resize.dashboard', _.debounce(this.onResize, 100));
		},

		// Override appendHtml() function to display portlets in the correct order on the screen
		appendHtml: function(compositeView, itemView, index) {
			console.log('Dashboard appendHtml');
			var $container = this.getItemViewContainer(compositeView);
			if (index === 0) {
				$container.prepend(itemView.el);
			} else {
				$container.children('.portlet').eq(index-1).after(itemView.el);
			}
		},

		onRender: function() {
			console.log('Dashboard onRender');
			this.ui.footer.empty().append(new module.View.HiddenPortlets({
				collection: module.hiddenPortletCollection
			}).render().el);

			if (module.Config.wholeRefresh) {
				if (typeof(module.Config.autoRefresh) === 'number' && module.Config.autoRefresh > 0) {
					// do nothing
				} else {
					this.ui.header.find('.btn[action="autoRefresh"]').remove();
				}
			} else {
				if (module.Config.autoRefresh) {
					// do nothing
				} else {
					this.ui.header.find('.btn[action="autoRefresh"]').remove();
				}
			}
		},

		onShow: function() {
			console.log('Dashboard onShow');
			this.adjustHeight();

			this.ui.body.sortable({
				items: '.portlet',
				handle: '> .header',
				cursor: 'move',
				stop: _.bind(function(event, ui) {
					var sortedIds = this.ui.body.sortable('toArray');
					store.set(cache_key_portlets_order, sortedIds);
				}, this)
			});

			this.handleAutoRefresh();
		},

		onClose: function() {
			console.log('Dashboard onClose');
			this.stopAutoRefresh();
			$(window).off('resize.dashboard');
		},

		onResize: function() {
			console.log('Dashboard onResize');
			this.adjustHeight();
		},

		adjustHeight: function() {
			console.log('Dashboard adjustHeight');
			_.each([app.main, app.banner, app.footer], function(region, index) {
				region.ensureEl();
			});
			var containerBodyHeight = app.main.$el.height()
									- app.banner.$el.outerHeight(true)
									- app.footer.$el.outerHeight(true);
			var marginBorderPaddingHeight = this.$el.outerHeight(true) - this.$el.height();
			// console.log($(window).height(),
			// 			$('body').height(),
			// 			app.main.$el.height(),
			// 			app.banner.$el.outerHeight(true),
			// 			app.footer.$el.outerHeight(true),
			// 			this.$el.outerHeight(true),
			// 			this.$el.height());
			this.$el.height(containerBodyHeight - marginBorderPaddingHeight);
			marginBorderPaddingHeight = this.ui.body.outerHeight(true) - this.ui.body.height();
			var dashboardBodyHeight = this.$el.height()
									- this.ui.header.outerHeight(true)
									- this.ui.footer.outerHeight(true)
									- marginBorderPaddingHeight;
			this.ui.body.height(dashboardBodyHeight);
		},

		stopAutoRefresh: function() {
			console.log('Dashboard stopAutoRefresh');
			if (this.timerId) {
				clearInterval(this.timerId);
				this.timerId = null;
			}
		},

		handleAutoRefresh: function() {
			console.log('Dashboard handleAutoRefresh');

			this.stopAutoRefresh();

			if (module.Config.wholeRefresh) {

				if (typeof(module.Config.autoRefresh) === 'number' && module.Config.autoRefresh > 0) {

					if (typeof(module.Config.refresh) !== 'function') {
						app.error('Dashboard Auto-refresh Error', 'does not provide [refresh] method in the Config');
						return;
					}

					this.timerId = setInterval(_.bind(function() {

														module.Config.refresh();

													}, this), module.Config.autoRefresh * 1000);
				}
			}
		},

		refreshDashboard: function(event) {
			console.log('Dashboard refreshDashboard');
			if (module.Config.wholeRefresh) {
				if (typeof(module.Config.refresh) !== 'function') {
					app.error('Dashboard Refresh Error', 'does not provide [refresh] method in the Config');
					return;
				}
				module.Config.refresh();
				// this.handleAutoRefresh();
			} else {
				this.children.each(function(portletView, index) {
					portletView.refreshPortlet();
				});
			}
			
		},

		toggleDashboardAutoRefresh: function(event) {
			console.log('Dashboard toggleDashboardAutoRefresh');
			var $btn = $(event.currentTarget);
			var state = $btn.data('state');

			if (state === 'running') {

				if (module.Config.wholeRefresh) {
					this.stopAutoRefresh();
				} else {
					this.children.each(function(portletView, index) {
						portletView.stopAutoRefresh();
					});
				}
				
				$btn.html('<i class="icon-play"></i> Start Auto-Refresh').data('state', 'paused');

			} else {

				if (module.Config.wholeRefresh) {
					this.handleAutoRefresh();
				} else {
					this.children.each(function(portletView, index) {
						portletView.handleAutoRefresh();
					});
				}
				
				$btn.html('<i class="icon-stop"></i> Stop Auto-Refresh').data('state', 'running');
			}
		},

		/**
		 * @param title  Portlet title. Required
		 * @param widgetType  What widget type to be used in this portlet. Required
		 * @param widgetOptions  Options of that widget type. Required, pass null or undefined if this widget type has no options
		 * @param options  Optional portlet configurations as following:
		 *        autoRefresh  Auto-refresh time, number in seconds, otherwise not to auto refresh. Default to false
		 */
		addPortlet: function(title, widgetType, widgetOptions, options) {
			if (!app.Widget[widgetType]) {
				app.error('Add Portlet Error', 'widget ', widgetType, ' not found...');
				return;
			}

			var portlet = {},
				portletIdPrefix = 'portlet';
			
			portlet.id = [portletIdPrefix, _.str.dasherize(title)].join('');
			portlet.title = title;
			portlet.widgetType = widgetType;
			portlet.widgetOptions = widgetOptions || {};
			portlet.autoRefresh = (options && options.autoRefresh) || false;

			module.portlets.push(portlet);

			if (!_.contains(module.orderList, portlet.id)) {
				module.orderList.push(portlet.id);
			}
		},

		bindPortlets: function() {}
	});

	module.View.Default = module.View.Dashboard;

})(Application);

Template.extend(
	'custom-tpl-default-portlet',
	[
		'<div class="header">',
			'<div class="title">{{{title}}}</div>',
			'<div class="tools">',
				'<div class="tool tool-refresh"><i class="icon-refresh"></i></div>',
				'<div class="tool tool-toggle"><i class="icon-chevron-up"></i></div>',
				'<div class="tool tool-fullsize"><i class="icon-resize-full"></i></div>',
				'<div class="tool tool-close"><i class="icon-remove"></i></div>',
			'</div>',
		'</div>',
		'<div class="body">',
		'</div>'
	]
);

Template.extend(
	'custom-tpl-default-hidden-portlet',
	[
		'<div class="title">{{{title}}}</div>',
		'<div class="tools">',
			'<div class="tool tool-show"><i class="icon-plus"></i></div>',
		'</div>'
	]
);

Template.extend(
	'custom-tpl-default-dashboard',
	[
		'<div class="header">',
			'<div class="btn" action="refresh"><i class="icon-refresh"></i> Refresh</div>',
			'<div class="btn" action="autoRefresh" data-state="running"><i class="icon-stop"></i> Stop Auto-Refresh</div>',
		'</div>',
		'<div class="body">',
		'</div>',
		'<div class="footer">',
		'</div>'
	]
);