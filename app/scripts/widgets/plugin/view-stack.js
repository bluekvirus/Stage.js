/**
 * This is the view(html content) switching jQuery plugin that utilizes FlexSlider[http://www.woothemes.com/flexslider/]
 *
 * ======
 * Design
 * ======
 * Every once in a while we found ourselves in the needing of a view stacking function rather than the $.html(), so that
 * dynamic view switching can happen with a backward recovery mechanism (like a Wizard...) This is especially important when
 * dealing with chained forms.
 * (A little extra here: form should have a 'next' event fired to parentCt/recordMgr and an option to opt out some of its field when displayed).
 *
 * ===================
 * Conceptual Elements
 * ===================
 * Container - $(container) is used to remember whether or not it has been changed to a view stack. [data-view-stack]
 * Slide - the content unit in a view stack, can be many, usually be 'div's, added through $(container).stackView(slide)
 * Effects - sliding only atm, since we are using FlexSlider.
 *
 * ==============
 * Core Mechanism
 * ==============
 * 1. $(container).stackView(slide);
 * 2. check if container is already a view stack;
 * 		|- yes, go on append the slide; (with optional index)
 * 		|- no, 
 * 				1. give container a inner layer (a div) with infinite 'width/height' (not both) to wrap all of its immediate content units (float left/right)
 * 				2. fix the inner layer's 'height/width' (not both) and make the other metric attribute change with the currently visible content unit.
 * 				3. hide all other content units so the tab key in browser doesn't mess up the views. (optional)
 * 				4. mark this container to be a view stack.
 *
 * =====
 * Usage
 * =====
 * $.stackView(html, [options])
 *
 * =======
 * Options
 * =======
 * currently overlaps with the options for FlexSlider.
 * + unitSelector: the content unit class selector. {default: div}
 * 
 *
 * @author Tim.Liu
 * @created 2013.09.13
 */

;(function($){

	$.fn.stackView = function(options){
		var unitSelector = (options && options.unitSelector) || 'div',
		options = $.extend({
			selector: '.slides > ' + unitSelector,
			animation: 'slide',
			animationLoop: false,
			slideshow: false,
		}, options);

		return this.each(function(index, el){
			var $el = $(el);
			//if($el.data('flexslider')) return; //we don't re-init them.

			if($el.find('> .slides').length === 0)
				$el.wrapInner('<div class="slides"/>');

			$el.flexslider(options);
		});

	}

})(jQuery);