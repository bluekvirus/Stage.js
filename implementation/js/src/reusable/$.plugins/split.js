/**
*
* This is the pulg-in that horizontally/vertically spread the children of an div according to the parameter given by user. 
* Additionally, "sub-div"s can freely change their height by dragging a bar inserted by this plug-in. 
* In order to achieve such function, there must be at least two "sub-div"s in the given div.
* 
* Arguments
* ---------
* Three kinds of arugments are allowed for the plugin.
* 
* 1). No argument: if user does not provide any arguments, then this plug-in only inserts divide bars according to the current height of "sub-divs". 
* 					Those divide bars can be dragged to change the size of "sub-div"s.
* 
* 2). Array: user can give an array as an argument, which indicates the height ratio of the "sub-div"s. 
* 		For example: [1,3.5,2] means the three "sub-div"s has height/width ratio of 1:3.5:2. Additionally:
* 		 
* 	i). if the length of the array given by user is less than the number "sub-div"s the requesting div has,
* 		then the "sub-div"s are not assigned a ratio, will be marked as ratio 1. 
* 		For example: if the requesting div has 5 "sub-div"s, and user gives array [1,3,2] as argument, then the plug-in fills given as [1,3,2,1,1].
* 		
* 	ii). if the length of the array given by user is greater than the number "sub-div"s the requesting div has, 
* 		then this plug-in returns an error.
*
* 3). A positive number: user can give a single number as an argument, this plug-in will treat it as the first number of the array mentioned before.
* 		For example: if user give 1 as argument, then all the "sub-div"s will be spread evenly. Because the plug-in will fill the ratio array as [1,1,1.....]
*
* 
* 
* options
* ---------
* hBarClass/vBarClass: string; defines the css class for divide bars
*
* 
* usage
* ---------
* someDiv.hsplit(integer or array or NULL, {options});
* someDiv.vsplit(integer or array or NULL, {options});
* 
* Dependencies
* ------------
* _, $
*
* Author:
* ------------
* Tim Liu, Patrick Zhu
*/



