/**
 * Marionette.CollectionView Enhancements (can be used in CompositeView as well)
 *
 * 1. Pagination, Filtering, Sorting support (TBI as Marionette.Controllers or built into default meta-event responder?)
 * 2. Render with data (view:render-data, view:data-rendered)
 *
 * @author Tim.Liu
 * @created 2014.04.30
 */

;(function(app){

	/**
	 * Meta-event Listeners (pre-defined)
	 * view:render-data
	 */
	_.extend(Backbone.Marionette.View.prototype, {

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
		}
	})

})(Application);