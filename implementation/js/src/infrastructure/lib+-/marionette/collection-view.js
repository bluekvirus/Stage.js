/**
 * Marionette.CollectionView Enhancements (can be used in CompositeView as well)
 *
 * 1. Render with data 
 * 		view:render-data, view:data-rendered
 * 		
 * 2. Pagination, Filtering, Sorting support
 * 		view:load-page, view:page-changed
 * 		
 * 		TBI: 
 * 		view:sort-by, view:filter-by
 *
 * @author Tim Lauv
 * @created 2014.04.30
 * @updated 2016.02.10
 */

;(function(app){

	/**
	 * Meta-event Listeners (pre-defined)
	 * view:render-data
	 * view:load-page
	 */
	_.extend(Backbone.Marionette.CollectionView.prototype, {

		// Handle cleanup and other closing needs for
		// the collection of views.
		close: function(_cb) {
		    if (this.isClosed) {
		    	_cb && _cb();
		        return;
		    }

		    this.triggerMethod("collection:before:close");
		    this.closeChildren(_.bind(function(){
			    //triggers 'close' before BB.remove() --> stopListening
			    Marionette.View.prototype.close.apply(this, arguments);
			    this.triggerMethod("collection:closed"); //align with ItemView
			    _cb && _cb();
		    }, this));
		},

		// Close the child views that this collection view
		// is holding on to, if any
		closeChildren: function(_cb) {
			if(!_.size(this.children))
				_cb && _cb();
			else {
				var callback = _.after(_.size(this.children), function(){
					_cb && _cb();
				});
			    this.children.each(function(child) {
			        this.removeChildView(child, callback);
			    }, this);
			    //this.checkEmpty();
			}
		},

		// Remove the child view and close it
		removeChildView: function(view, _cb) {

		    // shut down the child view properly,
		    // including events that the collection has from it
		    if (view) {
		        // call 'close' or 'remove', depending on which is found
		        if (view.close) {
		            view.close(_.bind(function(){
				        this.stopListening(view);
				        this.children.remove(view);
				        this.triggerMethod("item:removed", view);
				        _cb && _cb();
		            }, this));
		        } else if (view.remove) {
		            view.remove();
			        this.stopListening(view);
			        this.children.remove(view);
			        this.triggerMethod("item:removed", view);
			        _cb && _cb();
		        }
		    }
		},

		// Render the child item's view and add it to the
		// HTML for the collection view.
		addItemView: function(item, ItemView, index) {
		    // get the itemViewOptions if any were specified
		    var itemViewOptions = Marionette.getOption(this, "itemViewOptions");
		    if (_.isFunction(itemViewOptions)) {
		        itemViewOptions = itemViewOptions.call(this, item, index);
		    }

		    // build the view
		    var view = this.buildItemView(item, ItemView, itemViewOptions);
		    //+parentCt & parentRegion fix to align with framework view (Layout)
		    view.parentRegion = this.parentRegion;
		    if (this._moreItems === true)
		    //.more()-ed items will bypass this CollectionView and use 'grand parent' as parentCt.
		        view.parentCt = this.parentCt;
		    else
		        view.parentCt = this;

		    // set up the child view event forwarding
		    this.addChildViewEventForwarding(view);

		    // this view is about to be added
		    this.triggerMethod("before:item:added", view);

		    // Store the child view itself so we can properly
		    // remove and/or close it later
		    this.children.add(view);

		    // Render it and show it
		    this.renderItemView(view, index);

		    // call the "show" method if the collection view
		    // has already been shown
		    if (this._isShown && !this.isBuffering) {
		        if (_.isFunction(view.triggerMethod)) {
		            view.triggerMethod('show');
		        } else {
		            Marionette.triggerMethod.call(view, 'show');
		        }
		    }

		    // this view was added
		    this.triggerMethod("after:item:added", view);

		    return view;
		},

		/////////////////////////////
		onRenderData: function(data){
			this.set(data);
		},

		//no refresh() yet (auto data-url fetch in item-view.js)
		set: function(data, options){
			if(!_.isArray(data)) throw new Error('DEV::CollectionView+::set() You need to have an array passed in as data...');
			
			if(!this.collection){
				this.collection = app.collection();
				this._initialEvents(); //from M.CollectionView
			}
			
			if(options && _.isBoolean(options))
				this.collection.reset(data);
			else 
				this.collection.set(data, options);
			//align with normal view's data rendered and ready events notification
			this.trigger('view:data-rendered');
			this.trigger('view:ready');
			return this;
		},

		get: function(idCidOrModel){
			if(!idCidOrModel)
				return this.collection && this.collection.toJSON();
			return this.collection && this.collection.get(idCidOrModel);
		},
		///////////////////////////////////////////////////////////////////////////
		/**
		 * Note that view:load-page will have its options cached in this._remote
		 *
		 * To reset: (either)
		 * 1. clear this._remote
		 * 2. issue overriding options (including the options for app.remote())
		 */
		onLoadPage: function(options){
			options = _.extend({
				page: 1,
				pageSize: 15,
				dataKey: 'payload',
				totalKey: 'total',
				params: {},
				//+ app.remote() options
			}, this._remote, options);

			//merge pagination ?offset=...&size=... params/querys into app.remote options
			_.each(['params', 'querys'], function(k){
				if(!options[k]) return;

				_.extend(options[k], {
					offset: (options.page -1) * options.pageSize,
					size: options.pageSize
				});
			});

			var that = this;
			//store pagination status for later access
			this._remote = options;

			//allow customized page data processing sequence, but provides a default (onLoadPageDone).
			app.remote(_.omit(options, 'page', 'pageSize', 'dataKey', 'totalKey'))
				.done(function(){
					that.trigger('view:load-page-done', arguments);
				})
				.fail(function(){
					that.trigger('view:load-page-fail', arguments);
				})
				.always(function(){
					that.trigger('view:load-page-always', arguments);
				});
		},

		onLoadPageDone: function(args){
			var result = args[0];
			//render this page:
			this.set(result[this._remote.dataKey]);
			//signal other widget (e.g a paginator widget)
			this.trigger('view:page-changed', {
				current: this._remote.page,
				total: Math.ceil(result[this._remote.totalKey]/this._remote.pageSize), //total page-count
			});
		}
	});

})(Application);