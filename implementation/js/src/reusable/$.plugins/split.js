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

	$.fn.split = function(options, debug){
		options = options || {};
		//default parameters
		var direction = options.direction || 'v',
			split = options.split || [1, 1],
			type = options.type || 'free',
			min = options.min || 20,
			height = options.height || '100%',
			width = options.width || '100%',
			adjustable = options.adjustable || false,
			that = this,
			$this = $(this);
		//check the type of layout, bootstrap or free
		if( type === 'bootstrap' /*bootstrap layout*/){
			//break split into tokens in the trimmed array
			var bsgrid = /(xs|sm|md|lg)/,
				trimmed = [];
			_.each(split, function(data, index){
				//bootstrap grid class
				trimmed[index] = data.split(':');
				//check whether split array has proper bootstrap-classname for every element
				if( !trimmed[index][0].match(bsgrid) ){
					throw new Error('for bootstrap type layout, you must give a proper bootstrap grid class');
				}
			});
			//make the calling element position relative if not defined as relative or absolute
			if($this.css('position') !== 'absolute' && $this.css('position') !== 'relative')
				$this.css({position: 'relative'});
			//bootstrap ignore hight settings
			//$this.css({height: '100%', width: '100%'});
			//add border for debugging purpose
			if(debug)
				$this.css({border: '1px solid 999'});
		}else if( type === 'free' /*free layout*/){
			
		}else{
			//error layout type
			throw new error('type can only be bootstrap or free; flexbox has not been implemented');
		}

	};

})(jQuery);