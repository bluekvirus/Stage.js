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
 * auto region detect and register by region="" in template
 * auto regional view display by attribute view="" in template
 * change a region's view by trigger 'region:load-view' on that region, then give it a view name. (registered through B.M.Layout.regional() or say app.create('Regional', ...))
 * 
 * 
 * Experimental
 * ------------
 * default getValues/setValues and validate() method supporting editors value collection and verification
 *
 * Note that: Layout class now has a static regional method to register sub regional View definitions into a static list.
 *
 * @author Tim.Liu
 * @create 2014.02.25
 */

;(function(app){

	var old = Backbone.Marionette.Layout;

	/**
	 * Static Mixin of a Layout in case it is used as a Form container.
	 * 1. getValues() * - collects values from each region;
	 * 2. setValues(vals) * - sets values to regions;
	 * 3. validate(show) * - validate all the regions;
	 * Note that after validation(show:true) got errors, those editors will become eagerly validated, it will turn off as soon as the user has input-ed the correct value.
	 * 
	 * Not implemented: button action implementations, you still have to code your button's html into the template.
	 * 4. submit
	 * 5. reset
	 * 6. refresh
	 * 7. cancel
	 *
	 * No setVal getVal
	 * ----------------
	 * This is because we don't permit co-op between form parts, so there is no short-cut for getting/setting single editor/field value.
	 *
	 */

	_.extend(Backbone.Marionette.Layout.prototype, {

		//1. getValues (O(n) - n is the total number of editors on this form)
		getValues: function(){
			var vals = {};
			this.regionManager.each(function(region){
				if(region.currentView && region.currentView.getValues){
					_.extend(vals, region.currentView.getValues());
				}
			});
			return vals;
		},

		//2. setValues (O(n) - n is the total number of editors on this form)
		setValues: function(vals, loud){
			this.regionManager.each(function(region){
				if(region.currentView && region.currentView.setValues){
					region.currentView.setValues(vals, loud);
				}
			});
		},

		//3. validate
		validate: function(show){
			var errors = {};
			this.regionManager.each(function(region){
				if(region.currentView && region.currentView.validate){
					_.extend(errors, region.currentView.validate(show));
				}
			});
			if(_.size(errors) === 0) return;
			return errors; 
		}

	});


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
							this[r].$el.html('<p class="alert">Region <strong>' + r + '</strong></p>'); //give it a fake one.
							this[r].listenTo(this[r], 'region:load-view', function(name){
								if(!name) return;
								var View = Backbone.Marionette.Layout.Views[name];
								if(View)
									this.show(new View());
								else
									throw new Error('DEV::Layout::View required ' + name + ' can NOT be found...use app.create(\'Regional\', {name: ..., ...}).');
							});
							this[r].trigger('region:load-view', this[r].$el.attr('view')); //found corresponding View def.

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
			var View = Marionette[options.type || 'Layout'].extend(options);
			if(options.name)
				this.Views[options.name] = View;
			//no name means to use it anonymously, which in turn creates it right away.
			else return new View();
			return View;
		}		
	});	

})(Application);