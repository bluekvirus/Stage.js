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
 * @author Tim.Liu
 * @created 2014.04.30
 */

;(function(app){

	/**
	 * Meta-event Listeners (pre-defined)
	 * view:render-data
	 * view:load-page
	 */
	_.extend(Backbone.Marionette.CollectionView.prototype, {

		/////////////////////////////
		onRenderData: function(data){

			if(!_.isArray(data)) throw new Error('DEV::CollectionView+::You need to have an array passed in as data...');
			
			if(!this.collection){
				this.collection = new Backbone.Collection();
				this.listenTo(this.collection, 'add', this.addChildView);
				this.listenTo(this.collection, 'remove', this.removeItemView);
				this.listenTo(this.collection, 'reset', this.render);
			}
			this.collection.reset(data);

			this.trigger('view:data-rendered');
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
			this.trigger('view:render-data', result[this._remote.dataKey]);
			//signal other widget (e.g a paginator widget)
			this.trigger('view:page-changed', {
				current: this._remote.page,
				total: Math.ceil(result[this._remote.totalKey]/this._remote.pageSize), //total page-count
			});
		}
	});

})(Application);