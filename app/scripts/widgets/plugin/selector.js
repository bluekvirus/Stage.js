/**
 * This is the (flattened) select jQuery plugin to transform standard 'select' into something else visulally.
 *
 * @requires Handlebars.js templating engine.
 *
 * @author Tim.Liu
 * @created 2013.07.08
 */

Template.extend('custom-tpl-widget-plugin-flattened-select', [
	'<div class="select-val-ct">',
		//selected value(s)
		'<ul class="inline selected-items">',
			'{{#each selected}}',
				'<li class="select-selected-val" data-key="{{this.key}}"><span data-value="{{this.val}}">{{this.key}}</span> <button type="button" class="close">&times;</button></li>',
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
						'<span class="select-opt-item" data-value="{{this.val}}">{{this.key}}</span>',
					'{{/each}}',
				'</div>',
			'</div>',
		'{{/each}}',
	'</div>'
]);

(function($){

	var template = Handlebars.compile($('#custom-tpl-widget-plugin-flattened-select').html());

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
			selected: $select.find('option:selected').map(function(index, el){
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
	}

	/*===============Listeners===============*/
	function registerListeners($oldSelect) {
		var $select = $oldSelect.next();
		var $parent = $select.parent();
		var $selected = $select.find('.selected-items');
		var $opts = $parent.find('.select-opts');
		var gap = $opts.innerWidth() - $opts.width() + 20;
		//parent will handle interactions:
		
		//1.expand/hide options:
		$parent.on('click', '.select-val-ct', function(){
			/**
			 * [WARNING:: show the element before manipulate the offset() or el that is hidden or display:none will jerk off the screen...]
			 */
			var top = $select.offset().top + $select.outerHeight();			
			$opts.width($parent.width() - gap).fadeToggle().offset({
				top: top,
			});

		});

		//2.item selection:
		$parent.on('click', '.select-opt-item', function(){
			//one item at a time...
			$item = $(this);//key .text(), val .data('value')
			//grab value and check if selected...
			var itemValue = {key: $item.text(), val: $item.data('value')};				
			var index = inSelection(itemValue, $oldSelect.data().vals);
			if(index === -1){
				//not found;
				if($oldSelect.data().options.multi)
					//push into set;
					$oldSelect.data().vals.push(itemValue);
				else
					//replace;
					$oldSelect.data().vals = [itemValue];
				//render the changed selection(s)
				$selected.empty();
				$.each($oldSelect.data().vals, function(index, v){
					$selected.append('<li class="select-selected-val" data-key="' + v.key + '"><span data-value="' + v.val + '">' + v.key + '</span> <button type="button" class="close">&times;</button></li>')
				});
				informOldSelectTag($oldSelect);						
			}else {
				//highlight it:
				$selected.find('[data-key=' + itemValue.key + ']').effect('highlight', {color: '#8A0917'}, 600);
			}

			//hide the options
			$opts.fadeToggle();
		});

		//3.item cancellation:
		$parent.on('click', '.close', function(e){

			if($oldSelect.data().vals.length === 1){
				//last selection
				//TBI
				return;
			}

			$item = $(this).prev();
			var itemValue = {key: $item.text(), val: $item.data('value')};
			var index = inSelection(itemValue, $oldSelect.data().vals);
			$oldSelect.data().vals.splice(index, 1);
			$selected.find('[data-key=' + itemValue.key + ']').remove();
			informOldSelectTag($oldSelect);
			e.stopPropagation();
		});

		//4.item/options change:
		$oldSelect.on('change', function(){
			console.log('val changed', $(this));
		});
	}

	$.fn.flattenSelect = function(options){

		options = $.extend({
			//default options
			//TBI detect multi-mode automatically
		}, options);

		return this.filter('select').each(function(index, el){
			var $el = $(el);
			if($el.data().set) return;//Do NOT re-init
			//get groups 'optgroup' with label
			//or
			//get options 'option' with value and html as label
			var config = grabSelectConfig($el);
			//show it
			$el.hide();
			$el.after(template(config)).data({set: true, vals:config.selected, options: options});
			//interactions
			registerListeners($el);
		});

	}

})(jQuery);
