//1-7,8,9
//7.We override the Region open method to let it consult a view's openEffect attribute.
//8.We add a resize method to Region to allow easier layout sizing.
//	config: {w: ..., h: ..., view: true - resize the view instead of region container, overflowX: hidden, overflowY: auto}
//9.We add a schedule method to show a view when the parent layout is ready(rendered) or shown, this should be used within the parent layout's initialize(). 
//	It also save a ref to the region's future view, so you can .listenTo the view by layout.views.[region name] in the initialize() after scheduling.
_.extend(Backbone.Marionette.Region.prototype, {
	open: function(view){
		if(view._openEffect){
			this.$el.hide();
			this.$el.empty().append(view.el);
			this.$el.show(view._openEffect.name, view._openEffect.options, view._openEffect.duration || 200);
		}
		else 
			this.$el.empty().append(view.el);
	},

	resize: function(config){
		config = _.extend({
			view: true,
			overflowX: 'hidden',
			overflowY: 'auto'
		},config);
		var target = this.currentView;
		if(!config.view) target = this;
		if(!target) return;
		if(config.h) target.$el.height(config.h).css('overflowY', config.overflowY);
		if(config.w) target.$el.width(config.w).css('overflowX', config.overflowX);
		target.trigger('view:resized', _.pick(config, 'h', 'w'));
	},

	schedule: function(view, immediate, uponRender){
		this.layout.views = this.layout.views || {};
		this.layout.views[this.name] = view;
		if(immediate) this.show(view);
		else
			this.listenToOnce(this.layout, uponRender?'render':'show', function(){
				this.show(view);
			});
	}
});