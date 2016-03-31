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
 * @update 2015.11.03 (-form nesting on regions)
 * @update 2015.11.11 (+getViewIn('region'))
 * @update 2015.12.15 (navRegion chaining on region:show instead)
 * @update 2016.02.05 (close*(_cb) for region closing effect sync)
 */

;(function(app){

	//+ api view.getViewIn('region')
	_.extend(Backbone.Marionette.Layout.prototype, {
		getViewIn: function(region){
			var r = this.getRegion(region);
			if(!r)
				throw new Error('DEV::Layout+::getViewIn() Region ' + region + ' is not available...');
			return r && r.currentView;
		},

		// Handle closing regions, and then close the view itself.
		// *Taking care of closing effect sync (reported on 'item:closed')
		close: function(_cb) {
		    if (this.isClosed) {
		    	_cb && _cb();
		        return;
		    }
		    this.regionManager.close(_.bind(function(){
		    	Marionette.ItemView.prototype.close.apply(this, arguments);
		    	_cb && _cb();
		    }, this));
		},

		//add more items into a specific region
		more: function(region /*name only*/, data /*array only*/, View /*or name*/, replace /*use set() instead of add, also reconsider View*/){
			if(!_.isArray(data))
				throw new Error('DEV::Layout+::more() You must give an array as data objects...');
			//accept plain array of strings and numbers. (only in this function)
			var d;
			if(data && !_.isObject(data[0]))
				d = _.map(data, function(v){return {'value': v};});
			else
				d = data;
			////////////////////////////////////////
			
			if(_.isBoolean(View)){
				replace = View;
				View = undefined;
			}

			var cv = this.getViewIn(region);
			if(replace && View)
				cv.itemView = _.isString(View)? app.get(View) : View;
			if(cv && cv.collection){
				if(replace)
					cv.set(d);
				else
					cv.collection.add(d);
			}
			else {
				this.getRegion(region).show(app.view({
					forceViewType: true,
					type: 'CollectionView',
					itemView: _.isString(View)? app.get(View) : View, //if !View then Error: An `itemView` must be specified
				}));//to support 'action-scroll' in region.
				this.getViewIn(region).set(d);
			}
		},

		//lock or unlock a region with overlayed spin/view (e.g waiting)
		lock: function(region /*name only*/, flag /*true or false*/, View /*or icon name for .fa-spin or {object for overlay configuration}*/){
			//check whether region is a string
			if (typeof(region) !== 'string') {
			    View = flag;
			    flag = region;
			    region = '';
			}
			//check whether we have flag parameter
			if( !_.isBoolean(flag) ){
				View = flag;
				flag = true;
			}
			//make the overlay view, check View is object or a string
			var $anchor = (region === '')? this.$el : 
				(this.getViewIn(region))? this.getViewIn(region).$el : this.getRegion(region).$el;

			if(flag){//flag = true
				if( _.isFunction(View) ){//view
					$anchor.overlay({
						content: (new View()).render().$el,
						effect: false
					});
				}else if( _.isPlainObject(View) ){//plain object as overlay option
					View.effect = View.effect || false;
					$anchor.overlay(View);
				}else{//spin icon
					$anchor.overlay({
						content: '<div class="lock-spinner"><i class="' + View + '"></i></div>',
						effect: false
					});
				}
			}else{//flag = false
				$anchor.overlay();
			}
		},
	});

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
			
			//hornor layout configuration through $.split plug-in
			if(this.layout)
				this.listenToOnce(this, 'before:render', function(){
					$(this).split(_.result(this, 'layout'));
				});
			
			//find region marks after 1-render
			this.listenToOnce(this, 'render', function(){
				var that = this;
				//a. named regions (for dynamic navigation)
				this.$el.find('[region]').each(function(index, el){
					var r = $(el).attr('region');
					//that.regions[r] = '[region="' + r + '"]';
					that.regions[r] = {
						selector: '[region="' + r + '"]'
					};
				});
				//b. anonymous regions (for static view nesting)
				this.$el.find('[view]').each(function(index, el){
					var $el = $(el);
					if($el.attr('region')) return; //skip dynamic regions (already detected)

					var r = $el.attr('view');
					that.regions[_.uniqueId('anonymous-region-')] = {
						selector: '[view="' + r + '"]'
					};
				});
				this.addRegions(this.regions); //rely on M.Layout._reInitializeRegions() in M.Layout.render();
			});

			//Giving region the ability to show a registered View/Widget or @remote.tpl.html through event 'region:load-view' (name [,options])
			this.listenTo(this, 'render', function(){
				_.each(this.regions, function(selector, region){
					//ensure region and container style
					this[region].ensureEl();
					this[region].$el.addClass('region region-' + _.string.slugify(region));
					this[region]._parentLayout = this;

					//+
					this[region].listenTo(this[region], 'region:load-view', function(name, options){ //can load both view and widget.
						if(!name) return;

						//Template mockups?
						if(_.string.startsWith(name, '@')){
							this.show(app.view({
								template: name,
							}));
							return;
						}

						//Reusable view?
						var Reusable = app.get(name, _.isPlainObject(options)?'Widget':'');
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
			//Note: 'all-region-shown' will sync on 'region:show' which in turn wait on enterEffects before sub-region 'view:show';
			this.listenTo(this, 'show view:data-rendered', function(){
				var pairs = [];
				_.each(this.regions, function(selector, r){
					if(this.debug) this[r].$el.html('<p class="alert alert-info">Region <strong>' + r + '</strong></p>'); //give it a fake one.
					var viewName = this[r].$el.attr('view');
					if(viewName) //found in-line View name.
						pairs.push({region: r, name: viewName}); 
				}, this);
				if(!pairs.length)
					return this.trigger('view:all-region-shown');

				var callback = _.after(pairs.length, _.bind(function(){
					this.trigger('view:all-region-shown');
				}, this));
				_.each(pairs, function(p){
					this[p.region].on('show', callback);
					this[p.region].trigger('region:load-view', p.name);
				}, this);
				
			});

			//supporting the navigation chain if it is a named layout view with valid navRegion (context, regional, ...)
			if(this.name){
				this.navRegion = options.navRegion || this.navRegion;
				//if(this.navRegion)
				this.onNavigateChain = function(pathArray, old){
					if(!pathArray || pathArray.length === 0){
						if(!old)
							this.trigger('view:navigate-to');//use this to show the default view
						else {
							if(this.navRegion) this.getRegion(this.navRegion).close();
						}
						return;	
					}

					if(!this.navRegion) return this.trigger('view:navigate-to', pathArray.join('/'));

					if(!this.regions[this.navRegion]){
						console.warn('DEV::Layout+::onNavigateChain()', 'invalid navRegion', this.navRegion, 'in', this.name);
						return;
					}
					
					var targetViewName = pathArray.shift();
					var TargetView = app.get(targetViewName);

					if(TargetView){
						var navRegion = this.getRegion(this.navRegion);
						if(!navRegion.currentView || TargetView.prototype.name !== navRegion.currentView.name){
							//new
							var view = new TargetView();
							if(navRegion.currentView) navRegion.currentView.trigger('view:navigate-away');
							
							//chain on region:show (instead of view:show to let view use onShow() before chaining)
							navRegion.once('show', function(){
								view.trigger('view:navigate-chain', pathArray);
							});	
							navRegion.show(view);
							return;
						}else{
							//old
							navRegion.currentView.trigger('view:navigate-chain', pathArray, true);
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