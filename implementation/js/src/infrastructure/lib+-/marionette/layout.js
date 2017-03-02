/**
 * Enhancing the Marionette.Layout Definition to auto detect regions and regional views through its template.
 *
 *
 * Fixed
 * -----
 * auto region detect and register by region="" in template
 * auto regional view display by attribute view="" in template (+@mockup.html)
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
 * @update 2016.12.12 (-'region:load-view' moved to region.js)
 */

;(function(app){

	//+api view.getViewIn('region')
	_.extend(Backbone.Marionette.Layout.prototype, {
		
		//overriding view.close() to support:
		//	closing 1 specific region by ('name').
		//	handle closing regions, and then close the view itself.
		//	taking care of closing effect sync (reported on 'item:closed')
		close: function(_cb /*or region name*/){
			if(_.isString(_cb)){
				var region = this.getRegion(_cb);
				return region && region.close();
			}
		    if(this.isClosed){
		    	_cb && _cb();
		        return;
		    }
		    this.regionManager.close(_.bind(function(){
		    	Marionette.ItemView.prototype.close.apply(this, arguments);
		    	_cb && _cb();
		    }, this));
		},

		//overriding addRegion to add newly added region to this.regions
		// Add a single region, by name, to the layout
		addRegion: function(name, definition) {
		  var regions = {};
		  this.regions[name] = regions[name] = definition;
		  return this._buildRegions(regions)[name];
		},

		//get a view instance in given region
		getViewIn: function(region){
			var r = this.getRegion(region);
			if(!r)
				throw new Error('DEV::Layout+::getViewIn() Region ' + region + ' is not available...');
			return r && r.currentView;
		},

		//allow a .region.show() shortcut through .show('region', ...)
		show: function(region /*name only*/, View /*or template or name or instance*/, options){
			var r = this.getRegion(region);
			if(!r)
				throw new Error('DEV::Layout+::show() Region ' + region + ' is not available...'); 
			return r.trigger('region:load-view', View, options);
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
				this.getViewIn(region)._moreItems = true; //set parentCt bypass mode for items (see collection-view:buildItemView);
				this.getViewIn(region).set(d);
			}
		},

		//activate (by tabId) a tab view (other tabbed views are not closed)
		tab: function(region /*name only*/, View /*or template or name or instance or false for tab remove*/, tabId /*required*/){
			if(tabId === undefined){
				tabId = View;
				View = undefined;
			}
			if(tabId === undefined)
				throw new Error('DEV::Layout+::tab() tabId is required...');

			var cv = this.getViewIn(region);
			if(!cv || !cv._tabbedViewWrapper){
				//create a place-holder parent view containing 1 region (region-tabId)
				this.show(region, '<span style="display:none;">tabbed regions wrapper view</span>');
				cv = this.getViewIn(region);
				cv._tabbedViewWrapper = true;
				//add getTab api to view
				this.getViewFromTab = function(tabId){
					return cv.getViewIn(tabId);
				}
			}

			//if View is set to false, remove tab (region & view)
			if(View === false){
				cv.removeRegion(tabId); //this will in turn close() that tab region
				this.trigger('view:tab-removed', tabId);
				return;
			}

			//if there is no View supplied, activate tab only (hide all first)
			_.each(cv.regions, function(opt, r){
				cv.getRegion(r).$el.hide();
			});

			//see if we have this tabId in the wrapper view already
			var tabRegion = cv.getRegion(tabId);
			if(!tabRegion){
				//No, create a tab region using the tabId, then show() the given View on it
				cv.$el.append('<div region="tab-' + tabId + '"></div>');
				cv.addRegion(tabId, {selector: '[region="tab-' + tabId + '"]'});
				cv.show(tabId, View);
				tabRegion = cv.getRegion(tabId);
				tabRegion._parentLayout = this;//skip wrapper view
				tabRegion.$el.addClass('region region-tab-' + tabId);//experimental
				this.trigger('view:tab-added', tabId);
			}else {
				//Yes, display the specific tab region (show one later)
				tabRegion.$el.show();
			}
			this.trigger('view:tab-activated', tabId);
		},

		//spray like app.spray but use this view as parentCt for $anchor region
		spray: function($anchor, View /*or template or name or instance or options or svg draw(paper){} func */, options){
			return app.spray($anchor, View, options, this);
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
			if(!_.isBoolean(flag)){
				View = flag;
				flag = true;
			}
			//make the overlay view, check View is object or a string
			var $anchor = (region === '')? this.$el : 
				(this.getViewIn(region))? this.getViewIn(region).$el : this.getRegion(region).$el;

			if(flag){//flag = true
				if(_.isFunction(View)){//view
					$anchor.overlay({
						content: (new View()).render().$el,
						effect: false
					});
				}else if(_.isPlainObject(View)){//plain object as overlay option
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
					var $el = this.$el, //use View.$el to trigger jQuery plugin
						_layoutConig = [];
					if(_.isArray(this.layout)){
						//this.layout is an array
						$el.flexlayout(_.result(this, 'layout'));
					}else if(_.isPlainObject(this.layout)){
						//this.layout is an object
						_layoutConig = this.layout.split;
						$el.flexlayout(_layoutConig, _.result(this, 'layout'));
					}else
						throw new Error('DEV::Layout+::layout can only be an array or an object.');
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

			//+metadata to region (already aligned these with this.tab() created regions)
            this.listenTo(this, 'render', function(){
                _.each(this.regions, function(def, region){
                    //ensure region and container style
                    this[region].ensureEl();
                    this[region].$el.addClass('region region-' + _.string.slugify(region));
                    this[region]._parentLayout = this;
                }, this);
            });

			//Automatically shows the region's view="" attr indicated View or @*.html/*.md
			//Note: re-render a view will not re-render the regions. use .set() or .show() will.
			//Note: 'all-region-shown' will sync on 'region:show' which in turn wait on enterEffects before sub-region 'view:show';
			//Note: 'show' and 'all-region-shown' doesn't mean 'data-rendered' thus 'ready'. Data render only starts after 'show';
			this.listenTo(this, 'show view:data-rendered', function(){
				var pairs = [];
				_.each(this.regions, function(def, r){
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
					//retrieve nav (last in path) view config
					var viewConfig = app._navViewConfig;

					if(!pathArray || pathArray.length === 0){
						if(!old){
							delete app._navViewConfig;
							this.trigger('view:navigate-to', '', viewConfig);//use this to show the default view
						}
						else {
							if(this.navRegion) this.getRegion(this.navRegion).close();
						}
						return;	
					}

					if(!this.navRegion){
						delete app._navViewConfig;
						return this.trigger('view:navigate-to', pathArray.join('/'), viewConfig);
					}

					if(!this.regions[this.navRegion]){
						console.warn('DEV::Layout+::onNavigateChain()', 'invalid navRegion', this.navRegion, 'in', this._name);
						return;
					}
					
					var targetViewName = pathArray.shift();
					var TargetView = app.get(targetViewName);

					if(TargetView){
						var navRegion = this.getRegion(this.navRegion);
						if(!navRegion.currentView || TargetView.prototype.name !== navRegion.currentView.name){
							//new
							var view = TargetView.create();
							view.trigger('view:before-navigate-to');
							
							if(navRegion.currentView) navRegion.currentView.trigger('view:navigate-away');
							
							//chain on region:show (instead of view:show to let view finish 'show'ing effects before chaining)
							view.once('ready', function(){
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
						delete app._navViewConfig;
						return this.trigger('view:navigate-to', pathArray.join('/'), viewConfig);	
					}

				};
			}								

			return Old.prototype.constructor.call(this, options);
		},	
	});	

})(Application);