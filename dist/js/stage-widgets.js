;/**
 * This is the minimum Datagrid widget for data tables
 *
 * [table]
 * 		[thead]
 * 			<tr> th, ..., th </tr>
 * 		[tbody]
 * 			<tr> td, ..., td </tr>
 * 			...
 * 			<tr> ... </tr>
 *
 * Options
 * -------
 * 1. data []: rows of data
 * 2. columns [
 * 		{
 * 			name: datum key in data row
 * 			cell: cell name
 * 			header: header cell name
 * 			label: name given to header cell (instead of _.titleize(name))
 * 		}
 * ]
 * 3. details: false or datum name in data row or a view definition (render with row.model) - TBI
 * 
 *
 * Events
 * ------
 * 1. row:clicked
 * 2. row:dblclicked
 * 
 * 
 * Note
 * ----
 * The details row appears under each normal data row;
 *
 * TBI
 * ---
 * select header/cell
 * details row is still in TBI status (extra tr stub, view close clean up)
 * 
 * 
 * @author Tim Lauv
 * @created 2014.04.22
 */

;(function(app){

	app.widget('Datagrid', function(){

		var UI = app.view({
			tagName: 'table',
			template: [
				'<thead region="header"></thead>',
				'<tbody region="body"></tbody>'
			],
			initialize: function(options){
				this.options = _.extend({
					data: [],
					details: false,
					columns: []
				}, options);
			},
			onReady: function(){
				this.trigger('view:reconfigure', _.extend(this.options, {data: this.get('items', [])}));
			},
			onReconfigure: function(options){
				options = options || {};
				//1-1. reconfigure data and columns into this.options
				this.options = _.extend(this.options, options);

				//1-2. rebuild header cell options - let it rerender with new column array
				_.each(this.options.columns, function(column){
					column.header = column.header || 'string';
					column.cell = column.cell || column.header || 'string';
					column.label = column.label || _.string.titleize(column.name);
				});

				//2. ensure header and body views
				if(!this.header.currentView)
					this.header.show(HeaderRow.create({grid: this}));
				if(!this.body.currentView){
					var that = this;
					var body = Body.create({
						//el can be css selector string, dom or $(dom)
						el: this.body.$el, 
						//Note that a region's el !== $el[0], but a view's el === $el[0] in Marionette.
						grid: this
					}).on('all', function(e){
						//setup page related events forwarding (page-changed, page-not-changed)
						if(/page-/.test(e))
							that.trigger.apply(that, arguments);
					});
					this.body.show(body);
				}

				////////////////Note that the ifs here are for early 'show' --> .set() when using local .data////////////////			
				this.header.currentView.set(this.options.columns);
				this.body.currentView.options = this.options;
				/////////////////////////////////////////////////////////////////////////////////////////////////////////////
				this.trigger('view:set-grid-data', this.options.data);
			},
			onSetGridData: function(data){
				//3. rebuild body rows - let it rerender with new data array
				this.body.currentView.set(data);

			},
			onLoadPage: function(options){
				this.body.currentView.trigger('view:load-page', options);
			},
			getBody: function(){
				return this.body.currentView;
			},
			getHeader: function(){
				return this.header.currentView;
			}
		});

		var HeaderRow = app.view({
			type: 'CollectionView',
			forceViewType: true,
			itemView: 'dynamic',
			itemViewEventPrefix: 'headercell',
			tagName: 'tr',
			initialize: function(options){
				this.grid = options.grid; //give each row the grid view ref.
			},
			//buildItemView - select proper header cell
			buildItemView: function(item, ItemViewType, itemViewOptions){
				var HCell = app.get(_.string.classify([item.get('header'), 'header', 'cell'].join('-')), 'Widget');
				return HCell.create({
					model: item,
					tagName: 'th',

					row: this //link each cell (this.options.row) with the row. (use/link it in cell's init())
				});
			}
		});

		var Row = app.view({
			type: 'CollectionView',
			forceViewType: true,
			itemView: 'dynamic',
			itemViewEventPrefix: 'cell',
			tagName: 'tr',
			triggers: { //forward DOM events to row
				'click': {
					event: 'clicked',
					preventDefault: false //for cell elements to work properly (checkbox/radio/<anchor/>)
				},
				'dblclick': {
					event: 'dblclicked',
					preventDefault: false
				}
			},
			initialize: function(options){
				this.grid = options.body.grid; //give each row the grid view ref.
			},
			//buildItemView - select proper cell
			buildItemView: function(item, ItemViewType, itemViewOptions){
				var Cell = app.get(_.string.classify([item.get('cell'), 'cell'].join('-')), 'Widget');
				return Cell.create({
					tagName: 'td',
					model: item,

					row: this //link each cell (this.options.row) with the row. (use/link it in cell's init())
				});
			}			
		});

		var Body = app.view({
			type: 'CollectionView',
			forceViewType: true,
			itemView: Row,
			itemViewEventPrefix: 'row',
			initialize: function(options){
				this.grid = options.grid;
			},
			itemViewOptions: function(model, index){
				return {
					collection: app.collection(_.map(this.options.columns, function(column){
						return _.extend({
							value: app.extract(column.name || '', model.attributes),
							index: index
						}, column);
					}, this)),

					body: this //passing body to row view
				};
			},
			itemEvents: { //forward row events to grid
				'clicked': function(e, row){
					row.grid.trigger('row:clicked', row);
				},
				'dblclicked': function(e, row){
					row.grid.trigger('row:dblclicked', row);
				}
			}
		});
		
		return UI;

	});

})(Application);
;/**
 * The Default String Column Header Definition.
 *
 * @author Tim Lauv
 * @created 2013.11.25
 * @updated 2014.04.22
 */


