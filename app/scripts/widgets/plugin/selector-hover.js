/**
 * This is the (hover) select jQuery plugin to transform standard 'select' into something else visulally.
 *
 * @requires Handlebars.js templating engine.
 *
 * Exposed in $('select').data()
 *
 * cfg:
 * 	.options.{
 * 		multi : false - limited to 1;
 * 				true(<=0) - unlimited, >=1 - limited by number;
 * 				
 * 		data(TBI) : 
 * 					//use <select/>
 * 					undefined - from the targeted <select> tag;
 *
 * 					//use hidden input tag
 * 					url - ajax data source;
 * 					[](array) - [{key: ..., val: ...}, {...}, {...}];
 * 					function - returns an array like the above;
 * 				
 * 	}
 * utils:
 * .reRender();
 * .show();
 * .hide();
 *
 * @author Tim.Liu
 * @created 2013.07.08
 */

Template.extend('custom-tpl-widget-plugin-hover-select', [
	'<div class="new-select-plugin-hover">',
		'<div class="select-val-ct">',
			//selected value(s)
			'<ul class="inline selected-items">',
				'{{#each selected}}',
					'<li class="select-selected-val {{#unless this.key}}select-selected-val-empty{{/unless}}" data-key="{{this.key}}"><span data-value="{{this.val}}">{{this.key}}</span> <button type="button" class="close">&times;</button></li>',
				'{{/each}}',
			'</ul>',
		'</div>',
		'<div class="select-opts">',
			'<div class="arrow"></div>',
			//options by group
			'{{#each groups}}',
				'<div class="select-opt-group">',
					'<div class="select-opt-group-title">{{@key}}</div>',
					'<div class="select-opt-group-items">',
						'{{#each this}}',
							'<span class="select-opt-item {{#unless this.key}}select-opt-item-empty{{/unless}}" data-value="{{this.val}}">{{this.key}}</span>',
						'{{/each}}',
					'</div>',
				'</div>',
			'{{/each}}',
		'</div>',
	'</div>'
]);

