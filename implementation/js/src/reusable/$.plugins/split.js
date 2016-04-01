/**
 * This is the pulg-in that horizontally/vertically spread the children of an div according to the options below.
 * options: {
 *		direction: 'h' or 'v',
 *	 	split: ['1:region', '1:View', 'xs-6, md-4:region', 'md-6:View', '1:region:fixed', '2:View:fixed'],
 *	  	height: 'auto' || number,
 *	   	width: 'auto' || number,
 *	    adjustable: true or false
 *	    barClass: '...' //css class name for divide bars
 *  }
 * @author Patrick Zhu
 * @created 2016.02.09
 */

;(function($){
	//global queue for storing tasks
	var taskQueue = [];
	//main function
	$.fn.split = function(options){
		options = options || {};
		//check whether options is an array
		if(_.isArray(options)){
			var tempOptions = options;
			options = {};
			options.split = tempOptions;
		}
		//default parameters
		var direction = options.direction || 'h',
			split = options.split || ['1:sample-region', '1:SampleView'],
			//type = options.type || 'free', //not used until future 'boostrap' support
			//min = options.min || 20, //do not work well with flexbox
			height = options.height || '100%',
			width = options.width || '100%',
			adjustable = options.adjustable || false,
			barClass = options.barClass || 'split-' + direction + 'bar',
			$this = (this[0].$el) ? this[0].$el : $(this),
			counter = 1;//count the number of plug-in gets called
		//push initial task into queue
		taskQueue.push({
			$element: $this,
			direction: direction,
			adjustable: adjustable,
			split: split,
			height: height,
			width: width,
			barClass: barClass
		});
		while(taskQueue.length > 0){
			setDomLayout(taskQueue[0].$element, taskQueue[0].direction, taskQueue[0].adjustable, taskQueue[0].split, taskQueue[0].height, taskQueue[0].width, taskQueue[0].barClass, counter);
			counter++;
			taskQueue.shift();		
		}
	};
	//functions
	var setDomLayout = function($elem, direction, adjustable, split, height, width, barClass, counter){
		var trimmed = [],
			dir = (direction === 'h')? 'column' : 'row',
			template = '';
		//expand height and width for parent element
		if(height !== 'auto' && counter === 1/*only give heigh/width for the first layer of element, flex automatically sets width/height*/)
			$elem.css({height: height});
		if(width !=='auto' && counter === 1)
			$elem.css({width: width});
		//trim the split array
		_.each(split, function(data, index){
			if(_.isArray(data)){
				if(data.length !== 2)
					throw new Error('Dev::runtime::split-plugin::the array in split can only have a length of 2.');
				trimmed[index] = data[0].split(':');
			}else if(_.isString(data)){
				trimmed[index] = data.split(':');
			}else{
				throw new Error('Dev::runtime::split-plugin::the elements in split can only be an array with length 2 or a string.');
			}
		});
		if(_.isArray(split)){//single dimension layout
			//check whether adjustable or not
			if(adjustable){//adjustable
				//show divide bar and remove to get height/width for divide bar
				//insert flexboxes
				//set parent style
				$elem.css({
					display: 'flex',
					'flex-direction': dir,
					'flex-wrap': 'nowrap',
					'justify-content': 'space-around'
				});
				//insert bars and flexboxs
				_.each(trimmed, function(data, index){
					var position = (data[2])? 'postion:' + data[2] + ';':'',
						$bar,
						$currentEl;
					//check whether fixed or not
					if(data[0].match(/(px)/)){//fixed px
						$currentEl = $('<div ' + getRegionOrViewName(data[1]) + ' style="flex: 0 0 ' + Number.parseFloat(data[0]) + 'px;' + position + '"></div>').appendTo($elem);
					}else if(data[0].match(/(em)/)){//fixed em
						$currentEl = $('<div ' + getRegionOrViewName(data[1]) + ' style="flex: 0 0 ' + Number.parseFloat(data[0]) + 'em;' + position + '"></div>').appendTo($elem);
					}else{//not fixed px or em
						$currentEl = $('<div '+ getRegionOrViewName(data[1]) +' style="flex:' + Number.parseFloat(data[0]) + ';' + position + '"></div>').appendTo($elem);
					}
					//check whether there is a two dimension layout for this div
					if(_.isArray(split[index])){
						taskQueue.push({
							$element: $currentEl,
							direction: (direction === 'h') ? 'v' : 'h',
							adjustable: adjustable,
							split: split[index][1],
							height: height,
							width: width,
							barClass: (direction === 'h') ? 'split-vbar' : 'split-hbar'
						});
					}
					//insert a bar after the element
					if(index < split.length - 1)
						$bar = $('<div class="' + barClass + '" style="flex: 0 0 2px;"></div>'/*2px is temprary place holder*/).appendTo($elem);
				});
				//insert a bar at the end to get real height/width later
				var $bar = $('<div class="' + barClass + '"></div>').appendTo($elem);
				//use defer to get height/width after the bar is ready;
				_.defer(function(){
					//get barwidth
					var barwidth = (direction === 'h')? $bar.height() : $bar.width(),
						totalTolerance = 1.01;
						singelTolerance = 0.5;
					//remove $bar
					$bar.remove();
					//setup all the bars
					_.each($elem.find('>div+.' + barClass), function(data, index){
						var $data = $(data);
						//overwrite default flex style
						$data.css({
							flex: '0 0 ' + barwidth + 'px'
						});
						//if previous flexbox is fixed px/em, then delete event on the bar before that flexbox
						if(trimmed[index][0].match(/(px|em)/)){
							if($data.prev().prev().length > 0)
								$data.prev().prev().unbind('mouseover mousedown mouseup');
						}else{
							//separate horizontal and vertical cases
							if(direction === 'h'){//horizontal
								/*!register resize event!*/
								$data.mouseover(function(){
									$data.css({cursor: 'ns-resize'});
								})
								.mousedown(function(){
									//get the sum of flex-grow for both resizing elements
									var flexSum = Number.parseFloat($data.prev().css('flex-grow')) + Number.parseFloat($data.next().css('flex-grow'));
									//bind mouse move
									$elem.bind('mousemove', function(e){
										var relY = e.pageY - $elem.offset().top,
											//get previous bars bottom
											prevBottom = ($data.prev().prev().length > 0) ? $data.prev().prev().position().top + $data.prev().prev().height() : 0,
											//get next bars top
											nextTop = ($data.next().next().length > 0) ? $data.next().next().position().top : $elem.height(),
											//reset layout
											prevHeight = relY - prevBottom,
											nextHeight = nextTop - (relY + barwidth),
											newFlexTop = (prevHeight) / (prevHeight + nextHeight) * flexSum; // A / ( A + B ) * Sum
											newFlexBottom = (nextHeight) / (prevHeight + nextHeight) * flexSum;
										//protect the flexsum, not over strech it		
										if((newFlexTop + newFlexBottom) <= (flexSum * totalTolerance) && newFlexTop > singelTolerance && newFlexBottom > singelTolerance){
											$data.prev().css({'flex-grow': newFlexTop});
											$data.next().css({'flex-grow': newFlexBottom});
										}else{
											$elem.unbind('mousemove');
										}
									});
								})
								.mouseup(function(){
									$elem.unbind('mousemove');
								});
								//track window mouseup, just in case
								$window.mouseup(function(){
									$elem.unbind('mousemove');
								});
							}else{//vertical
								$data.mouseover(function(){
									$data.css({cursor: 'ew-resize'});
								})
								.mousedown(function(){
									//get the sum of flex-grow for both resizing elements
									var flexSum = Number.parseFloat($data.prev().css('flex-grow')) + Number.parseFloat($data.next().css('flex-grow'));
									$elem.bind('mousemove', function(e){
										var relX = e.pageX - $elem.offset().left,
											//get previous bars bottom
											prevRight = ($data.prev().prev().length > 0) ? $data.prev().prev().position().left + $data.prev().prev().width() : 0,
											//get next bars top
											nextLeft = ($data.next().next().length > 0) ? $data.next().next().position().left : $elem.width(),
											//reset layout
											prevWidth = relX - prevRight,
											nextWidth = nextLeft - (relX + barwidth),
											newFlexLeft = (prevWidth) / (prevWidth + nextWidth) * flexSum; // A / ( A + B ) * Sum
											newFlexRight = (nextWidth) / (prevWidth + nextWidth) * flexSum;
										//protect the flexsum, not over strech it									
										if((newFlexLeft + newFlexRight) <= (flexSum * totalTolerance) && newFlexLeft > singelTolerance && newFlexRight > singelTolerance){
											$data.prev().css({'flex-grow': newFlexLeft});
											$data.next().css({'flex-grow': newFlexRight});
										}else{
											$elem.unbind('mousemove');
										}
									})
									.mouseup(function(){
										$elem.unbind('mousemove');
									});
									//track window mouseup, just in case
									$window.mouseup(function(){
										$elem.unbind('mousemove');
									});
								});
							}
						}
						if(index === (trimmed.length - 2) && trimmed[index+1][0].match(/(px|em)/)){
							$data.unbind('mouseover mousedown mouseup');
						}
					});
				});
			}else{//not adjustable
				
				//insert flexboxes
				//set parent style
				$elem.css({
					display: 'flex',
					'flex-direction': dir,
					'flex-wrap': 'nowrap',
					'justify-content': 'space-around'
				});
				//insert
				_.each(trimmed, function(data, index){
					//check position settings
					var position = (data[2]) ? 'position:' + data[2] + ';' : '',
						$currentEl;
					//check whether fixed or not
					if(data[0].match(/(px)/)){//fixed px
						$currentEl = $('<div ' + getRegionOrViewName(data[1]) + ' style="flex: 0 0 ' + Number.parseFloat(data[0]) + 'px;' + position + '"></div>').appendTo($elem);
					}else if(data[0].match(/(em)/)){//fixed em
						$currentEl = $('<div ' + getRegionOrViewName(data[1]) + ' style="flex: 0 0 ' + Number.parseFloat(data[0]) + 'em;' + position + '"></div>').appendTo($elem);
					}else{//not fixed px or em
						$currentEl = $('<div '+ getRegionOrViewName(data[1]) +' style="flex:' + Number.parseFloat(data[0]) + ';' + position + '"></div>').appendTo($elem);
					}
					//check whether there is a two dimension layout for this div
					if(_.isArray(split[index])){
						taskQueue.push({
							$element: $currentEl,
							direction: (direction === 'h') ? 'v' : 'h',
							adjustable: adjustable,
							split: split[index][1],
							height: height,
							width: width
						});
					}
				});
			}
		}else{
			throw new Error('Dev::runtime::split-plugin::the split parameter is error. it can only be an array.');
		}
	};

	//get region or view name
	var getRegionOrViewName = function(str){
		var rvname = '',
			tempClass;
		//check whether given a region or view name
		if(str){
			//check the start of the string
			if(str.charAt(0) === '#'){//id
				rvname = 'id="' + str.slice(1) + '"';
			}else if(str.charAt(0) === '.'){//class
				//separate classes, either space or comma will do
				tempClass = str.split(/[\s,]+/);
				//trim classes to illiminate spaces, and add to return value
				rvname = 'class="';
				_.each(tempClass, function(data, index){
					var tempStr = _.string.trim(data);
					//delete . at the beginning if exits
					if(tempStr.charAt(0) === '.')
						tempStr = tempStr.slice(1);
					//append string
					rvname += tempStr;
					//append space if not last one
					if(index < tempClass.length - 1)
						rvname += ' ';
				});
				rvname += '"';
			}else{//region/view name
				if(str.charAt(0) === str.charAt(0).toUpperCase())
					rvname = 'view="' + str + '"';
				else if(str.charAt(0) === str.charAt(0).toLowerCase())
					rvname = 'region="' + str + '"';
				else
					console.warn('please check your region/view name setting.');
			}
		}
		return rvname;
	};

})(jQuery);