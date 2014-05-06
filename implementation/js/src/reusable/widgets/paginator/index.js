/**
 * Paginator widget used with lists (CollectionView instances)
 *
 * options
 * -------
 * 0. target [opt] - target list view instance
 * 1. currentPage
 * 2. totalPages
 * 3. visibleIndices [opt] - 3 means [1,2,3,...,last page] or [...,4,5,6,..., last page]
 *
 * format
 * ------
 * << [1,2,...,last] >> Go to [ ]
 *
 * link with lists
 * ---------------
 * listenTo(list, 'view:page-changed', )
 * trigger('view:change-page', page number)
 * 
 * @author Tim.Liu
 * @create 2014.05.05
 */

;(function(app){

	app.widget('Paginator', function(){
		var UI = app.view({

			type: 'Layout',
			template: [
				'<ul class="pagination">',
					'<li {{#if atFirstPage}}class="disabled"{{/if}}><a href="#" action="goToPage">&laquo;</a></li>',
					'{{#each pages}}',
						'<li {{#if isCurrent}}class="active"{{/if}}><a href="#" action="goToPage" data-page="{{number}}">{{number}} <span class="sr-only">(current)</span></a></li>',
					'{{/each}}',
					'<li {{#if atLastPage}}class="disabled"{{/if}}><a href="#" action="goToPage">&raquo;</a></li>',
				'</ul>',
				//go to input box
			],
			initialize: function(options){
				this._options = options || {};
				//if options.target, link to its 'view:page-changed' event
				if(options.target) this.listenTo(options.target, 'view:page-changed', function(args){
					this.trigger('view:reconfigure', {
						currentPage: args.current,
						totalPages: args.total
					});
				});
			},
			onShow: function(){
				//this.trigger('view:reconfigure', this._options);
			},
			onReconfigure: function(options){
				_.extend(this._options, options);
				//use options.currentPage, totalPages to build config data - atFirstPage, atLastPage, pages[{number:..., isCurrent:...}]
				var config = {
					atFirstPage: this._options.currentPage === 1,
					atLastPage: this._options.currentPage === this._options.totalPages,
					pages: _.map(_.range(1, this._options.totalPages + 1), function(pNum){
						return {
							number: pNum,
							isCurrent: pNum === this._options.currentPage
						}
					}, this)
				}

				this.trigger('view:render-data', config);
			},
			actions: {
				goToPage: function($btn, e){
					e.preventDefault();
					console.log($btn.data('page'), this._options.currentPage);
				}
			}

		});

		return UI;
	});

})(Application);