;(function(app){

	app.widget('StringHeaderCell', function(){

		var UI = app.view({
			template: '<span><i class="{{icon}}"></i> {{{i18n label}}}</span>',
		});

		return UI;
	});

})(Application);
;/**
 * The Default String Column Cell Definition.
 *
 * @author Tim Lauv
 * @created 2013.11.25
 * @updated 2014.04.22
 */


;(function(app){

	app.widget('StringCell', function(){

		var UI = app.view({
			template: '<span>{{{value}}}</span>',
		});

		return UI;
		
	});

})(Application);
;/**
 * Cell that shows the seq number of record
 *
 * @author Tim Lauv
 * @created 2014.04.23
 */

;(function(app){

	app.widget('SeqCell', function(){

		var UI = app.view({
			template: '{{index}}'
		});

		return UI;
		
	});

})(Application);
;/**
 * This is the ActionCell definition 
 *
 * Options
 * -------
 * passed down by this.model.get('actions')
 * 
 * actions: { (replace the actions)
 * 		'name': {
 * 			label: ...,
 * 			icon: ...,
 * 			tooltip: ...,
 * 			fn: function(){
 * 				this.model is the row record data model
 * 			}
 * 		},
 * 		...
 * }
 *
 * @author Tim Lauv
 * @created 2013.11.27
 * @updated 2014.04.22
 */

;(function(app){

	app.widget('ActionCell', function(){

		var UI = app.view({
			template: [
				'{{#each actions}}',
					'<span class="action-cell-item" action="{{@key}}" data-toggle="tooltip" title="{{i18n tooltip}}"><i class="{{icon}}"></i> {{i18n label}}</span> ',
				'{{/each}}'
			],
			className: 'action-cell',

			initialize: function(options){
				this.row = options.row;
				var actions = this.model.get('actions') || {};

					//default
					_.each({
						preview: {
							icon: 'glyphicon glyphicon-eye-open',
							tooltip: 'Preview'
						},
						edit: {
							icon: 'glyphicon glyphicon-pencil',
							tooltip: 'Edit'
						},
						'delete': {
							icon: 'glyphicon glyphicon-remove',
							tooltip: 'Delete'
						}
					}, function(def, name){
						if(actions[name]){
							actions[name] = _.extend(def, actions[name]);
						}
					});


				//allow action impl overriden by action config.fn
				this.actions = this.actions || {};
				_.each(actions, function(action, name){
					if(action.fn){
						this.actions[name] = function($action){
							action.fn.apply(this.row, arguments);
							/*Warning:: If we use options.row here, it won't work, since the options object will change, hence this event listener will be refering to other record's row when triggered*/
						};
					}
				}, this);
				this.model.set('actions', actions);
				this._enableActionTags(true);
			},
			tooltips: true

		});

		return UI;

	});	

})(Application);

