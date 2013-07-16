/**
 * This is the (flattened) select jQuery plugin to transform standard 'select' into something else visulally.
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

Template.extend('custom-tpl-widget-plugin-flattened-select', [
	'<div class="new-select-plugin-flatten">',
		// '<div class="select-val-ct">',
		// 	//selected value(s)
		// 	'<ul class="inline selected-items">',
		// 		'{{#each selected}}',
		// 			'<li class="select-selected-val" data-key="{{this.key}}"><span data-value="{{this.val}}">{{this.key}}</span> <button type="button" class="close">&times;</button></li>',
		// 		'{{/each}}',
		// 	'</ul>',
		// '</div>',
		'<div class="select-opts">',
			'<div class="arrow"></div>',
			//options by group
			'{{#each groups}}',
				'<div class="select-opt-group">',
					// '<div class="select-opt-group-title">{{@key}}</div>',
					'<div class="select-opt-group-items">',
						'{{#each this}}',
							'<span class="select-opt-item" data-value="{{this.val}}">{{this.key}}</span>',
						'{{/each}}',
					'</div>',
				'</div>',
			'{{/each}}',
		'</div>',
	'</div>'
]);

(function($){

	var template = Handlebars.compile($('#custom-tpl-widget-plugin-flattened-select').html());

	/*===============Helper Functions===============*/
	function grabOption($opt){
		return {
			key: $opt.text(),
			val: $opt.attr('value') || $opt.text(),
		}
	}
	function grabSelectConfig($oldSelect) {
		var $select = $oldSelect;
		var groups = $select.find('optgroup');
		var config = {
			field: $select.attr('name'),
			selected: $select.find('option:selected').map(function(index, el){
				var $el = $(el);
				return {
					key: $el.text(),
					val: $el.attr('value') || $el.text(),
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
	function highlightSelection($oldSelect){
		var $select = $oldSelect.next();
		var $selected = $select.find('.select-opt-item').removeClass('selected-item');
		$.each($oldSelect.data().vals, function(index, v){
			$selected.filter('[data-value=' + v.val + ']').addClass('selected-item');
		});
	}

	/*===============Listeners===============*/
	function registerListeners($oldSelect) {
		var $select = $oldSelect.next();
		var $selected = $select.find('.selected-items');
		var $opts = $select.find('.select-opts');
		var gap = $opts.innerWidth() - $opts.width() + 20;

		//options are always shown;

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
					if($.isNumeric(multiMode) && multiMode > 0)
						//if reaches maximum selection, replace the last one;
						while(vals.length > multiMode - 1)
							vals.pop();
					vals.push(itemValue);
				}
				else
					//replace;
					vals.splice(0, 1, itemValue);
				//render the changed selection(s)
				$selected.empty();
				$.each(vals, function(index, v){
					$selected.append('<li class="select-selected-val" data-key="' + v.key + '"><span data-value="' + v.val + '">' + v.key + '</span> <button type="button" class="close">&times;</button></li>')
				});
				informOldSelectTag($oldSelect);						
			}else {
				//highlight it:
				$selected.find('[data-key=' + itemValue.key + ']').effect('highlight', {color: '#8A0917'}, 600);
			}

			highlightSelection($oldSelect);

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
		highlightSelection($oldSelect);
	}

	/*===============the plugin================*/
	$.fn.flattenSelect = function(options){

		options = $.extend({
			//default options
			multi: this.attr('multiple'),
			data: undefined,//TBI
		}, options);

		return this.filter('select').each(function(index, el){
			var $el = $(el);
			if($el.data().set) return;//Do NOT re-init

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