(function($){

	var template = Handlebars.compile($('#custom-tpl-widget-plugin-hover-select').html());

	/*===============Helper Functions===============*/
	function grabOption($opt){
		return {
			key: $opt.text(),
			val: $opt.attr('value'),
		}
	}
	function grabSelectConfig($oldSelect) {
		var $select = $oldSelect;
		var groups = $select.find('optgroup');
		var config = {
			field: $select.attr('name'),
			selected: $select.find('option').filter(':selected').map(function(index, el){
				var $el = $(el);
				return {
					key: $el.text(),
					val: $el.attr('value'),
				}
			}).toArray(),//Note: need toArray() here since $.map still returns jQuery object.
			groups: {},
		};
		if(groups.length > 0){
			//multi-group
			$.each(groups, function(index, g){
				var $g = $(g);
				var label = $g.attr('label');
				config.groups[label] = [];
				$g.find('option').each(function(index, opt){
					config.groups[label].push(grabOption($(opt)));
				});
			});
		}else {
			//single group
			var defaultGroup = 'Options';
			config.groups[defaultGroup] = [];
			$select.find('option').each(function(index, opt){
				config.groups[defaultGroup].push(grabOption($(opt)));
			});
		}

		return config;
	}
	function inSelection(val, vals){
		var result = -1;
		$.each(vals, function(index, v){
			if(result === -1 && v.key === val.key)
				result = index;
		});
		return result;
	}
	function informOldSelectTag($oldSelect){
		//inform the replaced <select> tag
		//[WARNING] this will not trigger the tag's 'change' event!
		var vals = $.map($oldSelect.data().vals, function(v, index){
			return v.val;
		});
		$oldSelect.val(vals);
		$oldSelect.trigger('change', $oldSelect.data().id);
	}

	/*===============Listeners===============*/
	function registerListeners($oldSelect) {
		var $select = $oldSelect.next();
		var $selected = $select.find('.selected-items');
		var $opts = $select.find('.select-opts');
		var gap = $opts.innerWidth() - $opts.width() + 20;

		function showOptions(){
			/**
			 * [WARNING:: show the element before manipulate the offset() or el that is hidden or display:none will jerk off the screen...]
			 */
			var top = $select.offset().top + $select.outerHeight();			
			$opts.width($select.width() - gap).show().offset({
				top: top,
			});
		}

		function hideOptions(){
			$opts.fadeOut();
		}
		
		//1.expand/hide options: (use the outter most tag for mouse events)
		$select.on('click mouseenter', '.select-selected-val', function(e){
			showOptions(); 
			e.stopPropagation();
		}).on('mouseleave', function(e){
			hideOptions();
			e.stopPropagation();
		});


		//2.item selection:
		$select.on('click', '.select-opt-item', function(){
			//one item at a time...
			$item = $(this);//key .text(), val .data('value')
			//grab value and check if selected...
			var itemValue = {key: $item.text(), val: $item.data('value') || $item.text()};
			var multiMode = $oldSelect.data().options.multi;
			var vals = $oldSelect.data().vals;							
			var index = inSelection(itemValue, vals);
			if(index === -1){
				//not found;
				if(multiMode){
					//push into set;
					if($.isNumeric(multiMode) && multiMode > 0){
						//if reaches maximum selection, replace the last one;
						while(vals.length > multiMode - 1){
							vals.pop();
						}
					}
					vals.push(itemValue);
				} else {
					//replace;
					vals.splice(0, 1, itemValue);
				}

				// remove 'selected-item' class from previouly selected option items
				$opts.find('.selected-item').removeClass('selected-item');

				//render the changed selection(s)
				$selected.empty();
				$.each(vals, function(index, v){
					$selected.append('<li class="select-selected-val' + (v.key ? '' : ' select-selected-val-empty') + '" data-key="' + v.key + '"><span data-value="' + v.val + '">' + v.key + '</span> <button type="button" class="close">&times;</button></li>');
					// add 'selected-item' class to current selected option items
					$opts.find('.select-opt-item[data-value="' + v.val + '"]').addClass('selected-item');
				});

				informOldSelectTag($oldSelect);						
			} else {
				//highlight it:
				$selected.find('[data-key="' + itemValue.key + '"]').effect('highlight', {color: '#8A0917'}, 600);
			}

			//hide the options
			hideOptions();
		});

		//3.item cancellation:
		$select.on('click', '.close', function(e){
			if($oldSelect.data().vals.length === 1){
				//last selection
				//TBI
				return;
			}

			$item = $(this).prev();
			var itemValue = {key: $item.text(), val: $item.data('value')};
			var index = inSelection(itemValue, $oldSelect.data().vals);
			$oldSelect.data().vals.splice(index, 1);
			$selected.find('[data-key="' + itemValue.key + '"]').remove();
			$opts.find('.select-opt-item[data-value="' + itemValue.val + '"]').removeClass('selected-item');

			informOldSelectTag($oldSelect);

			e.stopPropagation();
		});

	}

	/*===============Re-Render================*/
	function reRender($oldSelect) {
		//NOTE that we re-register all the listeners
		$oldSelect.next().off().remove();
			//get groups 'optgroup' with label
			//or
			//get options 'option' with value and html as label		
		var config = grabSelectConfig($oldSelect);
			//show (id is the field name atm)
		$oldSelect.after(template(config)).data({
			id: config.field, 
			vals:config.selected, 
			//util functions:
			reRender:function(){
				return reRender($oldSelect);
			},
			show: function(){
				$oldSelect.next().show();
			},
			hide: function(){
				$oldSelect.next().hide();
			}
		});
			//interactions
		registerListeners($oldSelect);
	}

	/*===============the plugin================*/
	$.fn.hoverSelect = function(options){

		options = $.extend({
			//default options
			multi: this.attr('multiple'),
			data: undefined,//TBI
		}, options);

		return this.filter('select').each(function(index, el){
			var $el = $(el);
			if($el.data().set) return $el.data().reRender();//Do NOT re-init

			$el.data({ options: options, set:true }).hide();
			$el.on('change', function(e, id){
				if($el.data().id !== id){ //id - see reRender(), informOldSelectTag() above.
					//re-render, since the change event must have come from other source.
					$el.data().reRender();
				}
			});
			reRender($el);

		});

	}

})(jQuery);
