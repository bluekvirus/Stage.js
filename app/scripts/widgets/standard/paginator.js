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
				this.model = this.model.set({
					pages: pageRange
				});
				//a little page displaying fix here.
				if(this.targetCollection.currentPage > pageRange.length)
					this.targetCollection.load(pageRange.length);//reset to the last page.
			});

			_.each(this.actions, function(func, action){
				this.actions[action] = _.bind(func, this);
			}, this);
		},

		events: {
			'click [action]': '_doAction'
		},
		_doAction: function(e){
			//e.preventDefault();
			e.stopPropagation();

			var $el = $(e.currentTarget);
			var action = $el.attr('action');
			if(!this.actions[action])
				throw new Error('DEV::Widget.Paginator::Action ' + action + ' is not yet implemented!');
			this.actions[action]($el);
		},

		actions: {
			goToPage: function($action){
				var page = Number($action.attr('page'));
				this.targetCollection.load(page);
			}
		}
	});

	return UI;

});

Template.extend('widget-paginator-tpl', [
	'<ul>',
		'<li><a action="prevPage">«</a></li>',
		'{{#each pages}}',
			'<li><a action="goToPage" page={{this}}>{{this}}</a></li>',
		'{{/each}}',
		'<li><a action="nextPage">»</a></li>',
	'</ul>'
]);