;/**
 * This is the Tree widget.
 *
 * <ul>
 * 	<li></li>
 * 	<li></li>
 * 	<li>
 * 		<a></a> -- item val
 * 		<ul>...</ul> -- nested children
 * 	</li>
 * 	...
 * </ul>
 *
 * Options
 * -------
 * 1. data - [{
 * 		val: ...
 * 		icon: ...
 * 		children: []
 * }]
 * 2. node - default view definition config: see nodeViewConfig below
 *
 * 3. onSelected: callback
 *
 * Override node view
 * ------------------
 * a. just template (e.g val attr used in template)
 * use node: {template: [...]}; don't forget <ul></ul> at the end of tpl string.
 * 
 * b. children array attr
 * use node: {
 * 		initialize: function(){
 * 			if(this.className() === 'node') this.collection = app.collection(this.model.get('[new children attr]'));
 * 		}
 * }
 *
 * Note
 * ----
 * support search and expand a path (use $parent in node/leaf onSelected()'s first argument)
 *
 * @author Tim Lauv
 * @created 2014.04.24
 */

;(function(app){

	app.widget('Tree', function(){

		var nodeViewConfig = {
			type: 'CompositeView',
			forceViewType: true,
			tagName: 'li',
			itemViewContainer: 'ul',
			itemViewOptions: function(){
				return {parent: this};
			},
			className: function(){
				if(_.size(this.model.get('children')) >= 1){
					return 'node';
				}
				return 'leaf';
			},
			initialize: function(options){
				this.parent = options.parent;
				if(this.className() === 'node') this.collection = app.collection(this.model.get('children'));
				this.listenTo(this, 'render', function(){
					this.$el.addClass('clickable').data({
						//register the meta-data of this node/leaf view
						view: this,
						'$children': this.$el.find('> ul'),
						'$parent': this.parent && this.parent.$el
					});
				});
			},
			template: [
				'<a class="item" href="#"><i class="type-indicator"></i> <i class="{{icon}}"></i> {{{i18n val}}}</a>',
				'<ul class="children hidden"></ul>' //1--tree nodes default on collapsed
			]
		};

		var Root = app.view({
			type: 'CollectionView',
			forceViewType: true,
			className: 'tree tree-root',
			tagName: 'ul',
			initialize: function(options){
				this.itemView = this.options.itemView || app.view(_.extend({}, nodeViewConfig, _.omit(this.options.node, 'type', 'tagName', 'itemViewContainer', 'itemViewOptions', 'className', 'initialize')));
				this.onSelected = options.onSelected || this.onSelected;
			},
			onShow: function(){
				this.trigger('view:reconfigure', this.options);
			},
			onReconfigure: function(options){
				_.extend(this.options, options);
				this.trigger('view:render-data', this.options.data); //the default onRenderData() should be suffice.
			},
			events: {
				'click .clickable': function(e){
					e.stopPropagation();
					var $el = $(e.currentTarget);
					var meta = $el.data();
					if($el.hasClass('node')) this.trigger('view:toggleChildren', meta);
					this.trigger('view:selected', $el.data(), $el, e);
				}
			},
			onToggleChildren: function(meta){
				//2--click to become expanded
				meta.$children.toggleClass('hidden');
				meta.view.$el.toggleClass('expanded');	
			},

			//override this
			onSelected: function(meta, $el, e){
			
			}

		});

		return Root;

	});

})(Application);
;/**
 * Passive Paginator widget used with lists (CollectionView instances)
 *
 * Options
 * -------
 * 0. target [opt] - target list view instance
 * 1. currentPage
 * 2. totalPages
 * 3. pageWindowSize - 3 means [1,2,3,...,] or [...,4,5,6,...] or [...,7,8,9] - default on 5
 *
 * UI format
 * ---------
 * << [1,2,...] >>
 *
 * Link with lists
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
;/**
 * The Table of Content Widget
 *
 * Options
 * -------
 * 1. title - [optional] the title above the root <ul/>
 * 2. template - [optional] the item template holding topic string
 * 3. toc - the object or url that loads the toc metadata "Topic" --> "Markdown.md".
 *
 * 		{
 * 			"1_topic A": "a.md",
 * 		 	"2_topic B": {
 * 			 	"a_overview": "b/-intro.md",
 * 			  	"b_topic B.1": "b/b-1.md",
 * 			   	"c_topic B.2": "b/b-2.md",
 * 			    ...
 * 		     },
 * 		     ...
 * 		},
 * 		
 * 4. onReady - [optional] what to do when the ToC view is ready
 *
 * Note
 * ----
 * Use "<number>_" or "<alphabetics>_" to indicate your topic order.
 * You can use non empty view data:{} to reset toc. 
 * There is an activation group called 'toc' for all the topic <li>, when clicked, emitting a global event 'load-topic-file' with file path.
 * 
 *
 * @author Tim Lauv
 * @created 2017.08.28
 */

