/**
 * This is the paginator UI for controlling the pagination enabled collections.
 *
 * @author Tim.Liu
 * @created 2013.10.06
 */

Application.Widget.register('Paginator', function(){

	var UI = Backbone.Marionette.ItemView.extend({
		template: '#widget-paginator-tpl',
		className:'pagination pagination-small pagination-centered',

		initialize: function(options){
			this.targetCollection = options.targetCollection;
			if(!this.targetCollection || !this.targetCollection.pagination)
				throw new Error('DEV::Widget.Paginator::You must pass in a pagination enabled collection to use the paginator UI.');

			if(this.targetCollection.pagination.cache)
				throw new Error('DEV::Widget.Paginator::You should NOT use a page cache enabled collection with the paginator UI.');

			this.model = new Backbone.Model();
			this.listenTo(this.model, 'change', this.render);
			this.listenTo(this.targetCollection, 'pagination:updatePageNumbers pagination:updatePageNumbers:clientMode', function(){
				//re-calculate the page numbers upon +/- records.
				var pageRange = _.range(1, 1+ Math.ceil(this.targetCollection.totalRecords/this.targetCollection.pagination.pageSize));
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