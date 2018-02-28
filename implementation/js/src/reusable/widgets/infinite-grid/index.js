/**
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
				style: 'height:100%; width:100%; position:relative;',
			},

			//template
			template: [
				//register action on the outer container, and make it scrollable
				'<div class="outer-container" action-scroll="scroll-grid" style="height:100%; width:100%; overflow-y:auto;">',
				'<div class="inner-container">',
				'<div class="top-space-holder"></div>',
				'<div class="contents" region="contents"></div>',
				'</div>',
				'</div>',
			],

			//initialize widget
			initialize: function(options) {
				var that = this;

				//check whether user has defined data attribute
				if (!this.data) {
					throw Error('Widget::InfiniteGrid::You need to specify the data attribute for infinite grid view...');
				}

				//trim user options
				this.options = _.extend({
					rowHeight: 25, //fixed row height in px
					rowView: app.view({ template: '<span>ID: {{id}}</span> <span>IP: {{id}}.{{id}}.{{id}}.{{id}}</span>', attributes: { style: 'height: 25px;width:100%;' } }), //view name or definition
					totalKey: 'total',
					dataKey: 'payload',
					initialIndex: 0,
					//default query parameter
					indexKey: 'start',
					sizeKey: 'size',
					//additional query parameter needed for fetching information
					params: {},
				}, options);

				//metadata used for setting up scroll later
				this._prevScrollTop = 0;
				this._batches = [];
				//parse parameters into a string
				this._paramStr = _.reduce(_.pairs(this.options.params), function(memo, arr) { return memo + '&' + arr.join('='); }, '');

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
				this.trigger('view:reconfigure', { index: this.options.initialIndex }, true);
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
					url: this.data + '?' + this.options.indexKey + '=' + obj.index + '&' + this.options.sizeKey + '=' + (obj.size || (this._batchSize * 5)) + this._paramStr,
					async: false,
				}).done(function(data) {

					//get content and total number of records
					var content = that.options.dataKey ? data[that.options.dataKey] : data,
						total = data[that.options.totalKey];

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
						that._totalHeight = that.options.rowHeight * data[that.options.totalKey];
						that.$el.find('.inner-container').css({ height: that._totalHeight });

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
						//check whether to hardreset dimension for near top and bottom
						//adjust height of the space holders first
						that.$el.find('.top-space-holder').css({ height: obj.topHeight });

						//hard reset scrollTop, if necessary
						if (obj.scrollTop) {
							obj.el.scrollTop = obj.scrollTop;
							that._prevScrollTop = obj.scrollTop;
						}
					}

					//split content into five batches based on the indices
					//Caveat: Do NOT use new Array(5).fill([]), use [[], [], [], [], []] instead to avoid unexpected result
					content = _.reduce(content, function(memo, value, index) { memo[Math.floor(index / that._batchSize)].push(value); return memo; }, [[],[],[],[],[]]);

					//Caveat: Do NOT pass two dimensional array into view.more(). Convert them into an array of objects first.
					_.map(content, function(val, index) { content[index] = { items: val, batchIndex: obj.batchIndex + index }; });

					//show data in batches, use defer to make sure previous render has complete to avoid unexpected results
					_.defer(function() {
						that.more('contents', content, that._SingleBatchView, true);
					});

				}).fail(function(data) {
					throw new Error('Stage.js::Widget::InfiniteGrid: error fetch data from url ' + that.data + '...');
				});
			},

			actions: {
				//main action function for scrolling grid, use throttle to control event triggering
				'scroll-grid': function($self, e) {
					//make a reference to the elements
					var el = $self[0],
						that = this;
					//clear previous time out
					clearTimeout(this._timer);
					//setup new timeout
					this._timer = setTimeout(function() {
						that._scroll(el);
					}, 100);
				},
			},

			_scroll: function(el) {

				//calculate index for current scrollTop and previous scrollTop
				var prevIndex = this._calBatch(this._prevScrollTop),
					currentIndex = this._calBatch(el.scrollTop);

				//check smooth scroll or fast scroll
				if (currentIndex === prevIndex + 1) {
					//smooth scroll down
					this._smoothScroll(el, currentIndex, 'down');

				} else if (currentIndex === prevIndex - 1) {
					//smooth scroll up
					this._smoothScroll(el, currentIndex, 'up');
				} else if (currentIndex > prevIndex + 1 || currentIndex < prevIndex - 1) {
					//fast scroll, no matter of the orientation
					this._fastScroll(el, currentIndex);
				} else {
					//no change and do nothing, keep this branch as a reminder
				}

				//no matter what kind of scoll, update scrollTop
				this._prevScrollTop = el.scrollTop;
			},

			//complete update content at once, if user scrolls too fast
			_fastScroll: function(el, currentIndex) {

				//check the value of currentIndex to decide how to reconfigure the gird
				if (currentIndex > 2 && currentIndex < this._batches.length - 2) { //normal

					this.trigger('view:reconfigure', { el: el, index: this._batches[currentIndex].index, size: this._batchSize * 5, topHeight: currentIndex * this._viewportHeight, batchIndex: currentIndex });

				} else if (currentIndex <= 2) { //first five batches

					this.trigger('view:reconfigure', { el: el, index: this._batches[0].index, size: this._batchSize * 5, topHeight: 0, batchIndex: 0, scrollTop: 0 });

				} else if (currentIndex >= this._batches.length - 2) { //last five batches

					this.trigger('view:reconfigure', { el: el, index: this._batches[this._batches.length - 5].index, size: 4 * this._batchSize + this._lastBatchRecords, topHeight: this._totalHeight - (4 * this._batchSize + this._lastBatchRecords) * this.options.rowHeight, batchIndex: this._batches.length - 5, scrollTop: this._totalHeight - (1 * this._batchSize + this._lastBatchRecords) * this.options.rowHeight });

				}
			},

			//smooth update content if user scrolls smoothly
			_smoothScroll: function(el, currentIndex, orientation) {
				var that = this,
					$el = $(el),
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

				//check orientation and update grid accordingly
				if (orientation === 'down') {
					//if orientation is down, then delete first batch and append a new batch at the bottom
					app.remote({
						url: this.data + '?' + this.options.indexKey + '=' + this._batches[lastBatchIndex + 1].index +
							'&' + that.options.sizeKey + '=' + this._batchSize +
							this._paramStr,
						async: false, //disable async for consistent performance
					}).done(function(data) {
						//fetch content
						content = that.options.dataKey ? data[that.options.dataKey] : data;

						//update content
						//close the top view contains the first batch
						$firstEl.data('view').close();

						//adjust height of the space holders
						that.$el.find('.top-space-holder').css({
							height: (firstBatchIndex + 1) * that._viewportHeight
						});

						//append new batch at the bottom
						that.more('contents', [{ items: content, batchIndex: lastBatchIndex + 1 }], that._SingleBatchView);

					});

				} else if (orientation === 'up') {

					//if orientation is up, then delete last batch and insert a new batch at the top
					app.remote({
						url: this.data + '?' + this.options.indexKey + '=' + this._batches[firstBatchIndex - 1].index +
							'&' + that.options.sizeKey + '=' + this._batchSize +
							this._paramStr,
						async: false, //disable async for consistent performance
					}).done(function(data) {
						//fetch content
						content = that.options.dataKey ? data[that.options.dataKey] : data;

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

					});

				}
			},

			//function to generate an array of batch "scrollTop" and startIndex
			_initBatch: function() {
				//what do we need?
				//totalHeight, viewportHeight, numberOfBatches, numOfRecords for each batch

				//use for loop
				for (var i = 0; i < this._totalNumOfBatches; i++) {
					//push scrollTop and startIndex
					this._batches.push({
						scrollTop: i * this._viewportHeight,
						scrollLimit: (i + 1) * this._viewportHeight,
						index: this.options.initialIndex + i * this._batchSize
					});
				}
			},

			//function to check what batches should be shown
			_calBatch: function(scrollTop) {
				var index = _.findIndex(this._batches, function(obj) { return scrollTop >= obj.scrollTop && scrollTop < obj.scrollLimit; });
				return index;
			},
		});

		//return definiton
		return UI;

	});

})(Application);