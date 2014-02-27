/**
 * Enhancing the Marionette.Layout Definition to auto detect regions and regional views through its template.
 *
 * Disable
 * -------
 * Use options.regions or a function as options to disable this and resume the normal behavior of a Marionette.Layout.
 * (when you want to control regions yourself or use getTemplate())
 *
 * Fixed
 * -----
 * auto region detect and register
 * auto regional view display
 *
 * Note that: Layout class now has a static regional method to register sub regional View definitions into a static list.
 *
 * @author Tim.Liu
 * @create 2014.02.25
 */

;(function(app){

	var old = Backbone.Marionette.Layout;
	Backbone.Marionette.Layout = Backbone.Marionette.Layout.extend({

		constructor: function(options){
			options = options || {};

			if(!_.isFunction(options))
				if(!this.regions && !options.regions){
					this.regions = {};
					var tpl = Backbone.Marionette.TemplateCache.prototype.loadTemplate(options.tempalte || this.template || ' ');
					//figure out the regions, first
					var that = this;
					$('<div>' + tpl + '</div>').find('[region]').each(function(index, el){
						var r = $(el).attr('region');
						//that.regions[r] = '[region="' + r + '"]';
						that.regions[r] = {
							selector: '[region="' + r + '"]'
						};
					});
					//ensure region.$el
					this.listenTo(this, 'render', function(){
						_.each(this.regions, function(selector, region){
							this[region].ensureEl();
							this[region].$el.addClass('region region-' + _.string.slugify(region));
						},this);
					});
					//automatically show a View from this.Views in marked region.
					this.listenTo(this, 'show', function(){
						_.each(this.regions, function(selector, r){
							var RegionalViewDef = this.constructor.Views[this[r].$el.attr('view')];
							if(RegionalViewDef) this[r].show(new RegionalViewDef());
							else this[r].$el.html('<p class="alert">Region <strong>' + r + '</strong></p>');				
						},this);
					});								
				}

			return old.prototype.constructor.call(this, options);
		},	
	}, {
		//static.
		Views: {},
 		regional: function(options){ //provide a way of registering sub regional views [both by this Layout Class (through prototype.regional) and its instances]
			if(this.Views[options.name]) console.warn('DEV::Lib+-.Marionette.Layout::Conflicting regional view definition --' + options.name + '--');
			var View = this.Views[options.name] = Marionette[options.type || 'ItemView'].extend(options);
			return View;
		}		
	});

})(Application);