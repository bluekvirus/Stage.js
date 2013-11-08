/**
 * This is the mask jQuery plugin for masking certain dom element or all other.
 * This plugin should be loaded as early as possible, since other form/editor/notification widgets might need this effect.
 *
 * @requires jQuery, spin.js
 * 
 * @author Yan Zhu
 * @author Tim.Liu
 * @create 2013.07.08
 */
(function($) {

	// spin options
	var spinOpts = {
		lines: 9, // The number of lines to draw
		length: 5, // The length of each line
		width: 3, // The line thickness
		radius: 5, // The radius of the inner circle
		corners: 1, // Corner roundness (0..1)
		rotate: 0, // The rotation offset
		direction: 1, // 1: clockwise, -1: counterclockwise
		color: '#000', // #rgb or #rrggbb
		speed: 1, // Rounds per second
		trail: 60, // Afterglow percentage
		shadow: false, // Whether to render a shadow
		hwaccel: false, // Whether to use hardware acceleration
		className: 'spinner', // The CSS class to assign to the spinner
		zIndex: 2e9, // The z-index (defaults to 2000000000)
		top: 'auto', // Top position relative to parent in px
		left: 'auto' // Left position relative to parent in px
	};

	function unmask($el) {
		if ($.isFunction($el.data('unmask'))) {
			$el.data('unmask')($el);
		}
	}

	/**
	 * Usage:
	 * 
	 * 1. loading:
	 * 	$(el).elMask({
	 * 		mode: 'loading', // optional
	 * 		maskClass: 'mask', // optional
	 * 		msg: 'Please wait...', // optional
	 * 		timeout: 0, // optional
	 * 		onShow: function($el, options) {}, // optional
	 * 		onCancel: function($el, options) {}, // optional
	 * 	});
	 * 
	 * 2. readonly:
	 * 	$(el).elMask({
	 * 		mode: 'readonly', // required
	 * 		maskClass: 'mask', // optional
	 * 		msg: 'READ-ONLY', // optional
	 * 		timeout: 0, // optional
	 * 		onShow: function($el, options) {}, // optional
	 * 		onCancel: function($el, options) {}, // optional
	 * 	});
	 * 
	 * 3. overlay:
	 * 	$(el).elMask({
	 * 		mode: 'overlay', // required
	 * 		maskClass: 'mask', // optional
	 * 		overlayClass: 'overlay', // optional
	 * 		cancelOnClick: true, // optional
	 * 		onShow: function($el, options) {}, // optional
	 * 		onCancel: function($el, options) {}, // optional
	 * 	});
	 * 
	 * 4. highlight:
	 * 	$(el).elMask({
	 * 		mode: 'highlight', // required
	 * 		highlightTarget: 'xxx', // required
	 * 		maskClass: 'mask', // optional
	 * 		highlightClass: 'highlight', // optional
	 * 		cancelOnClick: true, // optional
	 * 		onShow: function($el, options) {}, // optional
	 * 		onCancel: function($el, options) {}, // optional
	 * 	});
	 * 
	 * 5. unmask:
	 * 	$(el).elMask({
	 * 		mode: 'unmask', // required
	 * 	});
	 * 
	 */
	$.fn.elMask = function(options) {

		///////////// default options ////////////
		options = $.extend({
			/**
			 * elMask mode.
			 * 
			 * Available modes are:
			 * 'loading': mask with a Loading sign - NI (NON-INTERACTABLE)
			 * 'readonly': mask with a Read-Only sign - NI (NON-INTERACTABLE)
			 * 'overlay': blacken this element and show an overlay layer above it - NI (NON-INTERACTABLE) but overlay layer I (INTERACTABLE)
			 * 'highlight': blacken all parts of this element but highlight the specified part - NI (NON-INTERACTABLE) but highlight part I (INTERACTABLE)
			 * 'unmask': cancel mask
			 * 
			 * Defaults to: 'loading'
			 */
			mode: 'loading',
			
			maskClass: 'mask', // the class name of the mask layer

			overlayClass: 'overlay', // the class name of the overlay layer - overlay mode

			highlightClass: 'highlight', // the class name of the highlight part - highlight mode

			highlightTarget: undefined, // selector of the highlight part - highlight mode

			msg: '', // msg to replace the read-only or loading message - loading/readonly mode

			cancelOnClick: true, // user will cancel the overlay/highlight mode upon clicking the masked area - overlay/highlight mode
			timeout: 0, // (ms) anything non-negative && > 0 should be considered - loading/readonly mode

			/* callbacks: two arguments: one of the matched elements, the options */
			onShow: $.noop, // on 'show' callback
			onCancel: $.noop, // on 'cancel' callback

			/* customization - read-only or loading mode */
			custom: undefined // custom el (mask view) to be used - unsupported yet

		}, options);


		////////////////// plugin logic /////////////
		
		// unmask and remove event listeners first
		this.each(function(index, el) {
			var $el = $(el);
			unmask($el);
		});
		$(window).off('resize.elMask');
		if (options.mode === 'unmask') {
			return this;
		}

		// remask when window resize
		$(window).on('resize.elMask', _.bind(function(event) {
			this.elMask(options);
		}, this));
		
		
		this.each(function(index, el) {
			var $el = $(el);
			var $elMask = $('<div></div>').addClass(options.maskClass).insertBefore($el);
			options.maskSelector = '.' + options.maskClass;
			// $elMask.height($el.height()).width($el.width()).offset($el.offset());
			$elMask.height($el.outerHeight(true)).width($el.outerWidth(true)).offset($el.offset());
			
			if (options.mode === 'overlay') {
				$el.data('originPosition', $el.css('position'));
				$el.css('position', 'relative');
				$('<div class="'+options.overlayClass+'"></div>').appendTo(el);
				options.overlaySelector = '> .' + options.overlayClass;

			} else if (options.mode === 'highlight') {
				var $target = $el.find(options.highlightTarget);
				$target.each(function(index, targetEl) {
					var $targetEl = $(targetEl);
					$targetEl.addClass(options.highlightClass);
				});

			} else if (options.mode === 'readonly') {
				$('<span class="readonly-msg"></span>').html(options.msg || 'READ-ONLY').appendTo($elMask);
				$elMask.addClass('readonly');

			} else {
				var $spinMsg = $('<div class="spin-msg"></div>').insertAfter($elMask);
				var $spin = $('<div class="spin"></div>').appendTo($spinMsg);
				var $waitMsg = $('<div class="wait-msg"></div>').html(options.msg || 'Please wait...').appendTo($spinMsg);
				$spinMsg.width($spin.outerWidth(true) + $waitMsg.outerWidth(true));
				var offset = $elMask.offset();
				if ((offset.top + $elMask.height()) > $(window).height()) {
					offset.top += ($(window).height() - offset.top - $spinMsg.height()) / 2;
				} else {
					offset.top += ($elMask.height() - $spinMsg.height()) / 2;
				}
				offset.left += ($elMask.width() - $spinMsg.width()) / 2;
				$spinMsg.offset(offset);

				var spinner = new Spinner(spinOpts);
				spinner.spin($spin[0]);
				$(spinner.el).css('top', $spin.height()/2+'px').css('left', $spin.width()/2+'px');
			}
			
			$el.data('unmask', function($el) {
				$el.prev('.spin-msg').remove();
				$el.prev(options.maskSelector).remove();
				
				if (options.mode === 'overlay') {
					$el.find(options.overlaySelector).remove();
					var originPosition = $el.data('originPosition');
					if (originPosition) {
						$el.css('position', originPosition);
					}
				} else if (options.mode === 'highlight') {
					var $target = $el.find(options.highlightTarget);
					$target.each(function(index, targetEl) {
						var $targetEl = $(targetEl);
						$targetEl.removeClass(options.highlightClass);
					});
				}
				
				if ($.isFunction(options.onCancel)) {
					options.onCancel($el, options);
				}
				
				$el.removeData('unmask');
			});
			
			if (options.mode === 'overlay' || options.mode === 'highlight') {
				if (options.cancelOnClick === true) {
					$elMask.on('click', function() {
						unmask($el);
					});
				}
			} else {
				if ($.isNumeric(options.timeout) && options.timeout > 0) {
					setTimeout(function() {
						unmask($el);
					}, options.timeout);
				}
			}
			
			if ($.isFunction(options.onShow)) {
				options.onShow($el, options);
			}
		});

		return this;
	};

})(jQuery);