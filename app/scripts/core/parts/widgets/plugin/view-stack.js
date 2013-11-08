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
 * $.stackView(html dom/String/jQuery obj, [options]) on a new DOM object.
 * $.stackView(html dom/String/jQuery obj, index) on sub-sequent calls. [Not in used due to bug in FlexSlider...]
 *
 * =======
 * Options
 * =======
 * currently overlaps with the options for FlexSlider.
 * + unitSelector: the content unit class selector. {default: div}
 * + popOnBackward
 * + moveToOnAdd
 *
 * @author Tim.Liu
 * @created 2013.09.13
 */

;(function($){

	$.fn.stackView = function($view, options){

		// if(_.isNumber(options)){
		// 	var index = options;
		// 	options = {};
		// }

		var optionPlus = $.extend({
			//additional options used by us.
			unitSelector: 'div',
			popOnBackward: true,
			moveToOnAdd: true
		}, options);

		options = $.extend({
			//defaults on standard FlexSlider options.
			selector: '.slides > ' + optionPlus.unitSelector,
			animation: 'slide',
			controlsContainer: '.slides-control',
			directionNav: false,
			animationLoop: false,
			slideshow: false,
			keyboard: false,

			after: function(slider){
				if(optionPlus.popOnBackward && slider.direction === 'prev'){
					while(slider.currentSlide < slider.last){
						slider.removeSlide(slider.last);
					}
				}
			}
		}, options);

		return this.each(function(elIndex, el){
			var $el = $(el);

			if($el.find('.slides').length === 0){
				$el.wrapInner('<div class="slides-holder"><div class="slides"/></div>');
				$el.prepend('<div class="slides-control" style="height:20px;"/>')
			}

			//use the inner container.
			$el = $el.find('.slides-holder');

			if(!$el.data('flexslider')){
				//we don't re-init them.
				$el.flexslider(options);
			}

			if($view){
				$view = (_.isString($view) || _.isElement($view))? $($view) : $view;
				$view.find(':input').attr('tabIndex', -1); //disable tab keys on inputs (if it is a form)
				$view.on('prev', function(){
					if($el.data('flexslider').currentSlide === $view.slideIndex)
						$el.flexslider('prev');
				});
				$view.on('next', function(){
					if($el.data('flexslider').currentSlide === $view.slideIndex)
						$el.flexslider('next');
				})

				var index = index || $el.data('flexslider').count;
				$el.data('flexslider').addSlide($view); //bug in adding index here, omitted...;
				$view.slideIndex = index; //remember index on the $view object.
				
				if(optionPlus.moveToOnAdd)
					$el.flexslider($view.slideIndex);
			}
			
		});

	}

})(jQuery);