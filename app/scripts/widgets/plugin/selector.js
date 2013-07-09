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
		'<ul class="inline">',
			'{{#each selected}}',
				'<li class="select-selected-val"><span>{{this.key}}</span> <button type="button" class="close">&times;</button></li>',
			'{{/each}}',
		'</ul>',
	'</div>',
	'<div class="select-opts">',
		//options by group
		'{{#each groups}}',
			'<div class="select-opt-group">',
				'{{#each this}}',
					'<span class="select-opt-item">{{this.key}}</span>',
				'{{/each}}',
			'</div>',
		'{{/each}}',
	'</div>'
]);

(function($){

	var template = Handlebars.compile($('#custom-tpl-widget-plugin-flattened-select').html());
	function grabOption($opt){
		return {
			key: $opt.text(),
			val: $opt.attr('value'),
		}
	}
	function grabSelectConfig($select) {
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

	function registerListeners($select) {
		var $parent = $select.parent();
		var $opts = $parent.find('.select-opts');
		var top = $select.offset().top + $select.outerHeight();
		var gap = $opts.innerWidth() - $opts.width() + 20;
		//parent will handle interactions:
		//expand/hide options:
		$parent.on('click', '.select-val-ct', function(){
			/**
			 * [WARNING:: show the element before manipulate the offset() or el that is hidden or display:none will jerk off the screen...]
			 */
			if($opts.data().set) $opts.width($parent.width() - gap).fadeToggle();
			else
				$opts.show().data({set: true}).offset({
					top: top,
				}).width($parent.width() - gap);
		});
	}

	$.fn.flattenSelect = function(options){

		options = $.extend({
			//default options
		}, options);

		//TBI
		return this.filter('select').each(function(index, el){
			var $el = $(el);
			if($el.data().set) return;//Do NOT re-init
			//get groups 'optgroup' with label
			//or
			//get options 'option' with value and html as label
			var config = grabSelectConfig($el);
			//show it
			$el.hide();
			$el.after(template(config)).data({set: true});
			//interactions
			registerListeners($el.next());
		});

	}

})(jQuery);
