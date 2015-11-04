/**
 * Enhancing the Marionette.Layout Definition to auto detect regions and regional views through its template.
 *
 *
 * Fixed
 * -----
 * auto region detect and register by region="" in template
 * auto regional view display by attribute view="" in template (+@mockup.html)
 * change a region's view by trigger 'region:load-view' on that region, then give it a view name. (registered through B.M.Layout.regional() or say app.create('Regional', ...))
 * 
 * 
 * Experimental (removed)
 * ------------
 * default getValues/setValues and validate() method supporting editors value collection and verification
 *
 *
 * @author Tim Lauv
 * @create 2014.02.25
 * @update 2014.07.15 (+chainable nav region support)
 * @update 2014.07.28 (+view="@mockup.html" support)
 * @update 2015.11.03
 */

;(function(app){

	/**
	 * Instrument this Layout in case it is used as a Form container.
	 * 1. getValues() * - collects values from each region; grouped by fieldset name used by the regional form view piece;
	 * 2. setValues(vals) * - sets values to regions; fieldset aware;
	 * 3. validate(show) * - validate all the regions;
	 * 4. getEditor(pathname) * - dotted path name to find your editor;
	 * 5. status(options) - set status messages to the fieldsets and regions;
	 * Note that after validation(show:true) got errors, those editors will become eagerly validated, it will turn off as soon as the user has input-ed the correct value.
	 * 
	 * Not implemented: button action implementations, you still have to code your button's html into the template.
	 * submit
	 * reset
	 * refresh
	 * cancel
	 *
	 * No setVal getVal
	 * ----------------
	 * Use getEditor(a.b.c).set/getVal()
	 *


	_.extend(Backbone.Marionette.Layout.prototype, {

		//1. getValues (O(n) - n is the total number of editors on this form)
		getValues: function(){
			var vals = {};
			this.regionManager.each(function(region){
				if(region.currentView && region.currentView.getValues){
					if(region.currentView.fieldset)
						vals[region.currentView.fieldset] = region.currentView.getValues();
					else
						_.extend(vals, region.currentView.getValues());
				}
			});
			return vals;
		},

		//2. setValues (O(n) - n is the total number of editors on this form)
		setValues: function(vals, loud){
			this.regionManager.each(function(region){
				if(region.currentView && region.currentView.setValues){
					if(region.currentView.fieldset){
						region.currentView.setValues(vals[region.currentView.fieldset], loud);
					}
					else
						region.currentView.setValues(vals, loud);
				}
			});
		},

		//3. validate
		validate: function(show){
			var errors = {};
			this.regionManager.each(function(region){
				if(region.currentView && region.currentView.validate){
					if(region.currentView.fieldset){
						errors[region.currentView.fieldset] = region.currentView.validate(show);
					}
					else
						_.extend(errors, region.currentView.validate(show));
				}
			});
			if(_.size(errors) === 0) return;
			return errors; 
		},

		// 4. getEditor - with dotted pathname
		getEditor: function(pathname){
			if(!pathname || _.isEmpty(pathname)) return;
			if(!_.isArray(pathname))
				pathname = String(pathname).split('.');
			var fieldset = pathname.shift();
			if(this._fieldsets && this._fieldsets[fieldset])
				return this._fieldsets[fieldset].getEditor(pathname.join('.'));
			return;
		},
		

		// 5. status (options will be undefined/false or {..:.., ..:..})
		status: function(options){
			this.regionManager.each(function(region){
				if(region.currentView && region.currentView.status){
					if(!options || !region.currentView.fieldset)
						region.currentView.status(options);
					else
						region.currentView.status(options[region.currentView.fieldset]);
				}
			});
		}

	});
	 */

	/**
	 * Fixed behavior overridden. 
	 *
	 * Using standard Class overriding technique to change Backbone.Marionette.Layout 
	 * (this is different than what we did for Backbone.Marionette.View)
	 */
	var Old = Backbone.Marionette.Layout;
	Backbone.Marionette.Layout = Old.extend({

		constructor: function(options){
			options = options || {};

			this.regions = _.extend({}, this.regions, options.regions);
			//find region marks after rendering and ensure region.$el (to support dynamic template)
			this.listenTo(this, 'render', function(){
				var that = this;
				$(this.el.outerHTML).find('[region]').each(function(index, el){
					var r = $(el).attr('region');
					//that.regions[r] = '[region="' + r + '"]';
					that.regions[r] = {
						selector: '[region="' + r + '"]'
					};
				});
				this.addRegions(this.regions);     						
				_.each(this.regions, function(selector, region){
					this[region].ensureEl();
					this[region].$el.addClass('region region-' + _.string.slugify(region));
					this[region]._parentLayout = this;
					this[region]._contentOverflow = {};
					_.each(['overflowX', 'overflowY', 'overflow'], function(oKey){
						var oVal = this[region].$el.data(oKey);
						if(oVal) this[region]._contentOverflow[oKey] = oVal;
					}, this);
				},this);
			});

			//Giving region the ability to show a registered View/Widget or @remote.tpl.html through event 'region:load-view' (name [,options])
			this.listenTo(this, 'render', function(){
				_.each(this.regions, function(selector, r){
					this[r].listenTo(this[r], 'region:load-view', function(name, options){ //can load both view and widget.
						if(!name) return;

						//Template mockups?
						if(_.string.startsWith(name, '@')){
							this.show(app.view({
								template: name,
							}, true));
							return;
						}

						//Reusable view?
						var Reusable = app.get(name, _.isPlainObject(options)?'Widget':'View');
						if(Reusable){
							//Caveat: don't forget to pick up overridable func & properties from options in your Widget.
							this.show(new Reusable(options));
							return;
						}						

						console.warn('DEV::Layout+::region:load-view View required ' + name + ' can NOT be found...use app.view({name: ..., ...}).');
					});
					
				},this);
			});

			//Automatically shows the region's view="" attr indicated View or @remote.tpl.html
			//Note: re-render a view will not re-render the regions. use data change or .show() will.
			this.listenTo(this, 'show view:data-rendered', function(){
				_.each(this.regions, function(selector, r){
					if(this.debug) this[r].$el.html('<p class="alert alert-info">Region <strong>' + r + '</strong></p>'); //give it a fake one.
					this[r].trigger('region:load-view', this[r].$el.attr('view')); //found corresponding View def.
				}, this);
				this.trigger('view:all-region-shown');
			});

			//supporting the navigation chain if it is a named layout view with valid navRegion (context, regional, ...)
			if(options.name || this.name){
				this.navRegion = options.navRegion || this.navRegion;
				//if(this.navRegion)
				this.onNavigateChain = function(pathArray){
					if(!pathArray || pathArray.length === 0){
						this.trigger('view:navigate-to');//use this to show the default view
						return;	
					} 

					if(!this.navRegion) return this.trigger('view:navigate-to', pathArray.join('/'));

					if(!this.regions[this.navRegion]){
						console.warn('DEV::Layout+::onNavigateChain()', 'invalid navRegion', this.navRegion, 'in', this.name || options.name);
						return;
					}
					
					var targetViewName = pathArray.shift();
					var TargetView = app.get(targetViewName, 'View');

					if(TargetView){
						var navRegion = this.getRegion(this.navRegion);
						if(!navRegion.currentView || TargetView.prototype.name !== navRegion.currentView.name){
							//new
							var view = new TargetView();
							if(navRegion.currentView) navRegion.currentView.trigger('view:navigate-away');
							
							//note that .show() might be async due to region enter/exit effects
							view.once('show', function(){
								view.trigger('view:navigate-chain', pathArray);
							});	
							navRegion.show(view);
							return;
						}else{
							//old
							navRegion.currentView.trigger('view:navigate-chain', pathArray);
						}


					}else{
						pathArray.unshift(targetViewName);
						return this.trigger('view:navigate-to', pathArray.join('/'));	
					}

				};
			}								

			return Old.prototype.constructor.call(this, options);
		},	
	});	

})(Application);