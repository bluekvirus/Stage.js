/**
 * This is a widget to generate infinite scrollable grid, which can eliminate performance barrier when loading large amount of data.
 * To only show a small batch of data, the backend should be able to return records with an start index and number of records desired.
 * Every record in this widget is a view, which can be defined in the widget options.
 *
 * This widget is highly customizable. Following are all the options currently taken by the widget.
 * 
 * {
 * 		className: '', //customized class name for easy styling
		rowHeight: 25, //fixed row height in px, must given!
		rowView: {obj}, //view definition, NOT instance
		totalKey: 'total', //the key for giving total number of records
		dataKey: 'payload', //the key contains data
		initialIndex: 0, //starting index
		dataUrl: 'sample/infinite', //data url to query from backend
		indexKey: 'start', //index param to give to backend
		sizeKey: 'size', //size param to give to backend
 * }
 *
 * @author: Patrick Zhu
 * @created: 2017.10.20
 */


;(function(app){

	app.widget('InfiniteGrid', function(){

		//save a local copy for later use
		var _columns = [];

		//definition of widget
		var UI = app.view({

			//default class name for styling
			className: 'infinite-grid',

			//style attributes for the widgets, position relative is for setting absolute position on content block
			attributes: {
				style: 'height:100%; width:100%; position:relative;',
			},

			//template
			template: [
				//register action on the outer container, and make it scrollable
				'<div class="outer-container" action-scroll="scroll-grid" style="height:100%; width:100%; overflow-y:auto;">',
					'<div class="inner-container">',
						'<div class="top-space-holder"></div>',
						'<div class="contents" region="contents"></div>',
						'<div class="bottom-space-holder"></div>',
					'</div>',
				'</div>',
			],

			//initialize widget
			initialize: function(options){
				var that = this;
				
				//used for setting up scroll later	
				this._prevScrollTop = 0;
				this._scrolldownThreshold = 0;
				this._scrollupThreshold = 0;

				//trim user options
				this.options = _.extend({
					className: '',
					rowHeight: 25, //fixed row height in px
					rowView: app.view({template: '<span>ID: {{id}}</span> <span>IP: {{id}}.{{id}}.{{id}}.{{id}}</span>', attributes: {style: 'height: 25px;width:100%;'}}), //view name or definition
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
			},

			setupGrid: function(){
				var that = this;

				//store the viewport height
				this._viewportHeight = this.$el.find('.outer-container').height();

				//calculate how many records can be shown in one viewport
				this._batchSize = Math.ceil(this._viewportHeight / this.options.rowHeight);

				//setup initial threshold for updating scroll
				this._scrolldownThreshold = this._viewportHeight * 2;
				this._scrollupThreshold = 0; //make it initially 0

				//load first record in order to calculate height
				//initially load five batches of data
				app.remote({
					url: this.options.dataUrl + '?' + this.options.indexKey + '=' + this.options.initialIndex + '&' + this.options.sizeKey + '=' + (this._batchSize * 5),
				}).done(function(data){
					//get content and total number of records
					var content = that.options.dataKey ? data[that.options.dataKey] : data,
						total = data[that.options.totalKey];

					//store total height locally
					that._totalHeight = that.options.rowHeight * data[that.options.totalKey];

					//store total number of batches
					that._totalNumOfBatches = Math.ceil(total / that._batchSize);

					//check if data exists
					if(!content){
						throw new Error('Stage.js::Widget::InfiniteGrid: there is no data provided...');
					}

					//setup the height of outer-container
					that.$el.find('.inner-container').css({height: that._totalHeight});

					//setup the contents view height
					//use single row height to calculate not the batchsize and viewport height for better smoother rendering
					that.$el.find('.contents').css({height: that.options.rowHeight * that._batchSize * 5});

					//more all the first batch views
					that.more('contents', content, that.options.rowView);

				}).fail(function(data){
					throw new Error('Stage.js::Widget::InfiniteGrid: error fetch data from url ' + that.options.dataUrl + '...');
				});
			},

			actions: {
				//main action function for scrolling grid, use throttle to control event triggering
				'scroll-grid': function($self, e){
					var el = $self[0],
						that = this,
						content;

					//scroll down branch
					//if current scrollTop has exceeded scrolldownThreshold, then update data.
					if((this._prevScrollTop < el.scrollTop) && (el.scrollTop > this._scrolldownThreshold)){
						//update scroll down thresholds, first
						this._scrolldownThreshold = (Math.floor(el.scrollTop / this._viewportHeight) + 1) * this._viewportHeight;

					}
					//scroll up branch
					else if((this._prevScrollTop > el.scrollTop) && ( el.scrollTop < this._scrollupThreshold)){
						//update scroll down threshold, first
						this._scrolldownThreshold = (Math.floor(el.scrollTop / this._viewportHeight) - 1) * this._viewportHeight;
					}else{
						//not meeting the threshold. update scrollTop for future reference, and return
						this._prevScrollTop = el.scrollTop;
						return;
					}

					//update scroll up threshold
					this._scrollupThreshold = this._scrolldownThreshold + this._viewportHeight;
					
					//use scroll down threshold as a reference point, and check whether it is within valid range
					if(
						(this._scrolldownThreshold / this._viewportHeight - 2) >= 0 && 
						(this._scrolldownThreshold / this._viewportHeight - 2 + 5) <= this._totalNumOfBatches

					){
						//update the data in the grid
						//take out the current last batch and attach a batch at the top of the content
						app.remote({
							url: this.options.dataUrl + '?' + this.options.indexKey + '=' + ((this._scrolldownThreshold / this._viewportHeight - 2) * this._batchSize + this.options.initialIndex) + '&' + that.options.sizeKey + '=' + (this._batchSize * 5),
							async: false, //disable async for consistent performance
						}).done(function(data){

							//fetch content
							content = that.options.dataKey ? data[that.options.dataKey] : data;
							
							//update content
							that.more('contents', content, that.options.rowView, true);
							
							//adjust height of the space holders
							that.$el.find('.top-space-holder').css({height: that._scrolldownThreshold - 2 * that._viewportHeight});
							that.$el.find('.bottom-space-holder').css({height: that._totalHeight - that._scrolldownThreshold - 3 * that._viewportHeight});
							
						});
					}

					//update scrollTop for future reference
					this._prevScrollTop = el.scrollTop;
				},
			},

			//view:ready
			onReady: function(){
				//initial setup of the grid
				this.setupGrid();
			}

		});

		//return definiton
		return UI;

	});

})(Application);