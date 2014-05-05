/**
 * Marionette.CollectionView Enhancements (can be used in CompositeView as well)
 *
 * 1. Pagination, Filtering, Sorting support (view:load-page, TBI view:sort-by, view:filter-by)
 * 2. Render with data (view:render-data, view:data-rendered)
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
	_.extend(Backbone.Marionette.View.prototype, {

		/////////////////////////////
		onRenderData: function(data){

			if(!_.isArray(data)) throw new Error('DEV::CollectionView+::You need to have an array passed in as data...');
			
			if(!this.collection){
				this.collection = new Backbone.Collection;
				this.listenTo(this.collection, 'add', this.addChildView);
				this.listenTo(this.collection, 'remove', this.removeItemView);
				this.listenTo(this.collection, 'reset', this.render);
			}
			this.collection.reset(data);

			this.trigger('view:data-rendered');
		},


		//////////////////////////////
		onLoadPage: function(options){
			options = _.extend({
				page: 1,
				pageSize: 15,
				dataKey: 'payload',
				totalKey: 'total',
				params: {},
				//+ app.remote() options
			}, this.pagination, options);

			//merge pagination ?offset=...&size=... params/querys into app.remote options
			_.each(['params', 'querys'], function(k){
				if(!options[k]) return;

				options[k] = _.extend({
					offset: (options.page -1) * options.pageSize,
					size: options.pageSize
				}, options[k]);
			});

			var that = this;
			app.remote(_.omit(options, 'page', 'pageSize', 'dataKey', 'totalKey')).done(function(result){
				//render this page:
				that.trigger('view:render-data', result[options.dataKey]);
				//signal other widget (e.g a paginator widget)
				that.trigger('view:page-changed', {
					current: options.page,
					total: Math.ceil(result[options.totalKey]/options.pageSize), //total page-count
				});
				//store pagination status for later access
				that.pagination = _.pick(options, 'page', 'pageSize', 'dataKey', 'totalKey');
			});
		}
	})

})(Application);