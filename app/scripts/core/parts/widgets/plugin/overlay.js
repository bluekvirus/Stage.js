/**
 * This is the plug-in that put an div(overlay) on top of selected elements (inner-div style)
 *
 * Arguments
 * ---------
 * show: true|false show or close the overlay
 * options: {
 * 		class: custom overlay class - for css overriden,
 * 		effect: 'jquery ui effects string', or specifically:
 * 			openEffect: ...,
 * 			closeEffect: ...,
 * 		duration: 'jquery ui effects duration',
 * 		background: 'css background string',
 * 		containerStyle: 'jquery css style block for overlay content container',
 * 		containerClass: custom container class - for css overriden,
 * 		content: 'text'/html or el,
 * 		onShow($el, $overlay) - show callback;
 * 		onClose($el, $overlay) - close callback;
 * }
 *
 * Custom Content
 * --------------
 * You can change the content in onShow($el, $overlay) by $overlay.data('content')
 * 
 * 
 * @author Tim.Liu
 * @create 2013.12.26
 */

(function($){

	/*===============preparations======================*/
	var template = [
		'<div class="overlay hide" style="position:absolute; top: 0; left: 0; right: 0; bottom: 0;">',
			'<div class="overlay-outer" style="display: table;table-layout: fixed; height: 100%; width: 100%;">',
				'<div class="overlay-inner" style="display: table-cell;text-align: center;vertical-align: middle; width: 100%;">',
					'<div class="overlay-container" style="display: inline-block;outline: medium none; padding:20px; position:relative;">',
						'<span class="close" style="cursor: pointer;display: block;font-size: 20px;font-weight: bold;padding: 0 6px;position: absolute;right: 0;top: 0;">×</span>',
						'<div class="overlay-container-content"></div>',
					'</div>',
				'</div>',
			'</div>',
		'</div>'
	].join('');	

	/*===============the util functions================*/

	/*===============the plugin================*/
	$.fn.overlay = function(show, options){
		if(_.isObject(show)){
			options = show;
			show = true;
		}
		if(_.isUndefined(show)) show = true;
		options = options || {};
		return this.each(function(index, el){
			var $el = $(this);

			if(!show){
				if(!$el.data('overlay')) return;

				var $overlay = $el.data('overlay').hide({
					effect: options.closeEffect || options.effect || 'clip',
					duration: options.duration,
					complete: function(){
						options.onClose && options.onClose($el, $overlay);
						$overlay.remove();//el, data, and events removed;						
						$el.css({
							overflowY: $el.data('overflow').y,
							overflowX: $el.data('overflow').x
						});
						$el.removeData('overlay', 'overflow');
					}
				});
			}else {
				if($el.data('overlay')) return;
				
				$overlay = $(template).css('background', options.background || 'rgba(0, 0, 0, 0.7)').addClass(options.class);
				$el.data('overflow', {
					x: $el.css('overflowX'),
					y: $el.css('overflowY')
				});				
				$el.append($overlay).css({
					'position': 'relative',
					'overflow': 'hidden'
				});
				$el.data('overlay', $overlay);
				if(options.containerStyle)
					$overlay.find('.overlay-container').css(options.containerStyle).addClass(options.containerClass);
				$overlay.data('content', $overlay.find('.overlay-container-content').first());
				$overlay.data('content').html(options.content);
				$overlay.show({
					effect: options.openEffect || options.effect || 'clip',
					duration: options.duration,
					complete: function(){
						options.onShow && options.onShow($el, $overlay);
						$overlay.on('click', 'span.close', function(){
							$el.overlay(false, options);
						});
					}
				});
				
			}


		});
	}

})(jQuery);