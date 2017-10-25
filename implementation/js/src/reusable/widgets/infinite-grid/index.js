//infinite gird... TBI
//
//@author: Patrick Zhu
//@created: 2017.10.20

/**
 * user configuration for now
 *
 * {
 * 		className: 'string', //customized class name for easier styling
 * 		cellTag: 'li' or 'tr' or 'div', //three different implemenations ul->li, tbody->tr, div->div, default is ul and li
 * 		data: [{a: 1, b: 2, c: 3...}, {a: 4, b: 5, c: 6...}, ...],
 * 		columns: [{name: 'a', type: 'string..', label: 'string...'} or 'string'], //order of the data columns and type of columns(similar as datagrid)
 * 		totalKey: 'string', //key in the data that gives the total number of entries. default is 'total'
 * 		details: true or false, //similar to datagrid, TBI
 * }
 */


;(function(app){

	app.widget('InfiniteGrid', function(){

		//used for templating later, TBD
		var parentTagMapping = {
			li: 'ul',
			tr: 'tbody',
			div: 'div',
		};

		//definition of widget
		var UI = app.view({

			//default class name for styling
			className: 'infinite-grid',

			//template
			//use two identical table, one for thead(invisible tbody, z-index 1), one for tbody(invisible tbody, z-index 0)
			template: [
				'<div class="outer-container">',
					'<div class="content-container"></div>',
				'</div>',
			],

			//initialize widget
			initialize: function(options){
				var that = this;
				//trim user options
				this.options = _.extend({
					className: '',
					cellTag: 'li',
					data: [{default: 'no data given'}],
					columns: [{name: 'default'}],
					totalKey: 'total',
					details: false, //TBI
				}, options);

				//add class name to this view
				this.$el.addClass(this.options.className);

				//trim options.columns to appropriate format
				_.each(this.options.columns, function(col, index){

					//string
					if(_.isString(col)){
						var temp = {};
						temp.name = col;
						temp.cell = 'string';
						temp.label = _.string.titleize(col);

						//setup column
						that.options.columns[index] = temp;
					}
					//object
					else if(_.isPlainObject(col)){
						col.cell = col.cell || 'string';
						col.label = col.label || _.string.titleize(col.name); //no need to check col.name here
					}
					//error
					else{
						throw new Error('Stage.js::Widget::InfiniteGrid: the elements inside columns can only be Object or String');
					}
				});
			},

			//view:ready
			onReady: function(){
				var that = this;

				//show one line of record to get the height 

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

		//return definiton
		return UI;

	});

})(Application);