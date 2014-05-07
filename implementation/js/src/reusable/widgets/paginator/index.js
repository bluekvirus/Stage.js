/**
 * Passive Paginator widget used with lists (CollectionView instances)
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
 * << [1,2,...,last] >> (TBI: Go to [ ] input)
 *
 * link with lists
 * ---------------
 * trigger('view:change-page', page number)
 * 
 * [listenTo(target, 'view:page-changed')] - if target is passed in through init options
 * [listenTo(this, 'view:change-page')] - if target is passed in through init options
 * 
 * @author Tim.Liu
 * @create 2014.05.05
 */

;(function(app){

	app.widget('Paginator', function(){
		var UI = app.view({

			className: 'pagination',
			tagName: 'ul',
			
			template: [
				'<li {{#if atFirstPage}}class="disabled"{{/if}}><a href="#" action="goToAdjacentPage" data-page="-">&laquo;</a></li>',
				'{{#each pages}}',
					'<li {{#if isCurrent}}class="active"{{/if}}><a href="#" action="goToPage" data-page="{{number}}">{{number}} <span class="sr-only">(current)</span></a></li>',
				'{{/each}}',
				'<li {{#if atLastPage}}class="disabled"{{/if}}><a href="#" action="goToAdjacentPage" data-page="+">&raquo;</a></li>',
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
					var page = $btn.data('page');
					if(page === this._options.currentPage) return;

					this.trigger('view:change-page', page);
				},
				goToAdjacentPage: function($btn, e){
					e.preventDefault();
					var pNum = this._options.currentPage;
					var page = $btn.data('page');
					if(page === '+')
						pNum ++;
					else
						pNum --;

					if(pNum < 1 || pNum > this._options.totalPages) return;
					this.trigger('view:change-page', pNum);
				},
			},
			//////can be overriden///////
			onChangePage: function(pNum){
				//just a default stub implementation
				if(this._options.target) 
					this._options.target.trigger('view:load-page', {
						page: pNum
					});
			}

		});

		return UI;
	});

})(Application);