(function(app){

	app.widget('ToC', function(){

		var UI = app.view({

			defaults: {
				//default configure
				title: 'Table of Content',
				template: '<a>{{.}}</a>',
				toc: {
					'1_Topic A': 'a.md',
					'2_Topic B': {
						'a_Overview': 'b/b-intro.md',
						'b_Topic B-1': 'b/b-1.md',
						'c_Topic B-2': 'b/b-2.md',
						'd_Topic B-3': {
							'1_Topic B-3-1': 'b/b-3/3.md',
							'1_Topic B-3-2': 'b/b-3/2.md',
						},
					},
					'3_Topic C': 'c.md',
				}

			},

			onBeforeRender: function(){
				//change the presentation after data loading but before render again
				var tocCfgObj = _.extend({}, this.defaults, this.options); //can override title, template, toc with init options
				tocCfgObj.toc = _.size(this.get())? this.get() : tocCfgObj.toc; //can override toc with data
				this.template = '<h3>' + tocCfgObj.title + '</h3>' + helper(tocCfgObj.toc, _.partial(Marionette.Renderer.render, tocCfgObj.template));
			},

			onItemActivated: function($item, group){
				switch(group){
					case 'toc':
						app.coop('load-topic-file', $item.attr('file'));
					break;
					default:
					break;
				}
			}

		});

		function helper(tocPartialObj, itemTplFn){
			var result = '<ul>';
			_.each(tocPartialObj, function(mdFileStr, topicStr){
				topicStr = topicStr.split('_')[1]; //removing the ordering bit before '_'
				if(!_.isPlainObject(mdFileStr))
					result += '<li activate="toc" file="' + mdFileStr + '">' + itemTplFn(topicStr) + '</li>';
				else
					result += '<li>' + itemTplFn(topicStr) + helper(mdFileStr, itemTplFn) + '</li>';
			})
			return result + '</ul>';
		}

		return UI;

	});

})(Application);
;/**
 * This is a widget to generate infinite scrollable grid, which can eliminate performance barrier when loading large amount of data.
 * To only show a small batch of data, the backend should be able to return records with an start index and number of records desired.
 * Every record in this widget is a view, which can be defined in the widget options.
 *
 * This widget is highly customizable. Following are all the options currently taken by the widget.
 * 
 * {
		rowHeight: 25, //fixed row height in px, must given!
		rowView: {obj}, //view definition, NOT instance
		totalKey: 'total', //the key for giving total number of records
		dataKey: 'payload', //the key contains data
		initialIndex: 0, //starting index
		indexKey: 'start', //index param to give to backend
		sizeKey: 'size', //size param to give to backend
		params: {foo1: bar1, foo2: bar2}, //additional query parameters
 * }
 *
 * @author: Patrick Zhu
 * @created: 2017.10.20
 * @updated: 2018.02.27
 */


