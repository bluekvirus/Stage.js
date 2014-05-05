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

	var UI = app.view({

		type: 'Layout',
		template: [
			'<ul>',
				'<li {{#if atFirstPage}}class="disabled"{{/if}}><a href="#">&laquo;</a></li>',
				'{{#each pages}}',
					'<li {{#if isCurrent}}class="active"{{/if}}><a href="#" action="goToPage">{{number}} <span class="sr-only">(current)</span></a></li>',
				'{{/each}}',
				'<li {{#if atLastPage}}class="disabled"{{/if}}><a href="#">&raquo;</a></li>'
			'</ul>',
			//go to input box
		],
		initialize: function(options){
			this._options = options;
			//if options.target, link to its 'view:page-changed' event
		},
		onShow: function(){
			this.trigger('view:reconfigure', this._options);
		},
		onReconfigure: function(options){
			_.extend(this._options, options);
			//config - atFirstPage, atLastPage, pages[{number:..., isCurrent:...}]
		}

	});

})(Application);