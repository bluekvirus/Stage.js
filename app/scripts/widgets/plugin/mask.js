/**
 * This is the mask jQuery plugin for masking certain dom element or all other.
 * This plugin should be loaded as early as possible, since other form/editor/notification widgets might need this effect.
 *
 * @requires Handlebars.js templating engine.
 * 
 * @author Yan Zhu
 * @author Tim.Liu
 * @create 2013.07.08
 */

Template.extend('custom-tpl-widget-plugin-mask', [
	'<div class="mask">',
		'<span class="readonly-msg">{{msg}}</span>',
		'<div class="spin-msg">',
            '<div class="spin"></div>',
            '<div class="wait-msg">{{msg}}</div>',
        '</div>',
	'</div>'
]);

(function($, app) {

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

	function closeLoadingMask($el, options) {
		$el.prev('.spin-msg').remove();
		$el.prev('.mask').remove();

		if ($.isFunction(options.onClose)) {
			options.onClose($el, options);
		}
	};

	$.fn.elMask = function(options) {

		// default options
		options = $.extend({
			/* default is loading mode */
			timeout: 0, // (ms) anything non-negative && > 0 should be considered - only in loading mode
			msg: '', // msg to replace the read-only or loading message

			/* overlap mode if overlap: true */
			overlap: false, // blacken this element and show an overlap layer above this element
			/* overlap mode options */
			overlapClass: 'overlap', // the class name of the overlap layer, takes precedence of overlapSelector
			overlapMaskClass: 'overlap-mask', // the class name of the mask layer
			overlapSelector: undefined, // the selector of the overlap layer, priority lower than overlapClass.
										// if use this option, the element match the selector must already exist

			/* highlight mode if highlight: true */
			highlight: false, // blacken all other else to contrast this one - I (INTERACTABLE) but others NI (NON-INTERACTABLE)
			/* highlight mode options */
			target: '', // selector to highlight
			highlightMaskClass: 'highlight-mask', // mask class name - highlight mode

			cancelOnClick: true, // user will cancel the overlap/highlight mode upon clicking the masked area

			/* readonly mode if readonly: true */
			readonly: false, // mask with a Read-Only sign - NI (NON-INTERACTABLE)

			/* callbacks: two arguments: this jquery object and the options */
			onShow: $.noop, // on 'show' callback
			onClose: $.noop, // on 'close'/'timeout' callback - loading mode
			onCancel: $.noop, // on 'cancel' callback - overlap/highlight mode

			/* customization - read-only or loading mode */
			custom: undefined // custom el (mask view) to be used - unsupported yet

		}, options);

		if (!options.msg) {
			options.msg = options.readonly ? 'READ-ONLY' : 'Please wait...';
		}

		// plugin logic
		var that = this;

		closeLoadingMask(that, options);

		var result;
		if (options.overlap === true) {
			if (options.overlapClass) {
				var classArray = options.overlapClass.split(' ');
				classArray.unshift('>');
				options.overlapSelector = classArray.join('.');
			}
			if (!options.overlapSelector) {
				app.error('Use Plugin Mask Error', 'should specify [overlapClass] or [overlapSelector] when using overlap mode');
				return;
			}
			
			result = that.each(function(index, el) {
				$el = $(el);
				$el.data('originPosition', $el.css('position'));
				$el.css('position', 'relative');
				var $overlap = $el.find(options.overlapSelector);
				if ($overlap.length === 0) {
					if (options.overlapClass) {
						$overlap = $('<div class="'+options.overlapClass+'"></div>').appendTo(el);
					} else {
						app.error('Use Plugin Mask Error', 'no element match "', options.overlapSelector, '" within ', $el.attr('id'));
						return;
					}
				}
				$overlap.show();

			}).highlight(options.overlapSelector, {
				className: options.overlapMaskClass
			});

			var $maskDivs = $('.'+options.overlapMaskClass);
			function closeOverlap() {
				$maskDivs.remove();
				that.each(function(index, el) {
					$el = $(el);
					var originPosition = $el.data('originPosition');
					if (originPosition) {
						$el.css('position', originPosition);
					}
					$el.find(options.overlapSelector).hide();
				});

				if ($.isFunction(options.onCancel)) {
					options.onCancel(that, options);
				}
			}
			that.data('closeOverlap', closeOverlap);
			if (options.cancelOnClick === true) {
				$maskDivs.on('click', closeOverlap);
			}

			if ($.isFunction(options.onShow)) {
				options.onShow(that, options);
			}

		} else if (options.highlight === true) {
			//use jquery-mask
			result = that.highlight(options.target, {
				className: options.highlightMaskClass
			});

			if ($.isFunction(options.onShow)) {
				options.onShow(that, options);
			}

			if (options.cancelOnClick === true) {
				var $maskDivs = $('.'+options.highlightMaskClass);
				$maskDivs.on('click', function(e) {
					$maskDivs.remove();
					if ($.isFunction(options.onCancel)) {
						options.onCancel(that, options);
					}
				});
			}

		} else {
			result = that.each(function(index, el) {
				$el = $(el);
				var tpl_mask = Handlebars.compile($('#custom-tpl-widget-plugin-mask').html());
				var $mask = $(tpl_mask({
					msg: options.msg
				}));

				if (options.readonly === true) {
					$mask.find('.spin-msg').remove();
					$el.before($mask);
					$mask.height($el.height()).width($el.width());

				} else {
					$mask.find('.readonly-msg').remove();
					$mask.addClass('loading');
					$el.before($mask);
					$mask.height($el.outerHeight(true)).width($el.outerWidth(true));

					var $spinMsg = $mask.find('.spin-msg');
					$mask.after($spinMsg);
					var $spin = $spinMsg.find('.spin');
					var $waitMsg = $spinMsg.find('.wait-msg');
					$spinMsg.width($spin.outerWidth(true)+$waitMsg.outerWidth(true));
					var offset = $mask.offset();
					if ((offset.top+$mask.height()) > $(window).height()) {
						offset.top += ($(window).height()-offset.top-$spinMsg.height())/2;
					} else {
						offset.top += ($mask.height()-$spinMsg.height())/2;
					}
					offset.left += ($mask.width()-$spinMsg.width())/2;
					$spinMsg.offset(offset);

					var spinner = new Spinner(spinOpts);
					spinner.spin($spin[0]);
					$(spinner.el).css('top', $spin.height()/2+'px').css('left', $spin.width()/2+'px');
				}
			});

			that.data('unmask', (options.readonly === true) ? $.noop : function() {
				return closeLoadingMask(that, options);
			});

			if ($.isFunction(options.onShow)) {
				options.onShow(that, options);
			}

			if ($.isNumeric(options.timeout) && options.timeout > 0) {
				setTimeout(function() {
					closeLoadingMask(that, options);
				}, options.timeout);
			}
		}

		return result;
	};

})(jQuery, Application);