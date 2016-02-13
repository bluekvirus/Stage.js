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

;(function($){

	$.fn.split = function(options){
		options = options || {};
		//default parameters
		var direction = options.direction || 'h',
			split = options.split || [1, 1],
			type = options.type || 'free',
			min = options.min || 20,
			height = options.height || '100%',
			width = options.width || '100%',
			adjustable = options.adjustable || false,
			barclass = options.barclass || 'split-' + direction + 'bar',
			that = this,
			$this = $(this);
		//check the type of layout, bootstrap or free
		if( type === 'bootstrap' /*bootstrap layout*/){
			//hornor the height and width settings
			if( height !== 'auto' )
				$this.css({height: height});
			if( width !== 'auto' )
				$this.css({width: width});
			//break split into tokens in the trimmed array
			var bsgrid = /(xs|sm|md|lg)/,
				trimmed = [];
			_.each(split, function(data, index){
				//bootstrap grid class
				trimmed[index] = data.split(':');
				//check whether split array has proper bootstrap-classname for every element
				if( !trimmed[index][0].match(bsgrid) ){
					throw new Error('Dev::runtime::split-plugin::for bootstrap type layout, you must give a proper bootstrap grid class');
				}
			});
			//make the calling element position relative if not defined as relative or absolute
			if($this.css('position') !== 'absolute' && $this.css('position') !== 'relative')
				$this.css({position: 'relative'});
			//check directions
			if( direction === 'h' ){
				_.each(trimmed, function(data, index){
					//split classes and add col
					var classnames = '',
						rvname = '';
					//--------------------bootstrap 'h' divide do not hornor classnames----------------------//
					//--------------------it simply insert rows of divs that contains the region/view names--//
					// _.each(data[0].split(','), function(classname){
					// 	classnames += ( 'col-' + classname + ' ' );
					// });
					//--------------------------------------------------------------------------------------//
					//check whether given a region or view name
					if(data[1]){
						if( data[1].charAt(0) === data[1].charAt(0).toUpperCase() )//view name uppercase
							rvname = 'view="' + data[1]+'"';
						else if( data[1].charAt(0) === data[1].charAt(0).toLowerCase() )//region name lowercase
							rvname = 'region="' + data[1]+'"';
						else
							throw new Error('Dev::runtime::split-plugin::the region/view name you give is not valid.');
					}
					$this.append('<div class="row"><div class="col-xs-12"'+rvname+'></div><div class="'+barclass+'"></div></div>');
				});
			}else if(direction === 'v'){
				//add a row for the columns below;
				$this.append('<div class="row split-plugin-added"></div>');
				_.each(trimmed, function(data, index){
					var classnames = '',
						rvname = '';
					//hornor the class names for bootstrap
					_.each(data[0].split(','), function(classname){
						classnames += ( 'col-' + classname + ' ' );
					});
					//check whether given a region or view name
					if(data[1]){
						if( data[1].charAt(0) === data[1].charAt(0).toUpperCase() )
							rvname = 'view="' + data[1]+'"';
						else if( data[1].charAt(0) === data[1].charAt(0).toLowerCase() )
							rvname = 'region"=' + data[1]+'"';
						else
							throw new Error('Dev::runtime::split-plugin::the region/view name you give is not valid.');
					}
					$this.find('.split-plugin-added').append('<div class="'+classnames+'" '+rvname+'></div><div class="'+barclass+'"></div>');
				});
			}else{
				throw new Error('Dev::runtime::split-plugin::direction can only be \'h\' or \'v\' for horizontal or vertical respectively.');
			}
		}else if( type === 'free' /*free layout*/){
			//hornor the height and width settings
			if( height !== 'auto' )
				$this.css({height: height});
			if( width !== 'auto' )
				$this.css({width: width});
			//make sure the parent position is at least relative
			if($this.css('position') !== 'absolute' && $this.css('position') !== 'relative')
				$this.css({position: 'relative'});
			//check direction
			if( direction === 'h' || direction === 'v' ){
				//call setLayout function
				setFreeLayout($this, split, direction, adjustable, barclass);
			}else{
				throw new Error('Dev::runtime::split-plugin::direction can only be \'h\' or \'v\' for horizontal or vertical respectively.');
			}
		}else{
			//error layout type
			throw new error('type can only be bootstrap or free; flexbox has not been implemented');
		}

	};

	var px_em = function(array){
		var bool = false,
			match = /(px|em)/;
		for(var i = 0; i < array.length; i++){
			if( array[i].split(':')[0].match(match) ){
				bool = true;
				break;
			}
		}
		return bool;
	};

	var setFreeLayout = function($el, array, direction, adjustable, barclass){
		var sum = 0,
			trimmed = [],
			barPercent,
			totalHeight = $el.height(),
			contentHeight,
			current = 0;
		//get divide bar width by adding a barclass div, getting width and removing it
		$el.append('<div class="'+barclass+'"></div>');
		var barwidth = $el.find('.'+barclass)[(direction === 'h')? 'height' : 'width']();
		barPercent = ( barwidth / totalHeight ) * 100;
		$el.find('.'+barclass).remove();
		//check the given height, whether there is a fixed number in it.
		if( px_em(array) ){
			//take out the fixed pixel or ems, then calcualte the percentage for every block
			//insert divs and divide bars
			
			//if adjustable register resize event on the divide bar
			
			
		}else{//calculate the percentage for every block, then insert divs and divde bars
			//calculate the total ratio for all blocks
			_.each(array, function(data, index){
				//store array into 
				trimmed[index] = data.split(':');
				//add total propotion
				sum += Number.parseInt(trimmed[index][0]);
			});
			contentHeight = totalHeight - ( array.length - 1 ) * barwidth;
			_.each(trimmed, function(data, index){
				var rvname = '',
					position = (data[2])?'fixed':'absolute',
					contentPercent = ( ( contentHeight * ( data[0] / sum ) ) / totalHeight ) * 100;
				//check whether given a region or view name
				if(data[1]){
					if( data[1].charAt(0) === data[1].charAt(0).toUpperCase() )
						rvname = 'view="' + data[1]+'"';
					else if( data[1].charAt(0) === data[1].charAt(0).toLowerCase() )
						rvname = 'region="' + data[1]+'"';
					else
						throw new Error('Dev::runtime::split-plugin::the region/view name you give is not valid.');
				}
				if( direction === 'h' ){
					//insert contents horizontally if 'h'
					$el.append('<div ' + rvname + ' style="top:' + current + '%;height:' + contentPercent + '%;position:' + position + ';"></div>');
					current += contentPercent;
					//add divide bar
					if( index < ( array.length - 1 ) ){
						$el.append('<div class="' + barclass + '"></div>');
						current += barPercent;
					}
				}else{

				}
			});
			
		}
	};

})(jQuery);