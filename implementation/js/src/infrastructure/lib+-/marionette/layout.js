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
 * @update 2016.02.05 (close*(_cb) for region closing effect sync)
 * @update 2016.12.12 (-'region:load-view' moved to region.js)
 * @update 2017.03.22 (*[region=/view=] pickup after 'view:data-rendered')
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
			r.trigger('region:load-view', View, options);
			return r.currentView;
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
			if (!cv) {
			    this.getRegion(region).show(app.view({
			        forceViewType: true,
			        type: 'CollectionView',
			        itemView: _.isString(View) ? app.get(View) : View, //if !View then Error: An `itemView` must be specified
			        childView: _.isString(View) ? app.get(View) : View
			    })); //to support 'action-scroll' in region.
			    cv = this.getViewIn(region);
			    cv._moreItems = true; //set parentCt bypass mode for items (see collection-view:buildItemView);
			}
			if (replace && View)
			    cv.itemView = _.isString(View) ? app.get(View) : View;
			if (cv.collection) {
			    if (replace)
			        cv.collection.reset(d);
			    else
			        cv.collection.add(d);
			} else
				cv.set(d);
		},

		less: function(region /*name only*/, start /*start index for removing*/, size /*total number of records to remove*/){

			//check whether region is provided
			if(!region || !_.isString(region)){
				throw new Error('DEV::Layout+::less() region is not provided or region is not a string...');
			}

			//check whether start and size both exists
			if((start !== 0 && !start) && !size){
				throw new Error('DEV::Layout+::less() You must provide at least the size of the records you want to delete...');
			}

			//if there is only one number, consider it as size and start from index 0
			if(!size){
				size = start;
				start = 0;
			}

			//check whether start and size are numbers
			if(!_.isNumber(start) || !_.isNumber(size)){
				throw new Error('DEV::Layout+::less() start and size must all in the form of numbers');
			}

			//get view from the given region
			var cv = this.getViewIn(region);

			if(!cv){
				console.warn('DEV::Layout+::less() there is no collection view in the given region...');
				return;
			}else{

				//fetch data in the current model
				var current = cv.get();

				//check if start and size are valid
				if( (start + size) > current.length ){
					throw new Error('DEV::Layout+::less() start and size excceeds the length of the current data...');
				}

				//Caveat: cannot use Array.prototype.slice() here, since it only returns a shallow copy of the object elements.
				var modified = _.compact(_.map(current, function(d, index){ if(index >= start && index < start + size ){ cv.removeChildView(cv.children.findByIndex(index)); return false; } else return d; }));

				//reset collectview's data with silent true for not having the view re-render again
				cv.set(modified, {silent: true});
			}

		},

		//activate (by tabId) a tab view (other tabbed views are not closed)
		tab: function(region /*name only*/ , View /*or template or name or instance or false for tab remove or tabId for activation*/ , tabId) {
		    if (tabId === undefined) {
		        tabId = View;
		        View = undefined;
		    }
		    if (tabId === undefined)
		        throw new Error('DEV::Layout+::tab() tabId is required...');

		    var cv = this.getViewIn(region);
		    if (!cv || !cv._tabbedViewWrapper) {
		        //create a place-holder parent view containing 1 region (region-tabId)
		        this.show(region, '<span style="display:none;">tabbed regions wrapper view</span>');
		        cv = this.getViewIn(region);
		        cv._tabbedViewWrapper = true;
		        //add getTab api to view
		        this.getViewFromTab = function(tabId) {
		            return cv.getViewIn('tab-' + tabId);
		        };
		        var that = this;
		        cv.once('ready', function() {
		            switchTab(that); //fake 'data-rendered' event for no-data view (cv) will refresh regions, so wait for 'ready'
		        });
		    } else
		        switchTab(this);

		    function switchTab(scope) {
		        //if View is set to false, remove tab (region & view)
		        if (View === false) {
		            cv.removeRegion('tab-' + tabId); //this will in turn close() that tab region
		            scope.trigger('view:tab-removed', tabId);
		            return;
		        }

		        //if there is no View supplied, activate tab only (hide all first)
		        _.each(cv.regions, function(opt, r) {
		            cv.getRegion(r).$el.hide();
		        });

		        //see if we have this tabId in the wrapper view already
		        var rname = 'tab-' + tabId;
		        var tabRegion = cv.getRegion(rname);
		        if (!tabRegion) {
		            //No, create a tab region using the tabId, then show() the given View on it
		            cv.$el.append('<div region="' + rname + '"></div>');
		            tabRegion = cv.addRegion(rname, { selector: '[region="' + rname + '"]' });
		            tabRegion.ensureEl(scope); //re-bind tabRegions's parentCt
		            cv.show(rname, View); //view will pick up tabRegion's parentCt
		            scope.getViewFromTab(tabId).parentRegion = cv.parentRegion; //re-bind tabRegions's parentRegion.
		            scope.listenToOnce(scope.getViewFromTab(tabId), 'ready', function() {
		                scope.trigger('view:tab-added', tabId);
		                scope.trigger('view:tab-activated', tabId);
		            });
		        } else {
		            //Yes, display the specific tab region (ignore the View param even if it is given)
		            tabRegion.$el.show();
		            _.defer(function() {
		                scope.trigger('view:tab-activated', tabId);
		            });
		        }
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

		//spray like app.spray but use this view as parentCt for $anchor region
		spray: function($anchor, View /*or template or name or instance or options or svg draw(paper){} func */, options){
			return app.spray($anchor, View, options, this);
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
					var $el = this.$el, //use View.$el to trigger jQuery plugin $.fn.flexlayout()
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

					//replace special html string as nested tpl inserted by $.flexlayout (:#id, :@tpl.html, :@doc.md)
					$el.find('div').map(function(){
						var nestedTplId = $(this).html();
						var tplCache;
						if(nestedTplId){
							tplCache = app.Util.Tpl.get(nestedTplId, true);
							if(tplCache)
								$(this).html(tplCache);
						}
					});
					//assign $el.html() back to .template for proper render() with data
					var templateId = JSON.stringify(this.layout);
					if(!app.Util.Tpl.has(templateId))
						app.Util.Tpl.build(templateId, $el.html());
					this.template = templateId;
				});
			
			//Automatically shows the region's view="" attr indicated View or @*.html/*.md
			//Note: call render() to re-render a view will not re-render the regions. use .set() or .show() will.
			//Note: 'ready' will sync on 'region:show' which in turn wait on enterEffects before sub-region 'view:show';
			//Note: 'show' doesn't mean 'view:data-rendered' or further 'ready'. Data render only starts after 'show';
			//Note: [region=] and [view=] pickup happens only after 'view:data-rendered', view without data has a fake 'view:data-rendered' e;
			this.listenTo(this, 'view:data-rendered', function(){
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
				//**Note**: You need to call .ensureEl(view) explicitly if manually made an explicit call to .addRegion();

				var pairs = [];
				_.each(this.regions, function(def, r){
					//+metadata to region (align the normally rendered regions with .tab()/.spray()/app.icing added regions for +.parentCt)
					this.getRegion(r).ensureEl(this);
					if(this.debug) this.getRegion(r).$el.html('<p class="alert alert-info">Region <strong>' + r + '</strong></p>'); //give it a debugging placeholder content.
					var viewName = this.getRegion(r).$el.attr('view');
					if(viewName) //found in-line View name.
						pairs.push({region: r, name: viewName}); 
				}, this);
				if(!pairs.length)
					return this.triggerMethodInversed('ready');

				var callback = _.after(pairs.length, _.bind(function(){
					this.triggerMethodInversed('ready');;
				}, this));
				_.each(pairs, function(p){
					this[p.region].once('ready', callback);
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

					//last view in the navi chain, the end!
					if(!pathArray || pathArray.length === 0){
						if(!old){
							delete app._navViewConfig;
						}
						else {
							if(this.navRegion) this.getRegion(this.navRegion).close();
						}
						this.trigger('view:navigate-to', '', viewConfig); //use this to show the default view ([] is true, so we signal '')
						app.coop('navigation-changed', app.navPathArray());						
						return;	
					}

					//no navRegion for putting next view on, stop to chain!
					if(!this.navRegion){
						delete app._navViewConfig;
						this.trigger('view:navigate-to', _.clone(pathArray), viewConfig);
						app.coop('navigation-changed', app.navPathArray());
						return;
					}

					if(!this.regions[this.navRegion]){
						//TBD: throw new Error() instead of just warn()?
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
							view.trigger('view:before-navigate-to', _.clone(pathArray));
							view.once('close', function(){
								this.trigger('view:navigate-away');
							});
							
							//chain on region:show (instead of view:show to let view finish 'show'ing effects before chaining)
							view.on('ready', function(){
								view.trigger('view:navigate-chain', pathArray);
							});	
							navRegion.show(view);
							return;
						}else{
							//old
							navRegion.currentView.trigger('view:navigate-chain', pathArray, true);
						}

					//can't find the view to put in navRegion, stop the chain!
					}else{
						pathArray.unshift(targetViewName);
						delete app._navViewConfig;
						this.trigger('view:navigate-to', _.clone(pathArray), viewConfig);
						app.coop('navigation-changed', app.navPathArray());
						return;
					}

				};
			}								

			return Old.prototype.constructor.call(this, options);
		},	
	});	

})(Application);