;(function(app) {

	app.widget('InfiniteGrid', function() {

		//definition of widget
		var UI = app.view({

			//default class name for styling
			className: 'infinite-grid',

			//style attributes for the widgets, position relative is for setting absolute position on content block
			attributes: {
				style: 'height:100%; width:100%; position:relative; z-index:0;',
			},

			//template
			template: [
				//register action on the outer container, and make it scrollable action-scroll="scroll-grid" 
				'<div class="outer-container" style="height:100%; width:100%; overflow-y:hidden; position:relative;">',
					'<div class="inner-container" style="position: relative; top: 0;">',//set top:0 to make sure transition to be triggered for the first time
						'<div class="top-space-holder"></div>',
						'<div class="contents" region="contents"></div>',
					'</div>',
				'</div>',
				'<div class="infinite-grid-loading-icon hidden" style="position:absolute;top:0;bottom:0;left:0;right:0;z-index:1;text-align:center;background-color:rgba(155,155,155, 0.2);">',
					'<i class="fa fa-3x fa-spin fa-spinner" style="position:absolute;top:40%;"></i>',
				'</div>',
			],

			//initialize widget
			initialize: function(options) {
				var that = this;

				//check whether user has defined data attribute
				if (!this.options.dataUrl) {
					console.warn('Widget::InfiniteGrid::You need to specify the data attribute for infinite grid view...');
				}

				//trim user options
				this.options = _.extend({
					rowHeight: 25, //fixed row height in px
					rowView: app.view({ template: '<span>ID: {{id}}</span> <span>IP: {{id}}.{{id}}.{{id}}.{{id}}</span>', attributes: { style: 'height: 25px;width:100%;' } }), //view name or definition
					dataUrl: '/sample/infinite',
					totalKey: 'total',
					dataKey: 'payload',
					initialIndex: 0,
					//default query parameter
					indexKey: 'start',
					sizeKey: 'size',
					//additional query parameter needed for fetching information
					params: {},
					//parameter for constrain the scrolling speed
					scrollConstrain: true //true, false or number in 'px'
				}, options);

				//metadata used for setting up scroll later
				this._prevScrollTop = 0;
				this._prevTop = 0;
				this._batches = [];
				//parse parameters into a string
				this._paramStr = _.reduce(_.pairs(this.options.params), function(memo, arr) { return memo + '&' + arr.join('='); }, '');
				//flag of showing the loading spinning font
				this._showSpin = false;
				//flag for global locking, before Ajax comes back
				//once an ajax call is initiated block scrolling event
				this._prevScrollTimer = 0;
				//fast scroll lock 
				this._fastScrollLock = false;
				this._smoothScrollLock = false;
				//store batch indices for comparing and to elimainte calcultion rounding bug
				this._prevIndex = 0;
				this._currnetIndex = 0;
			
				//Definition for view to hold a single batch.
				//Infinite grid holds five of this at one time.
				var rowView = this.options.rowView;
				this._SingleBatchView = app.view({

					//class name for grabbing from DOM later
					className: 'infinite-grid-single-batch-view',

					//only one region is needed
					template: '<div region="singles"></div>',

					onReady: function() {
						//use view.more to populate region with "single" views
						this.more('singles', this.get('items'), rowView);

						//fulfill the batchIndex attribute for later reference
						this.$el.attr('batchIndex', this.get('batchIndex'));
					}
				});
			},

			//view:ready
			onReady: function() {
				var that = this;
				//trigger view reconfig to setup the grid
				this.trigger('view:reconfigure', { index: this.options.initialIndex }, true);

				//get the scrolling speed constrain
				var constrain;
				if(that.options.scrollConstrain){

					if(that.options.scrollConstrain === true){

						//default scroll speed control is 1/5 of the viewport height
						//that is scrolling event will be triggered 5 times to get through one batch of record
						constrain = that._viewportHeight / 5;

					}else{
						constrain = that.options.scrollConstrain; //honor user configuration
					}

				}else{
					//scroll speed is set to half the viewport height
					constrain = that._viewportHeight / 4;
				}

				//register the mousewheel event on outer-container
				var $outerContainer = this.$el.find('.outer-container'),
					$innerContainer = this.$el.find('.inner-container');
				/**
				 * Those two events will not be triggered simultaneously
				 * 1. "mousewheel" is for browsers other than Firefox.
				 * 2. "DOMMouseScroll" is for Firefox only.
				 */
				$outerContainer.on('mousewheel DOMMouseScroll', function(event){

					if(!that._fastScrollLock){
						//test timing control
						var currentMS = (new Date()).getTime();

						if(currentMS - that._prevScrollTimer > 125){//maximum 8 frames per second

							var direction = 0, //negative is up and positive is down
								e = window.event || event, //Check what browser does the event come from, because the value of delta are reversed between different browsers.
								delta = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)));

							//prevent default
							e.preventDefault();

							//get current "top" position and calculate for the new "top" position based on the scrolling direction
							var top = $innerContainer.position().top,
								newTop;

							//scrolling up
							if(delta > 0){
								newTop =  ((top + constrain > 0) ? 0 : (top + constrain));
							}
							//scrolling down
							else{
								newTop = ((top - constrain < (that._viewportHeight - that._totalHeight)) ? (that._viewportHeight - that._totalHeight) : (top - constrain) );
							}

							//check whether already scroll past the content portion
							//if yes, show the loading mask
							if(newTop >= top + 2 * that._viewportHeight || newTop <= top - 2 * that._viewportHeight){
								that.$el.find('.infinite-grid-loading-icon').removeClass('hidden');
							}

							//setup the newTop to the .inner-container, fake scroll
							$innerContainer.css({top: newTop + 'px'});

							//then call the _scroll function to update date accordingly
							that._scroll(newTop, top);
							
							//set the new scroll timer
							that._prevScrollTimer = currentMS;
						}
					}
				});
			},

			onReconfigure: function(obj, initialSetup) {
				var that = this;

				//store the viewport height
				this._viewportHeight = this.$el.find('.outer-container').height();

				//calculate how many records can be shown in one viewport
				this._batchSize = Math.floor(this._viewportHeight / this.options.rowHeight);

				//load first record in order to calculate height
				//initially load five batches of data
				app.remote({
					url: this.options.dataUrl + '?' + this.options.indexKey + '=' + obj.index + '&' + this.options.sizeKey + '=' + (obj.size || (this._batchSize * 5)) + this._paramStr,
					async: false,
				}).done(function(data) {

					//get content and total number of records
					var content = that.options.dataKey ? that._extactValue(data, that.options.dataKey) : data,
						total = that._extactValue(data, that.options.totalKey),
						$innerContainer = that.$el.find('.inner-container');

					//check whether total exists, total could be 0 means there is no data meet the query.
					if (total !== 0 && !total) {
						throw new Error('Stage.js::Widget::InfiniteGrid: there is no total amount of data provided...');
					}

					//check if data exists
					if (!content) {
						throw new Error('Stage.js::Widget::InfiniteGrid: there is no data provided...');
					}

					//if there is no matched data, return immediately
					if (total === 0) {
						console.warn('Stage.js::Widget::InfiniteGrid: there is no matched data returned from backend...');
						return;
					}

					//cache total locally for future reference
					that._totalNumOfRecords = total;

					//initial setup, needs to setup dimension for the containers
					if (initialSetup) {
						//calculate the total height and setup height of inner container
						that._totalHeight = that.options.rowHeight * that._extactValue(data, that.options.totalKey);
						$innerContainer.css({ height: that._totalHeight });

						//store total number of batches
						//check whether total can be devided into integer of batch size
						if (total % that._batchSize === 0) {
							that._lastBatchRecords = that._batchSize;
							that._totalNumOfBatches = total / that._batchSize;
						} else {
							that._lastBatchRecords = total % that._batchSize;
							that._totalNumOfBatches = Math.floor(total / that._batchSize) + 1;
						}

						//initialize batch index to 0
						obj.batchIndex = 0;

						//initial index and batches
						that._initBatch();

					} else {
						//adjust height of top place holder		
						that.$el.find('.top-space-holder').css({ height: obj.topHeight });
						
						//hard reset scrollTop, if necessary
						$innerContainer.css({
							top: obj.top + 'px'
						});
					
						//add the hidden class for spin
						that.$el.find('.infinite-grid-loading-icon').addClass('hidden');
					}

					//split content into five batches based on the indices
					//Caveat: Do NOT use new Array(5).fill([]), use [[], [], [], [], []] instead to avoid unexpected result
					content = _.reduce(content, function(memo, value, index) { memo[Math.floor(index / that._batchSize)].push(value); return memo; }, [[],[],[],[],[]]);

					//Caveat: Do NOT pass two dimensional array into view.more(). Convert them into an array of objects first.
					_.map(content, function(val, index) { content[index] = { items: val, batchIndex: obj.batchIndex + index }; });

					//remove everything that is in content view to avoid more(,true) not cleaning up bug
					if(that.getViewIn('contents')){
						that.getViewIn('contents').$el.empty();
					}

					//show data in batches, use defer to make sure previous render has complete to avoid unexpected results
					_.defer(function() {
						//set new data
						that.more('contents', content, that._SingleBatchView, true);

						//make sure content has already been shown
						_.defer(function(){
							that._fastScrollLock = false;
						});
					});

				}).fail(function(data) {
					throw new Error('Stage.js::Widget::InfiniteGrid: error fetch data from url ' + that.data + '...');
				});
			},

			_scroll: function(newTop, prevTop) {
				//calculate index for current scrollTop and previous scrollTop
				var prevIndex = this._calBatch(prevTop),
					currentIndex = this._calBatch(newTop);

				//check smooth scroll or fast scroll
				//Caveat: there is a rounding bug be careful
				if ((currentIndex === prevIndex + 1) || (prevIndex === this._prevIndex + 1 && currentIndex === this._currnetIndex + 1)) {
					//smooth scroll down
					this._smoothScroll(currentIndex, 'down');

				} else if ((currentIndex === prevIndex - 1) || (prevIndex === this._prevIndex - 1 && currentIndex === this._currnetIndex - 1)) {
					//smooth scroll up
					this._smoothScroll(currentIndex, 'up');

				} else if (currentIndex > prevIndex + 1 || currentIndex < prevIndex - 1) {
					this._fastScrollLock = true;
					//fast scroll, no matter of the orientation
					this._fastScroll(currentIndex);
					
				} else {
					//no change and do nothing, keep this branch as a reminder
				}

				//sync locally stored variable
				this._prevIndex = prevIndex;
				this._currnetIndex = currentIndex;
			},

			//complete update content at once, if user scrolls too fast
			_fastScroll: function(currentIndex) {
				
				//check the value of currentIndex to decide how to reconfigure the gird
				if (currentIndex > 2 && currentIndex < this._batches.length - 2) { //normal

					this.trigger('view:reconfigure', { index: this._batches[currentIndex].index, size: this._batchSize * 5, batchIndex: currentIndex, top: this._batches[currentIndex].top, topHeight: currentIndex * this._viewportHeight });

				} else if (currentIndex <= 2) { //first five batches

					this.trigger('view:reconfigure', { index: this._batches[0].index, size: this._batchSize * 5, batchIndex: 0, top: this._batches[0].top, topHeight: 0});

				} else if (currentIndex >= this._batches.length - 2) { //last five batches

					this.trigger('view:reconfigure', { index: this._batches[this._batches.length - 5].index, size: 4 * this._batchSize + this._lastBatchRecords, batchIndex: this._batches.length - 5, top: this._batches[this._batches.length - 2].top, topHeight: this._totalHeight - (4 * this._batchSize + this._lastBatchRecords) * this.options.rowHeight });

				}
			},

			//smooth update content if user scrolls smoothly
			_smoothScroll: function(currentIndex, orientation) {
				//check whether still processing or not
				if(!this._smoothScrollLock){

					var that = this,
						$el = this.$el.find('.outer-container'),
						content;

					//get element contains first and last batch on the screen for reference
					var $firstEl = $($el.find('.infinite-grid-single-batch-view')[0]),
						$lastEl = $($el.find('.infinite-grid-single-batch-view')[4]),
						firstBatchIndex = parseInt($firstEl.attr('batchIndex')),
						lastBatchIndex = parseInt($lastEl.attr('batchIndex'));

					//check if grid is at top or bottom, if yes return to avoid unexpected results.
					if (
						(orientation === 'up' && (firstBatchIndex - 1 < 0) || currentIndex > this._batches.length - 2) ||
						(orientation === 'down' && (lastBatchIndex + 1 > this._batches.length - 1 || currentIndex < 2))
					) {
						return;
					}

					//lock the smooth scroll event
					this._smoothScrollLock = true;

					//check orientation and update grid accordingly
					if (orientation === 'down') {
						//if orientation is down, then delete first batch and append a new batch at the bottom
						app.remote({
							url: this.options.dataUrl + '?' + this.options.indexKey + '=' + this._batches[lastBatchIndex + 1].index +
								'&' + that.options.sizeKey + '=' + this._batchSize +
								this._paramStr,
							async: false, //disable async for consistent performance
						}).done(function(data) {
							//fetch content
							content = that.options.dataKey ? that._extactValue(data, that.options.dataKey) : data;

							//update content
							//close the top view contains the first batch
							$firstEl.data('view').close();

							//adjust height of the space holders
							that.$el.find('.top-space-holder').css({
								height: (firstBatchIndex + 1) * that._viewportHeight
							});

							//append new batch at the bottom
							that.more('contents', [{ items: content, batchIndex: lastBatchIndex + 1 }], that._SingleBatchView);

							//unlock the lock
							that._smoothScrollLock = false;
						});

					} else if (orientation === 'up') {

						//if orientation is up, then delete last batch and insert a new batch at the top
						app.remote({
							url: this.options.dataUrl + '?' + this.options.indexKey + '=' + this._batches[firstBatchIndex - 1].index +
								'&' + that.options.sizeKey + '=' + this._batchSize +
								this._paramStr,
							async: false, //disable async for consistent performance
						}).done(function(data) {
							//fetch content
							content = that.options.dataKey ? that._extactValue(data, that.options.dataKey) : data;

							//update content
							//close the bottom view contains the last batch
							var $currentViews = $el.find('.infinite-grid-single-batch-view');
							$($currentViews[$currentViews.length - 1]).data('view').close();

							//insert the new batch at the top
							var cv = that.getViewIn('contents'), //fetch collection view
								topView = that._SingleBatchView.create().render().set({ items: content, batchIndex: firstBatchIndex - 1 }); //create view in cache with data

							//append view at the top.
							//Note: this is a temporary solution, since currently it is hard to insert new view at the top of a collection view
							cv.$el.prepend(topView.$el);

							//adjust height of the space holders
							that.$el.find('.top-space-holder').css({
								height: (firstBatchIndex - 1) * that._viewportHeight
							});

							//unlock
							that._smoothScrollLock = false;
						});
					}
				}
			},

			//function to generate an array of batch "scrollTop" and startIndex
			_initBatch: function() {
				//totalHeight, viewportHeight, numberOfBatches, numOfRecords for each batch
				//use "for" loop
				for (var i = 0; i < this._totalNumOfBatches; i++) {
					//push scrollTop and startIndex
					this._batches.push({
						top: - (i * this._viewportHeight),
						scrollLimit: - ((i + 1) * this._viewportHeight),
						index: this.options.initialIndex + i * this._batchSize
						//scrollTop: i * this._viewportHeight,
						//scrollLimit: (i + 1) * this._viewportHeight,
						//index: this.options.initialIndex + i * this._batchSize
					});
				}
			},

			//function to check what batches should be shown
			_calBatch: function(top) {
				var index = _.findIndex(this._batches, function(obj) { return top <= obj.top && top > obj.scrollLimit; });
				return index;
			},

			//function to extact values from an object
			_extactValue: function(obj, key){
				var arr = key.split('.'),
					current = obj;

				for(var i = 0; i < arr.length; i++){
					if(current[arr[i]] === undefined){
						current = undefined;
						break;
					}else{
						current = current[arr[i]];
					}
				}

				return current;
			}
		});

		//return definiton
		return UI;

	});

})(Application);
;;Application.buildTimestamp = 1525484668584;
;