(function($){

	/*===============the hsplit plugin================*/
	$.fn.hsplit = function(args, options){
		var that = this;
		var length = $(this).children().filter('div').length;
		var tempArr;
		options = options || {};
		//get the class name for the divider bars
		var tempClass = options.hBarClass || 'split-hbar';

		//get the height of divide bars by adding an element then remove it
		var tempElem = '<div class="'+tempClass+'"></div>';
		$(this).before(tempElem);
		var barWidth = $(this).prev().height();
		$(this).prev().remove();

		//check whether the requesting div has at least two "sub-div"s
		if(!length || length<2){
			throw new Error("You need at least two 'sub-div's");
		}else{
			//check validation of arguments
			if(!args){//no arguments, spread evenly
				//no arguments, only insert bars
				tempArr = [];
				//get the height of each current div, then calculate the ratio, and put it into ratio array
				_.each($(this).children().filter('div'), function(data, index){
					tempArr[index] = $(data).height() ;
				});
				//pass the ratio array to setLayout, to set the layout :P
				setLayout(this, tempArr);
			}else{
				//array
				if(Array.isArray(args)){
					//error
					if(args.length > length)
						throw new Error("Arugment length is greater than the number of 'sub-div's");
					//length are equal
					else if(args.length === length){
						setLayout(this, args);
					}
					//fillup the ratios
					else if(args.length > 0){
						tempArr = args;
						fillOnes(tempArr, length);
						setLayout(this, tempArr);
					}
					else{
						throw new Error("Arugment length is Zero");
					}
				}
				//number
				else if(!isNaN(args) && isFinite(args)){
					//check whether number is positive
					if( args <= 0){
						throw new Error('Single number must be a positive number');
					}else{
						tempArr = [];
						tempArr[0] = args;
						fillOnes(tempArr, length);
						setLayout(this, tempArr);
					}
				}
				else{
					options = args;
					tempClass = options.vBarClass || 'split-vbar';
					//no arguments, only insert bars
					tempArr = [];
					//get the height of each current div, then calculate the ratio, and put it into ratio array
					_.each($(this).children().filter('div'), function(data, index){
						tempArr[index] = $(data).height() ;
					});
					//pass the ratio array to setLayout, to set the layout :P
					setLayout(this, tempArr);
				}//else for object
			}
		}//else

		//this function takes an array of ratios of "sub-div"s, and
		//set the layout accordingly
		function setLayout(target, ratioArr){
			var length = ratioArr.length;
			var conHeight = $(target).height() - (length-1)*barWidth;
			//calculate height for each "sub-div" in terms of percentage
			var sum = 0;
			_.each(ratioArr, function(data, index){
				sum += data;
			});
			var perHeight = [];
			_.each(ratioArr, function(data, index){
				perHeight[index] = ( (conHeight/sum * data)/($(target).height()) )*100;//in percentage
			});
			//draw the layout
			//set up the position attribute for the parent div
			if($(target).css('position') !== 'absolute' && $(target).css('position') !== 'relative')
				$(target).css({'position':'relative'});
			//
			var top = 0;
			$(target).children().filter('div').each(function(index, elem){
				var $elem = $(this);
				//barwidth in percentage
				var barPercentage = barWidth/($(target).height())*100;
				//set up css for current "sub-div" in terms of percentage
				$elem.css({'position':'absolute', 'top':top+'%','left':'0','width':'100%','height':perHeight[index]+'%'});

				top += perHeight[index];
				//draw the divide bars, last "sub-div" does not need divde bar
				if( index < length-1 ){
					var temp = '<div class="'+tempClass+'" style="position:absolute;width:100%;left:0;top:'+top+'%;"></div>';
					$elem.after(temp);
					//add mouseover and resize event
					$elem.next()
					.mouseover(function(){
						$(this).css({'cursor':'ns-resize'});
					})
					.mousedown(function(){
						var that = this;
						$(target).bind('mousemove', function(event){
							//get relative postion
							var relY = event.pageY - $(this).offset().top;
							var preTop = $(that).prev().position().top;
							var nextBottom = $(that).next().position().top + $(that).next().height();
							if(relY > (preTop+barWidth) && relY < (nextBottom -barWidth) ){
								$(that).css({'top':(relY/$(target).height())*100+'%'});
								//resize "sub-div"s next to the current divider
								resetDiv(that);
							}
						}).mouseup(function(){
							$(target).unbind('mousemove');
						});
						//track window mouseup 
						$(window).mouseup(function(){
							$(target).unbind('mousemove');
						});
					});
					//accumulate the top
					top += barPercentage;
				}
			});
		}

		//this function expand the "sub-divs" according to the position of divide bars
		function resetDiv(divider){
			var preHeight = $(divider).prev().height();
			var preTop = $(divider).prev().position().top;
			var nextTop = $(divider).next().position().top;
			var nextBottom = nextTop + $(divider).next().height();
			var divTop = $(divider).position().top;
			var divHeight = $(divider).height();
			var height = $(divider).parent().height();
			$(divider).prev().css({'height': (( divTop - preTop)/height)*100+'%'});
			$(divider).next().css({'top':((divTop+divHeight)/height)*100+'%', 'height': ((nextBottom - (divTop+divHeight))/height)*100 +'%'});

		}

		//this function fills given array 1s,
		//the total number of "sub-div"s is given by total
		function fillOnes(array, total){
			var length = array.length;
			array.length = total;
			var i = length;
			for( i; i<total; i++ ){
				array[i] = 1;
			}
		}
		return this;
	};


	/*===============the vsplit plugin================*/
	$.fn.vsplit = function(args, options){
		var that = this;
		var length = $(this).children().filter('div').length;
		var tempArr;
		options = options || {};
		//get the class name for the divider bars
		var tempClass = options.vBarClass || 'split-vbar';

		//get the height of divide bars by adding an element then remove it
		var tempElem = '<div class="'+tempClass+'"></div>';
		$(this).after(tempElem);
		var barWidth = $(this).next().width();
		$(this).next().remove();

		//check whether the requesting div has at least two "sub-div"s
		if(!length || length<2){
			throw new Error("You need at least two 'sub-div's");
		}else{
			//check validation of arguments
			if(!args){
				//no arguments, only insert bars
				tempArr = [];
				//get the height of each current div, then calculate the ratio, and put it into ratio array
				_.each($(this).children().filter('div'), function(data, index){
					tempArr[index] = $(data).width() ;
				});
				//pass the ratio array to setLayout, to set the layout :P
				setLayout(this, tempArr);
			}else{
				//array
				if(Array.isArray(args)){
					//error
					if(args.length > length)
						throw new Error("Arugment length is greater than the number of 'sub-div's");
					//length are equal
					else if(args.length === length){
						setLayout(this, args);
					}
					//fillup the ratios
					else if(args.length > 0){
						tempArr = args;
						fillOnes(tempArr, length);
						setLayout(this, tempArr);
					}
					else{
						throw new Error("Arugment length is Zero");
					}
				}//if
				//number
				else if(!isNaN(args) && isFinite(args)){
					//check whether number is positive
					if( args <= 0){
						throw new Error('Single number must be a positive number');
					}else{
						tempArr = [];
						tempArr[0] = args;
						fillOnes(tempArr, length);
						setLayout(this, tempArr);
					}
				}//else if number
				else{
					options = args;
					tempClass = options.vBarClass || 'split-vbar';
					//no arguments, only insert bars
					tempArr = [];
					//get the height of each current div, then calculate the ratio, and put it into ratio array
					_.each($(this).children().filter('div'), function(data, index){
						tempArr[index] = $(data).width() ;
					});
					//pass the ratio array to setLayout, to set the layout :P
					setLayout(this, tempArr);
				}//else for object

			}//else
		}//else

		//this function takes an array of ratios of "sub-div"s, and
		//set the layout accordingly
		function setLayout(target, ratioArr){
			var length = ratioArr.length;
			var conWidth = $(target).width() - (length-1)*barWidth;
			//calculate height for each "sub-div" in terms of percentage
			var sum = 0;
			_.each(ratioArr, function(data, index){
				sum += data;
			});
			var perWidth = [];
			_.each(ratioArr, function(data, index){
				perWidth[index] = ( (conWidth/sum * data)/($(target).width()) )*100;//in percentage
			});
			//draw the layout
			//set up the position attribute for the parent div
			if($(target).css('position') !== 'absolute' && $(target).css('position') !== 'relative'){
				$(target).css({'position':'relative'});
			}
				
			//
			var left = 0;
			$(target).children().filter('div').each(function(index, elem){
				var $elem = $(this);
				//barwidth in percentage
				var barPercentage = barWidth/($(target).width())*100;
				//set up css for current "sub-div" in terms of percentage
				$elem.css({'position':'absolute', 'top':0,'left':left+'%','height':'100%','width':perWidth[index]+'%'});

				left += perWidth[index];
				//draw the divide bars, last "sub-div" does not need divde bar
				if( index < length-1 ){
					var temp = '<div class="'+tempClass+'" style="position:absolute;height:100%;top:0;left:'+left+'%;"></div>';
					$elem.after(temp);
					//add mouseover and resize event
					$elem.next()
					.mouseover(function(){
						$(this).css({'cursor':'ew-resize'});
					})
					.mousedown(function(){
						var that = this;
						$(target).bind('mousemove', function(event){
							//get relative postion
							var relX = event.pageX - $(this).offset().left;
							var preLeft = $(that).prev().position().left;
							var nextRight = $(that).next().position().left + $(that).next().width();
							if(relX > (preLeft+barWidth) && relX < (nextRight -barWidth) ){
								$(that).css({'left':(relX/$(target).width())*100+'%'});
								//resize "sub-div"s next to the current divider
								resetDiv(that);
							}
						}).mouseup(function(){
							$(target).unbind('mousemove');
						});
						//track window mouseup 
						$(window).mouseup(function(){
							$(target).unbind('mousemove');
						});
					});
					//accumulate the left
					left += barPercentage;
				}
			});
		}

		//this function expand the "sub-divs" according to the position of divide bars
		function resetDiv(divider){
			var preWidth = $(divider).prev().width();
			var preLeft = $(divider).prev().position().left;
			var nextLeft = $(divider).next().position().left;
			var nextRight = nextLeft + $(divider).next().width();
			var divLeft = $(divider).position().left;
			var divWidth = $(divider).width();
			var width = $(divider).parent().width();
			$(divider).prev().css({'width': (( divLeft - preLeft)/width)*100+'%'});
			$(divider).next().css({'left':((divLeft+divWidth)/width)*100+'%', 'width': ((nextRight - (divLeft+divWidth))/width)*100 +'%'});

		}

		//this function fills given array 1s,
		//the total number of "sub-div"s is given by total
		function fillOnes(array, total){
			var length = array.length;
			array.length = total;
			var i = length;
			for( i; i<total; i++ ){
				array[i] = 1;
			}
		}
		return this;
	};


})(jQuery);