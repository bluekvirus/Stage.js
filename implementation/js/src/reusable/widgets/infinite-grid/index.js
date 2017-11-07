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
					'<div class="contents"></div>',
					'<div class="bottom-space-holder"></div>',
				'</div>',
			],

			//initialize widget
			initialize: function(options){
				var that = this;

				//locally stored value for 

				//trim user options
				this.options = _.extend({
					className: '',
					rowHeight: 40, //fixed row height in px
					rowView: '<div>this is the content</div>', //view name or definition
					data: [{default: 'no data given'}],
					columns: [{key: 'default'}],
					totalKey: 'total',
					dataKey: 'payload',
					details: false, //TBI
					initialIndex: 0,
					//default query parameter
					dataUrl: '/sample/infinite',
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

				//load first record in order to calculate height
				app.remote({
					url: this.options.dataUrl + '?' + this.options.indexKey + '=' + this.options.initialIndex + '&' + this.options.sizeKey + '=1',
				}).done(function(data){
					//get content and total number of records
					var content = data[that.options.dataKey],
						total = data[that.options.totalKey];

					//check if data exists
					if(!content){
						throw new Error('Stage.js::Widget::InfiniteGrid: there is no data provided...');
					}

					//TBI: check whether total to determine this is an infinite grid or infinite scroll

					//show one line of record to get the height
					//that.more('contents', [content.shift()], Row);

					//calculate and setup the height of outer container
					var singleHeight = that.options.rowHeight,
						totalHeight = singleHeight * total;

					that.$el.find('.outer-container').css({height: totalHeight});

					//store values locally for later use
					that._startIndex = that.options.initialIndex;
					that._total = total;
					that._singleHeight = singleHeight;
					that._size = Math.ceil(that.$el.height() / singleHeight); //how many records can be shown in one window
					that._contentHeight = that._singleHeight * that._size * 5; //top 2 batch, bottom 2 batch and 1 batch for real content. total 5 batch
					that._totalHeight = totalHeight;

					//test, insert fake contents
					
					//setup content 'div' height
					that.$el.find('.contents').css({height: that._contentHeight});

					for(var i = 0; i < (that._size * 5); i++){
						that.$el.find('.contents').append('<div style="height:40px;">' + i + ' some content</div>');
					}

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
					var batch = Math.floor(this.scrollTop / Math.ceil(that.$el.height()));

					if(batch === _currentBatch){
						return;
					}

					var topHeight = batch * that.$el.height(),
						contentHeight = that.$el.height(),
						bottomHeight = that._totalHeight - (batch * that.$el.height()) - that.$el.height();

					console.log(topHeight, contentHeight, bottomHeight);

					//setup top container height
					that.$el.find('.top-space-holder').css({height: topHeight});
					that.$el.find('.contents').css({height: contentHeight});
					that.$el.find('.bottom-space-holder').css({height: bottomHeight});

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