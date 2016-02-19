/*
 *layout: {
 *	direction: 'h' or 'v',
 *	split: ['1:region', '1:View', 'xs-6, md-4:region', 'md-6:View', '1:region:fixed', '2:View:fixed'],
 *	type: 'bootstrap', 'free' or 'flexbox'(TBD)
 *	min: number,
 *	height: 'auto' || number,
 *	width: 'auto' || number,
 *	adjustable: true or false
 *}
 */

/*
 * machanism for the plugin
 * if not adjustable then use flexbox
 * if adjustable use the percentage one
 * if the split is an object, then it should be a two dimension layout
 * and it only uses flexbox
 */

;(function($){

	$.fn.split = function(options, view){
		options = options || {};
		//default parameters
		var direction = options.direction || 'h',
			split = options.split || ['1:sample-region', '1'],
			type = options.type || 'free',
			//min = options.min || 20, //do not work well with flexbox
			height = options.height || '100%',
			width = options.width || '100%',
			adjustable = options.adjustable || false,
			barclass = options.barclass || 'split-' + direction + 'bar',
			that = this,
			$this = ( view )? this : $(this);
		//check whether is layout for view
		if( view ){//for view
			setViewLayout(view, direction, adjustable, split, height, width, barclass);
		}else{//for DOM element
			setDomLayout($this, direction, adjustable, split, height, width, barclass);
		}
	};

	var setDomLayout = function($elem, direction, adjustable, split, height, width, barclass){
		var trimmed = [],
			dir = ( direction === 'h' )? 'column' : 'row',
			template = '';
		//expand height and width for parent element
		if(height !== 'auto')
			$elem.css({height: height});
		if(width !=='auto')
			$elem.css({width: width});
		//check whether two dimension layout or single dimension layout
		if($.isPlainObject(split)){//two dimension layout

		}else if(_.isArray(split)){//single dimension layout
			//check whether adjustable or not
			if(adjustable){//adjustable
				//show divide bar and remove to get height/width for divide bar
				$elem.append('<div class="' + barclass + '"></div>');
				var barwidth = $elem.find('.' + barclass)[(direction === 'h')? 'height' : 'width']();
				$elem.find('.' + barclass).remove();
				//trim the split array
				_.each(split, function(data, index){
					trimmed[index] = data.split(':');
				});
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
					var position = (data[2])? 'postion:' + data[2] + ';':'',
						$bar,
						$currentEl;
					//check whether fixed or not
					if(data[0].match(/(px)/)){//fixed px
						$currentEl = $('<div ' + getrvname(data[1]) + ' style="flex: 0 0 ' + Number.parseFloat(data[0]) + 'px;' + position + '"></div>').appendTo($elem);
					}else if(data[0].match(/(em)/)){//fixed em
						$currentEl = $('<div ' + getrvname(data[1]) + ' style="flex: 0 0 ' + Number.parseFloat(data[0]) + 'em;' + position + '"></div>').appendTo($elem);
					}else{//not fixed px or em
						$currentEl = $('<div '+ getrvname(data[1]) +' style="flex:' + Number.parseFloat(data[0]) + ';' + position + '"></div>').appendTo($elem);
					}
					//if last element is fixed, we need to remove events on the previous bar
					if( index == split.length - 1 &&  data[0].match(/(px|em)/))
						$currentEl.prev().unbind('mouseover mousedown mouseup');
					//check what kind of bar to insert(adjustable or not adjustable)
					if( index < split.length - 1 ){
						if( !data[0].match(/(px|em)/) ){
							//adjustable bar
							$bar = $('<div class="' + barclass + '" style="flex: 0 0 ' + barwidth + 'px;"></div>').appendTo($elem);
							//clear the height/width style in $bar for flexboxes
							$bar.css({
								height: '',
								width: ''
							});
							//make it adjustable
							if(direction === 'h'){//horizontal adjust
								$bar.mouseover(function(){
									$bar.css({cursor: 'ns-resize'});
								})
								.mousedown(function(){
									//get the sum of flex-grow for both resizing elements
									var flexSum = Number.parseFloat($bar.prev().css('flex-grow')) + Number.parseFloat($bar.next().css('flex-grow'));
									//bind mouse move
									$elem.bind('mousemove', function(e){
										var relY = e.pageY - $elem.offset().top,
											//get previous bars bottom
											prevBottom = ($bar.prev().prev().length > 0) ? $bar.prev().prev().position().top + $bar.prev().prev().height() : 0,
											//get next bars top
											nextTop = ($bar.next().next().length > 0) ? $bar.next().next().position().top : $elem.height(),
											//reset layout
											prevHeight = relY - prevBottom,
											nextHeight = nextTop - ( relY + barwidth ),
											newFlexTop = ( prevHeight ) / ( prevHeight + nextHeight) * flexSum; // A / ( A + B ) * Sum
											newFlexBottom = ( nextHeight ) / ( prevHeight + nextHeight) * flexSum;
										$bar.prev().css({'flex-grow': newFlexTop});
										$bar.next().css({'flex-grow': newFlexBottom});
									});
								})
								.mouseup(function(){
									$elem.unbind('mousemove');
								});
								//track window mouseup, just in case
								$window.mouseup(function(){
									$elem.unbind('mousemove');
								});
							}else{//vertical adjust
								$bar.mouseover(function(){
									$bar.css({cursor: 'ew-resize'});
								})
								.mousedown(function(){
									//get the sum of flex-grow for both resizing elements
									var flexSum = Number.parseFloat($bar.prev().css('flex-grow')) + Number.parseFloat($bar.next().css('flex-grow'));
									$elem.bind('mousemove', function(e){
										var relX = e.pageX - $elem.offset().left,
											//get previous bars bottom
											prevRight = ($bar.prev().prev().length > 0) ? $bar.prev().prev().position().left + $bar.prev().prev().width() : 0,
											//get next bars top
											nextLeft = ($bar.next().next().length > 0) ? $bar.next().next().position().left : $elem.width(),
											//reset layout
											prevWidth = relX - prevRight,
											nextWidth = nextLeft - ( relX + barwidth ),
											newFlexLeft = ( prevWidth ) / ( prevWidth + nextWidth) * flexSum; // A / ( A + B ) * Sum
											newFlexRight = ( nextWidth ) / ( prevWidth + nextWidth) * flexSum;
										$bar.prev().css({'flex-grow': newFlexLeft});
										$bar.next().css({'flex-grow': newFlexRight});
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
						}else{
							$bar = $('<div style="flex: 0 0 ' + barwidth + 'px;background-color:red;"></div>').appendTo($elem);
							//remove events on the previous bar
							if( $bar.prev().prev().length > 0 )
								$bar.prev().prev().unbind('mouseover mousedown mouseup');
						}
					}
				});
			}else{//not adjustable
				//trim the split array
				_.each(split, function(data, index){
					trimmed[index] = data.split(':');
				});
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
					var position = (data[2])? 'postion:fixed;':'';
					//check whether fixed or not
					if(data[0].match(/(px)/)){//fixed px
						template += '<div ' + getrvname(data[1]) + ' style="flex: 0 0 ' + Number.parseFloat(data[0]) + 'px;' + position + '"></div>';
					}else if(data[0].match(/(em)/)){//fixed em
						template += '<div ' + getrvname(data[1]) + ' style="flex: 0 0 ' + Number.parseFloat(data[0]) + 'em;' + position + '"></div>';
					}else{//not fixed px or em
						template += '<div '+ getrvname(data[1]) +' style="flex:' + Number.parseFloat(data[0]) + ';' + position + '"></div>';
					}
				});
				//only append once to save resource
				$elem.append($(template));
			}
		}else{
			throw new Error('Dev::runtime::split-plugin::the split parameter is error. it can only be an array or an object');
		}
	};

	var setViewLayout = function(view, direction, adjustable, split, height, width, barclass){
		view.listenTo(view, 'before:render', function(){
			
		});
	};

	var setViewLayoutOld = function($elem, split, height, width){
		var trimmed = [],
			template = '';
		//give height and width
		if( height !== 'auto' )
			$elem.$el.css({height: height});
		if( width !== 'auto' )
			$elem.$el.css({width: width});
		_.each(split, function(data, index){
			trimmed[index] = data.split(':');
		});
		//insert region/views into template
		_.each(trimmed, function(data, index){
			var rvname = getrvname(data[1]);
			template += '<div ' + rvname + ' style="flex-grow:'+ Number.parseFloat(data[0]) +';"></div>';
		});
			//add flex box for view.$el
			$elem.$el.css({display: 'flex', 'flex-direction': 'column', 'flex-wrap:': 'nowrap', 'justify-content': 'space-around'});
		//pass tempalte to $el
		$elem.template = template;
		$elem.$el.append($('<div>test-test</div>'));
	};

	//get region or view name
	var getrvname = function(str){
		var rvname = '';
		//check whether given a region or view name
		if(str){
			if( str.charAt(0) === str.charAt(0).toUpperCase() )
				rvname = 'view="' + str + '"';
			else if( str.charAt(0) === str.charAt(0).toLowerCase() )
				rvname = 'region="' + str + '"';
			else
				throw new Error('Dev::runtime::split-plugin::the region/view name you give is not valid.');
		}else{
			throw new Error('Dev::runtime::split-plugin::you need to provide a region/view name');
		}
		return rvname;
	};

})(jQuery);