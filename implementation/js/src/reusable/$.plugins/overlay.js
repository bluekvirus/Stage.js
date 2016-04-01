/**
 * This is the plug-in that put an div(overlay) on top of selected elements (inner-div style)
 *
 * Arguments
 * ---------
 * show: true|false show or close the overlay
 * options: {
 * 		[class: 'class name strings for styling purposes';]
 * 		background: if no 'class' in options
 * 		zIndex: if no 'class' in options
 * 		effect: 'jquery ui effects string', or specifically: (use 'false' to disable)
 * 			openEffect: ...,
 * 			closeEffect: ...,
 * 		duration:
 * 			openDuration: ...,
 * 			closeDuration: ...,
 * 		easing:
 * 			openEasing: ...,
 * 			closeEasing: ...,
 * 		content: 'text'/html or el or a function($el, $overlay) that returns one of the three.
 * 		onShow($el, $overlay) - show callback;
 * 		onClose($el, $overlay) - close callback;
 * 		move: true|false - whether or not to make the overlay-container draggable through jquery ui.
 * 		resize: true|false - whether or not to make the overlay-container resizable through jquery ui.
 * }
 *
 * Custom Content
 * --------------
 * You can change the content in onShow($el, $overlay) by $overlay.data('content').html(...)
 * or
 * You can pass in view.render().el if you have backbone based view as content. 
 * Note that in order to prevent *Ghost View* you need to close()/clean-up your view object in onClose callback.
 * 
 *
 * Dependencies
 * ------------
 * Handlebars, _, $window, $
 * 
 * @author Tim Lauv
 * @create 2013.12.26
 */

(function($){

	/*===============preparations======================*/
	var template = Handlebars.compile([
		'<div class="overlay {{class}}" style="position:absolute; top: 0; left: 0; right: 0; bottom: 0; {{#unless class}}z-index:{{zIndex}};background:{{background}};{{/unless}}">',
			'<div class="overlay-outer" style="display: table;table-layout: fixed; height: 100%; width: 100%;">',
				'<div class="overlay-inner" style="display: table-cell;text-align: center;vertical-align: middle; width: 100%;">',
					'<div class="overlay-content-ct" style="display: inline-block;outline: medium none; position:relative;">',
						//your overlay content will be put here
					'</div>',
				'</div>',
			'</div>',
		'</div>'
	].join(''));	

	/*===============the util functions================*/

	/*===============the plugin================*/
	$.fn.overlay = function(show, options){
		if($.isPlainObject(show)){
			options = show;
			show = true;
		}
		if(_.isString(show) || _.isNumber(show)){
			options = _.extend({content: show}, options);
			show = true;
		}
		if(_.isUndefined(show)) show = false; //$.overlay() closes previous overlay on the element.
		options = options || {};

		return this.each(function(index, el){
			var $el = $(this),
			$overlay;

			if(!show){
				if(!$el.data('overlay')) return;

				$overlay = $el.data('overlay');
				options = _.extend({}, $overlay.data('closeOptions'), options);
				var closeEffect = options.closeEffect || options.effect;
				if(_.isUndefined(closeEffect))
					closeEffect = 'clip';
				if(!closeEffect) //so you can use effect: false
					options.duration = 0;
				//**Caveat: $.fn.hide() is from jquery.UI instead of jquery
				$overlay.hide({
					effect: closeEffect,
					duration: options.closeDuration || options.duration,
					easing: options.closeEasing || options.easing,
					complete: function(){
						if(options.onClose)
							options.onClose($el, $overlay);
						if($overlay.data('onResize'))
							//check so we don't remove global 'resize' listeners accidentally
							$window.off('resize', $overlay.data('onResize'));
						$overlay.remove();//el, data, and events removed;
						var recoverCSS = $el.data('recover-css');						
						$el.css({
							overflowY: recoverCSS.overflow.y,
							overflowX: recoverCSS.overflow.x,
							position: recoverCSS.position
						});
						$el.removeData('overlay', 'recover-css');
					}
				});
			}else {
				if($el.data('overlay')) return;

				//options default (template related):
				options = _.extend({
					zIndex: 100,
					background: (options.content)?'rgba(0, 0, 0, 0.6)':'none',
					move: false,
					resize: false
				}, options);

				$overlay = $(template(options));
				$el.data('recover-css', {
					overflow: {
						x: $el.css('overflowX'),
						y: $el.css('overflowY')
					},
					position: $el.css('position')
				});				
				$el.append($overlay).css({
					'position': 'relative',
					'overflow': 'hidden'
				});
				//fix the overlay height, this also affect the default 'clip' effect
				if($el[0].tagName === 'BODY') {
					$overlay.offset({top: $window.scrollTop()});
					$overlay.height($window.height());
					$overlay.data('onResize', function(){
						$overlay.height($window.height());
						//console.log('test to see if the listener is still there...');
					});
					$window.on('resize', $overlay.data('onResize'));
				}
				$overlay.hide();

				$el.data('overlay', $overlay);
				$container = $overlay.find('.overlay-content-ct');
				if(options.resize) $container.resizable({ containment: "parent" });
				if(options.move) $container.draggable({ containment: "parent" });
				$overlay.data({
					'closeOptions': _.pick(options, 'closeEffect', 'effect', 'closeDuration', 'duration', 'closeEasing', 'easing', 'onClose'),
					'container': $container
				});
				$overlay.data('container').html(_.isFunction(options.content)?options.content($el, $overlay):options.content);
				var openEffect = options.openEffect || options.effect;
				if(_.isUndefined(openEffect))
					openEffect = 'clip';
				if(!openEffect) //so you can use effect: false
					options.duration = 0;
				//**Caveat: $.fn.show() is from jquery.UI instead of jquery
				$overlay.show({
					effect: openEffect,
					duration: options.openDuration || options.duration,
					easing: options.openEasing || options.easing,
					complete: function(){
						if(options.onShow)
							options.onShow($el, $overlay);
					}
				});
				
			}

		});
	};

})(jQuery);