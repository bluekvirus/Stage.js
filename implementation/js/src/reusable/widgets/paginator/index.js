/**
 * Passive Paginator widget used with lists (CollectionView instances)
 *
 * options
 * -------
 * 0. target [opt] - target list view instance
 * 1. currentPage
 * 2. totalPages
 * 3. pageWindowSize - 3 means [1,2,3,...,] or [...,4,5,6,...] or [...,7,8,9] - default on 5
 *
 * format
 * ------
 * << [1,2,...] >>
 *
 * link with lists
 * ---------------
 * trigger('view:change-page', page number)
 * 
 * [listenTo(target, 'view:page-changed')] - if target is passed in through init options
 * [listenTo(this, 'view:change-page')] - if target is passed in through init options
 * 
 * @author Tim Lauv
 * @create 2014.05.05
 * @update 2014.12.01 (+pageWindowSize)
 */

;(function(app){

	app.widget('Paginator', function(){
		var UI = app.view({

			className: 'pagination',
			tagName: 'ul',
			
			template: [
				'<li {{#if atFirstPage}}class="disabled"{{/if}}><a href="#" action="goToFirstPage" data-page="--">'+_.escape('<<')+'</a></li>',
				'<li {{#if atFirstWindow}}class="hidden"{{/if}}><a href="#" action="goToAdjacentWindow" data-window="-">...</a></li>',
				'{{#each pages}}',
					'<li {{#if isCurrent}}class="active"{{/if}}><a href="#" action="goToPage" data-page="{{number}}">{{number}} <span class="sr-only">(current)</span></a></li>',
				'{{/each}}',
				'<li {{#if atLastWindow}}class="hidden"{{/if}}><a href="#" action="goToAdjacentWindow" data-window="+">...</a></li>',
				'<li {{#if atLastPage}}class="disabled"{{/if}}><a href="#" action="goToLastPage" data-page="++">'+_.escape('>>')+'</a></li>',
			],

			initialize: function(options){
				this.options = _.extend({
					pageWindowSize: 5,
				},options);
				//if options.target, link to its 'view:page-changed' event
				if(options.target) this.listenTo(options.target, 'view:page-changed', function(args){
					this.trigger('view:reconfigure', {
						currentPage: args.current,
						totalPages: args.total
					});
				});
			},
			onShow: function(){
				//this.trigger('view:reconfigure', this.options);
			},
			onReconfigure: function(options){
				_.extend(this.options, options);
				//use options.currentPage, totalPages to build config data - atFirstPage, atLastPage, pages[{number:..., isCurrent:...}]
				//calculate currentWindow dynamically
				this.options.currentWindow = Math.ceil(this.options.currentPage/this.options.pageWindowSize);
				var config = {
					atFirstPage: this.options.currentPage === 1,
					atLastPage: this.options.currentPage === this.options.totalPages,
					atFirstWindow: this.options.currentWindow === 1,
					atLastWindow: this.options.currentWindow === Math.ceil(this.options.totalPages/this.options.pageWindowSize),
					pages: _.reduce(_.range(1, this.options.totalPages + 1), function(memo, pNum){
						if(pNum > (this.options.currentWindow - 1) * this.options.pageWindowSize && pNum <= this.options.currentWindow * this.options.pageWindowSize)
							memo.push({
								number: pNum,
								isCurrent: pNum === this.options.currentPage
							});
						return memo;
					}, [], this)
				};

				this.trigger('view:render-data', config);
			},
			actions: {
				goToPage: function($btn, e){
					var page = $btn.data('page');
					if(page === this.options.currentPage) return;

					this.trigger('view:change-page', page);
				},
				goToFirstPage: function($btn, e){
					this.trigger('view:change-page', 1);
				},
				goToLastPage: function($btn, e){
					this.trigger('view:change-page', this.options.totalPages);
				},
				//Skipped atm.../////////////////////////
				// goToAdjacentPage: function($btn, e){
				// 	var pNum = this.options.currentPage;
				// 	var op = $btn.data('page');
				// 	if(op === '+')
				// 		pNum ++;
				// 	else
				// 		pNum --;

				// 	if(pNum < 1 || pNum > this.options.totalPages) return;
				// 	if(pNum > this.options.currentWindow * this.options.pageWindowSize) this.options.currentWindow ++;
				// 	if(pNum <= (this.options.currentWindow - 1) * this.options.pageWindowSize) this.options.currentWindow --;
				// 	this.trigger('view:change-page', pNum);
				// },
				/////////////////////////////////////////
				goToAdjacentWindow: function($btn, e){
					var pWin = this.options.currentWindow;
					var op = $btn.data('window');
					if(op === '+')
						pWin ++;
					else
						pWin --;

					if (pWin < 1 || pWin > Math.ceil(this.options.totalPages/this.options.pageWindowSize)) return;
					this.trigger('view:change-page', (pWin == 1) ? 1 : (pWin-1) * this.options.pageWindowSize + 1);
				}
			},
			//////Can be overriden in options to add extra params///////
			onChangePage: function(pNum){
				//use the overriden version (see the stub impl below for what to override)
				if(this.options.onChangePage)
					return this.options.onChangePage.call(this, pNum);

				//use just a default stub implementation
				if(this.options.target) 
					this.options.target.trigger('view:load-page', {
						page: pNum
						//add more params/querys
					});
			}

		});

		return UI;
	});

})(Application);