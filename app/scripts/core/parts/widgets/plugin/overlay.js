/**
 * This is the plug-in that put an div(overlay) on top of selected elements (inner-div style)
 *
 * Arguments
 * ---------
 * show: true|false show or close the overlay
 * options: {
 * 		class: custom overlay class - for css overriden, note that you might need to change background and z-index in your stylesheet after you set this, since they will be removed.
 * 		effect: 'jquery ui effects string', or specifically:
 * 			openEffect: ...,
 * 			closeEffect: ...,
 * 		duration: 'jquery ui effects duration',
 * 		zIndex: 'css z-index number' - disabled if you've set options.class;
 * 		background: 'css background string', - disabled if you've set options.class;		
 * 		containerStyle: 'jquery css style object for overlay content container', - disabled if you've set containerClass;
 * 		titleStyle: 'jquery css style object for overlay content title', - disabled if you've set containerClass;
 * 		containerClass: custom container class - for css overriden, note that you MUST style the padding, it is removed if you specify containerClass in option
 * 		content: 'text'/html or el or a function($el, $overlay) that returns one of the three.
 * 		title: 'html' or 'string' for title bar above content.
 * 		titleIcon: class name of the icon.
 * 		titleAlign: title text-alignment in css term 'left, right, center'
 * 		buttons: [ an array of bottons to show below or inline with the content.
 * 			{title: ..., icon: ..., class: ..., fn($el, $overlay), context: ...},
 * 			{...},
 * 			...
 * 		]
 * 		buttonsAlign: 'left/right/center',
 * 		onShow($el, $overlay) - show callback;
 * 		onClose($el, $overlay) - close callback;
 * 		closeX: true|false - whether or not to show the x on the overlay container.
 * 		move: true|false - whether or not to make the overlay-container draggable through jquery ui.
 * 		resize: true|false - whether or not to make the overlay-container resizable through jquery ui.
 * 		hrCSS: '<hr/> tags css string' or false to disable - NOT jquery style object. - this is not disabled if you set containerClass; this options is rarely used.
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
 * @author Tim.Liu
 * @create 2013.12.26
 */

(function($){

	/*===============preparations======================*/
	var template = Handlebars.compile([
		'<div class="overlay hide {{class}}" style="position:absolute; top: 0; left: 0; right: 0; bottom: 0; {{#unless class}}z-index:{{zIndex}};background:{{background}};{{/unless}}">',
			'<div class="overlay-outer" style="display: table;table-layout: fixed; height: 100%; width: 100%;">',
				'<div class="overlay-inner" style="display: table-cell;text-align: center;vertical-align: middle; width: 100%;">',
					'<div class="overlay-container {{containerClass}}" style="display: inline-block;outline: medium none; {{#unless containerClass}}padding:20px;{{/unless}} position:relative;">',
						'{{#if title}}',
							'<div class="title-bar" {{#if titleAlign}}style="text-align:{{titleAlign}}"{{/if}}>',
								'<span class="title"><i class="title-icon {{titleIcon}}"></i> {{title}}</span>',
							'</div>',
							'{{#if hrCSS}}<hr style="{{hrCSS}}"/>{{/if}}',
						'{{/if}}',
						'{{#if closeX}}',
							'<span class="close" style="line-height: 20px;cursor: pointer;font-size: 20px;font-weight: bold;padding: 0 6px;position: absolute;right: 0;top: 0;">×</span>',
						'{{/if}}',
						'<div class="overlay-container-content"></div>',
						'{{#if buttons}}',
							'{{#if hrCSS}}{{#if content}}<hr style="{{hrCSS}}"/>{{/if}}{{/if}}',
							'<div class="btn-bar" style="text-align:{{buttonsAlign}};">',
								'{{#each buttons}}',
									'<span class="btn {{class}}" data-fn="{{@index}}"><i class="{{icon}}"></i> {{title}}</span> ',
								'{{/each}}',
							'</div>',
						'{{/if}}',
					'</div>',
				'</div>',
			'</div>',
		'</div>'
	].join(''));	

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

				var $overlay = $el.data('overlay');
				$overlay.data('container').hide('fade');//hide the container first.
				options = _.extend({}, $overlay.data('closeOptions'), options);
				$overlay.hide({
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

				//options default (template related):
				options = _.extend({
					closeX: true,
					zIndex: 100,
					background: (options.content || options.title || options.buttons)?'rgba(0, 0, 0, 0.7)':'none',
					containerStyle: {background: (options.content || options.title || options.buttons)? '#FFF' : 'none', textAlign: 'left'},
					titleStyle: {fontSize: '15px', fontWeight: 'bold'},
					buttonsAlign: 'right',
					hrCSS: 'margin: 8px 0;',
					move: false,
					resize: false
				}, options);

				$overlay = $(template(options));
				$el.data('overflow', {
					x: $el.css('overflowX'),
					y: $el.css('overflowY')
				});				
				$el.append($overlay).css({
					'position': 'relative',
					'overflow': 'hidden'
				});
				$el.data('overlay', $overlay);
				$container = $overlay.find('.overlay-container');
				if(!options.containerClass){
					$container.css(options.containerStyle).find('> div span.title').css(options.titleStyle);
				}
				if(options.resize) $container.resizable({ containment: "parent" });
				if(options.move) $container.draggable({ containment: "parent" });
				$overlay.data({
					'closeOptions': _.pick(options, 'closeEffect', 'effect', 'duration', 'onClose'),
					'content': $overlay.find('.overlay-container-content').first(),
					'container': $container
				});
				$overlay.data('content').html(_.isFunction(options.content)?options.content($el, $overlay):options.content);
				$overlay.show({
					effect: options.openEffect || options.effect || 'clip',
					duration: options.duration,
					complete: function(){
						options.onShow && options.onShow($el, $overlay);
						if(options.closeX){
							$overlay.on('click', 'span.close', function(){
								$el.overlay(false);
							});
						}
						if(options.buttons){
							$overlay.on('click', '.btn-bar > span.btn', function(){
								var btnCfg = options.buttons[$(this).data('fn')];
								if(btnCfg.fn){
									btnCfg.context = btnCfg.context || this;
									return btnCfg.fn.apply(btnCfg.context, [$el, $overlay]);
								}
							});
						}	
					}
				});
				
			}


		});
	}

})(jQuery);