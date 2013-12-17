/**
 * This is the paginator UI for controlling the pagination enabled collections.
 *
 * Options
 * -------
 * 1. targetCollection - a backbone collection
 * 2. alignment - left|right|centered
 *
 * @author Tim.Liu
 * @created 2013.10.06
 */

Application.Widget.register('Paginator', function(){

	var UI = Backbone.Marionette.ItemView.extend({
		template: '#widget-paginator-tpl',
		className:'pagination pagination-small',

		initialize: function(options){
			this.options = options;
			this.targetCollection = options.targetCollection;
			if(!this.targetCollection || !this.targetCollection.pagination)
				throw new Error('DEV::Widget.Paginator::You must pass in a pagination enabled collection to use the paginator UI.');

			if(this.targetCollection.pagination.mode === 'infinite')
				throw new Error('DEV::Widget.Paginator::You should NOT need the paginator UI with a collection that is in mode:infinite.');

			this.model = new Backbone.Model({
				pages: [{current: 1}],
				current: 1
			});
			this.listenTo(this.model, 'change', this.render);
			this.listenTo(this.targetCollection, 'pagination:pageChanged pagination:updatePageNumbers', function(){
				//re-calculate the page numbers upon +/- records.
				var pageRange = _.range(1, 1+ (Math.ceil(this.targetCollection.totalRecords/this.targetCollection.pagination.pageSize) || 1));
				pageRange[this.targetCollection.currentPage-1] = {current: this.targetCollection.currentPage};
				this.model = this.model.set({
					pages: pageRange,
					current: this.targetCollection.currentPage
				});
				//a little page displaying fix here.
				if(this.targetCollection.currentPage > pageRange.length)
					this.targetCollection.load(pageRange.length);//reset to the last page.
			});

			this.enableActionTags('Widget.Paginator');
		},

		onRender: function(){
			this.$el.addClass('pagination-' + (this.options.alignment || 'centered'));
		},

		actions: {
			goToPage: function($action){
				var page = Number($action.attr('page'));
				this.targetCollection.load(page);
			},

			prevPage: function($action){
				var page = this.targetCollection.currentPage - 1;
				if(page > 0)
					this.targetCollection.load(page);
			},

			nextPage: function($action){
				var page = this.targetCollection.currentPage + 1;
				if(page <= this.model.get('pages').length)
					this.targetCollection.load(page);
			}

		}
	});

	return UI;

});

Template.extend('widget-paginator-tpl', [
	'<ul>',
		'<li {{#is current 1}}class="disabled"{{/is}}><a action="prevPage">«</a></li>',
		'{{#each pages}}',
			'{{#if this.current}}',
				'<li class="active"><a action="goToPage" page={{this.current}}>{{this.current}}</a></li>',
			'{{else}}',
				'<li><a action="goToPage" page={{this}}>{{this}}</a></li>',
			'{{/if}}',
		'{{/each}}',
		'<li {{#is current pages.length}}class="disabled"{{/is}}><a action="nextPage">»</a></li>',
	'</ul>'
]);