//infinite gird... TBI
//
//@author: Patrick Zhu
//@created: 2017.10.20

/**
 * user configuration for now
 *
 * {
 * 		className: 'string', //customized class name for easier styling
 * 		data: [{a: 1, b: 2, c: 3...}, {a: 4, b: 5, c: 6...}, ...],
 * 		columns: [{name: 'a', type: 'string..', label: 'string...'} or 'string'], //order of the data columns and type of columns(similar as datagrid)
 * 		totalKey: 'string', //key in the data that gives the total number of entries. default is 'total'
 * 		contentKey: 'string', //key in the data that gives the real content
 * 		initialIndex: number, //initial query index 
 * 		details: true or false, //similar to datagrid, TBI
 * }
 */


;(function(app){

	app.widget('InfiniteGrid', function(){

		//save a local copy for later use
		var _columns = [];

		//definition of widget
		var UI = app.view({

			//default class name for styling
			className: 'infinite-grid',

			//template
			template: [
				'<div class="outer-container">',
					'<div class="top-space-holder"></div>',
					'<div class="contents" region="contents"></div>',
					'<div class="bottom-space-holder"></div>',
				'</div>',
			],

			//initialize widget
			initialize: function(options){
				var that = this;

				//trim user options
				this.options = _.extend({
					className: '',
					rowHeight: 25, //fixed row height in px

					//temporary
					rowView: app.view({template: '<span>{{id}}</span> <span>{{ip}}</span>', attributes: {style: 'height: 40px;'}}), //view name or definition
					

					data: [{default: 'no data given'}],
					columns: [{key: 'default'}],
					totalKey: 'total',
					dataKey: 'payload',
					initialIndex: 0,
					//default query parameter
					dataUrl: 'sample/infinite',
					indexKey: 'start',
					sizeKey: 'size',
				}, options);

				//add class name to this view
				this.$el.addClass(this.options.className);

				//local alias
				_columns = this.options.columns;

				//trim options.columns to appropriate format
				_.each(this.options.columns, function(col, index){

					//string
					if(_.isString(col)){
						var temp = {};
						temp.key = col;
						temp.cell = 'string';

						//setup column
						that.options.columns[index] = temp;
					}
					//object
					else if(_.isPlainObject(col)){
						//no key and no type
						if(!col.cell && !col.key){
							throw new Error('Stage.js::Widget::InfiniteGrid: you need either provide a key or a cell type for every column...');
						}

						//key without type
						col.cell = col.cell || 'string';
						
					}
					//error
					else{
						throw new Error('Stage.js::Widget::InfiniteGrid: the elements inside columns can only be Object or String...');
					}
				});
			},

			setupGrid: function(){
				var that = this;

				//store the viewport height
				this._viewportHeight = this.$el.height();

				//calculate how many records can be shown in one viewport
				this._batchSize = Math.ceil(this._viewportHeight / this.options.rowHeight);

				//load first record in order to calculate height
				app.remote({
					url: this.options.dataUrl + '?' + this.options.indexKey + '=' + this.options.initialIndex + '&' + this.options.sizeKey + '=' + (this._batchSize * 3),
				}).done(function(data){
					//get content and total number of records
					var content = data[that.options.dataKey],
						total = data[that.options.totalKey];

					//store total height locally
					that._totalHeight = that.options.rowHeight * data[that.options.totalKey];

					//check if data exists
					if(!content){
						throw new Error('Stage.js::Widget::InfiniteGrid: there is no data provided...');
					}

					//setup the height of outer-container
					that.$el.find('.outer-container').css({height: that._totalHeight});

					//setup the contents view height
					that.$el.find('.contents').css({height: that._viewportHeight * 5});

					//more all the first batch views
					that.more('contents', content, that.options.rowView);

					//after knowing the number of records in the viewport, 

					//fullfill first batch of the grid
					// app.remote({
					// 	url: that.options.dataUrl + '?' + that.options.indexKey + '=' + that.options.initialIndex + '&' + that.options.sizeKey + '=' + (that._size * 5),
					// }).done(function(data){



					// 	//temporary for testing
					// 	_.each(data, function(d, index){

					// 	});
					// });

				}).fail(function(data){
					throw new Error('Stage.js::Widget::InfiniteGrid: error fetch data from url ' + that.options.dataUrl + '...');
				});
			},

			fullfillGrid: function(batch){
				
			},

			//view:ready
			onReady: function(){
				var that = this,
					_currentBatch = 0;

				//initial setup of the grid
				this.setupGrid();

				//register scroll event
				this.$el.on('scroll', _.throttle(function(e){

					

					//console.log(this.scrollTop % Math.ceil(that.$el.height()));

					//test on scroll
					//if(this.scrollTop % Math.ceil(that.$el.height()) <= tolerance){

					//use floor to make sure batch should be integer
					var batch = Math.ceil(this.scrollTop / Math.ceil(that.$el.height()));

					if(batch === _currentBatch || this.scrollTop <= (that._batchSize * that.options.rowHeight * 3)){
						return;
					}
					else{
						_currentBatch = batch;
					}

					var topHeight = (batch - 2) * that._viewportHeight,
						contentHeight = that._viewportHeight,
						bottomHeight = that._totalHeight - (batch * that._viewportHeight) - that._viewportHeight;

					if(bottomHeight <= that._viewportHeight){
						return;
					}

					console.log(topHeight, contentHeight, bottomHeight);

					console.log('start-index...', ((batch + 3) * that._batchSize + 1));

					//setup top container height
					that.$el.find('.top-space-holder').css({height: topHeight});
					that.$el.find('.bottom-space-holder').css({height: bottomHeight});

					//test
					app.remote({
						url: that.options.dataUrl + '?' + that.options.indexKey + '=' + ((batch + 3) * that._batchSize + 1) + '&' + that.options.sizeKey + '=' + that._batchSize,
					}).done(function(data){

						var content = data[that.options.dataKey];

						
						that.less('contents', 0, that._batchSize);
						that.more('contents', content, that.options.rowView);

						

						
					});

						// app.remote({
						// 	url: that.options.dataUrl + '?' + that.options.indexKey + '=' + that.options.initialIndex + '&' + that.options.sizeKey + '=' + (that._size * 5),
						// }).done(function(data){



						// 	//temporary for testing
						// 	_.each(data, function(d, index){

						// 	});
						// });

					//}


					// var viewPortHeight = that.$el.height(),
					// 	el = that.$el[0];
					
					// //use scrollHeight and scrollTop to check if top, bottom or normal
					// //Caveat: scrollTopMax only supported by FF, not supported by Chrome, IE, Opera and Safari


					

					// //check if first screen or not
					// if(el.scrollTop === 0){
					// 	app.remote({
					// 		url: this.options.dataUrl + '?' + this.options.indexKey + '=' + this.options.initialIndex + '&' + this.options.sizeKey + '=' + this._size,
					// 	}).done(function(data){
					// 		that.more('contents', [{items: data[that.options.dataKey]}], Block, true);
					// 	});
					// }
					// //check if last scrren or not
					// if(el.scrollTop >= el.scrollHeight - (this.total % this.size * this._singleHeight)/*last batch height*/){

					// }
					// //normal
					// else{

					// }
				}, 200));

				// //alias
				// var data = this.get(this.options.contentKey),
				// 	total = this.get(this.options.totalKey);

				// //check if data exists
				// if(!data){
				// 	throw new Error('Stage.js::Widget::InfiniteGrid: there is no data provided...');
				// }

				// //TBI: check whether total to determine this is an infinite grid or infinite scroll

				// //show one line of record to get the height
				// this.more('contents', [data.shift()], Row);

				// //.more takes defer
				// _.defer(function(){
				// 	//calculate and setup the height of outer container
				// 	var singleHeight = that.$el.find('.infinite-grid-row').height(),
				// 		totalHeight = singleHeight * total;

				// 	that.$el.find('.outer-container').css({height: totalHeight});

				// 	//calculate how many records can be shown in one window
				// 	var viewPortHeight = that.$el.height(),
				// 		numOfRecords = Math.ceil(viewPortHeight / singleHeight);


				// });

				//var content = _.map(this.options.columns, function(obj, index){ return app.get('InfiniteGridCell', 'Widget').create({data: that.get('items')[0][that.options.columns[index].key]}); });
				

				

				// var that = this;
				// //show header in both tables
				// this.show('header-head', app.get('InfiniteGridHeaders', 'Widget').create({data: this.options.columns}));

				// this.show('body-head', app.get('InfiniteGridHeaders', 'Widget').create({data: this.options.columns}))
				// 	//test
				// 	.once('ready', function(){
				// 		for(var i = 0; i < 50; i++) {
				// 			that.$el.find('.body-holder tbody').append('<tr><td>1</td><td>222</td></tr>');
				// 		}

				// 		//check scroll bar existence, and adjust the width of the header accordingly
				// 		_.defer(function(){
				// 			//get element
				// 			var el = that.$el.find('.body-holder')[0];

				// 			//check whether scrollbar exists, if yes adjust width to make thead and tbody align
				// 			if(el.scrollHeight > el.clientHeight){
				// 				var scrollbarWidth = 17, //scrollbar width is universally 17px in Chrome 34+, IE 10+, FF 28+
				// 					newWidth = that.$el.find('.header-container').width() - scrollbarWidth; //usually scrollbar

				// 				that.$el.find('.header-container').css({
				// 					width: newWidth
				// 				});
				// 			}
				// 		});
				// 	});



				// var that = this;

				// //always show header first, since we need to calculate the height tbody accordingly
				// this.show('header', app.get('InfiniteGridHeaders', 'Widget').create({data: this.options.columns}))
				// 	.once('ready', function(){
				// 		//setup height for tbody
				// 		that.$el.find('tbody').height(that.$el.height() - that.$el.find('thead').height());

				// 		//test
				// 		for(var i = 0; i < 50; i++) {
				// 			that.$el.find('tbody').append('<tr style="display:table;width:100%;"><td>1</td><td>222</td></tr>');
				// 		}

						
						
				// 	});

				
			}

		});

		// var Block = app.view({

		// 	//default tag name
		// 	tagName: 'div',

		// 	//default class name
		// 	className: 'infinite-grid-block',

		// 	//template, show needed rows in this view
		// 	template: '<div region="rows"></div>',

		// 	initialize: function(options){},

		// 	//view:ready
		// 	onReady: function(){
		// 		var that = this;
		// 		console.log('block data...', this.get());
		// 		//append rows to to region rows based on given data
		// 		this.more('rows', this.get('items'), Row);
		// 	},

		// });

		var Row = app.view({

			//default tag name
			tagName: 'tr',

			//default class name
			className: 'infinite-grid-row',

			//template
			template: '<div region="row"></div>',

			initialize: function(options){
				
			},

			//view:ready
			onReady: function(){
				var that = this;

				//append columns to region row based on the order from columns
				_.each(_columns, function(col, index){
					that.more('row', [that.get(col.key)], app.view({tagName: 'td', template: '{{value}}'}));
				});
			},

		});

		//return definiton
		return UI;

	});

})(Application);