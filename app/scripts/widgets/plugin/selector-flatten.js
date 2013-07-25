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
			'<div class="tools">',
		    	//expand/collapse
		    	'<div class="tool-opts-expand pull-right">',
		    		'<span class="more-opts"><i class="icon-plus"></i>More</span>',
		    		'<span class="less-opts"><i class="icon-minus"></i>Less</span>',
		    	'</div>',				
				//search
				'<div class="input-prepend tool-opts-search">',
					'<span class="add-on"><i class="icon-search"></i></span>',
		    		'<input class="input-medium tool-opts-search-input" type="text">',
		    	'</div>',
			'</div>',
			//options by group
			'<div class="select-opt-groups">',
				'{{#each groups}}',
					'<div class="select-opt-group">',
						// '<div class="select-opt-group-title">{{@key}}</div>', WARNING::we do NOT support groups in flattened mode, use hover version.
						'<div class="select-opt-group-items">',
							'{{#each this}}',
								'<span class="select-opt-item {{#unless this.key}}select-opt-item-empty{{/unless}}" data-value="{{this.val}}">{{this.key}}</span>',
							'{{/each}}',
						'</div>',
					'</div>',
				'{{/each}}',
			'</div>',
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
	function adjustTools($oldSelect){
		var $select = $oldSelect.next();
		var $tools = $select.find('.tools');
		var $optItems = $select.find('.select-opt-groups');
		var $optItem = $optItems.find('.select-opt-item:last');
		var options = $oldSelect.data().options;

		//a. more/less on config.maximumLines, undefined/null/0 for no limits
		//TBI
		if(!$optItems.height() || !$optItem.outerHeight(true)) return;
		var lines = Math.floor($optItems.height()/($optItem.outerHeight(true)));
		if(options.maximumLines && options.maximunLines !== 0 && lines > options.maximumLines){
			//show tools along with the expand/collapse button
			$tools.show();
			var height = options.maximumLines * ($optItem.outerHeight(true));
			$optItems.height(height).data('recoverHeight', height);
		}

		//b. search on config.searchEnabled, true for always, > 1 for shown when number of options exceed this val; 
		if(options.searchEnabled && options.searchEnabled != 0 && options.searchEnabled <= $optItems.find('.select-opt-item').length){
			//show search box
			$searchBox = $tools.find('.tool-opts-search');
			//position it?? TBI
			$label = $tools.parents(options.parentCtSelector).find(options.fieldLableSelector);
			$searchBox.css('display', 'inline-block').find('.tool-opts-search-input').width($label.width()/2);
			$searchBox.position({
				my: 'right top',
				at: 'right bottom+5',
				of: $label,
				collision: 'fit none'
			});
		}
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

		//3. tools events:
		$tools = $select.find('.tools');
		$tools.on('click', '.tool-opts-expand', function(e){
			$el = $(e.currentTarget);
			$el.toggleClass('expanded');
			$optGroups = $opts.find('.select-opt-groups');
			if($el.hasClass('expanded')){
				$optGroups.css('height', 'auto');
			}else {
				$optGroups.height($optGroups.data('recoverHeight'));
			}
		}).on('keyup', '.tool-opts-search-input', function(e){
			var fuzzyTarget = '.*'+$(e.currentTarget).val().toLowerCase()+'.*';
			//search for this val in data().vals;
			$opts.find('.select-opt-item').each(function(index, item){
				var $el = $(this);
				if($el.text().toLowerCase().match(fuzzyTarget)){
					$el.show();
				}else{
					$el.hide();
				}
			})
		})

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
			//highlight
		highlightSelection($oldSelect);
			//patchin search and collapse/expand...
		adjustTools($oldSelect);
	}

	/*===============the plugin================*/
	$.fn.flattenSelect = function(options){

		options = $.extend({
			//default options
			//multi: this.attr('multiple'), //WARNING: we do NOT support multi-select in flattened mode yet...
			data: undefined,//TBI
			maximumLines: 2, //if options shown are more then 2 lines, show the more/less tool
			searchEnabled: 12, //if options are more than a dozen, show the search box
			parentCtSelector: '.control-group',
			fieldLableSelector: '.control-label'
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
			//=====give it a little adjustment upon window resizing=====
			function resizeFix() {
				if($el.parent().length > 0)
					reRender($el);
				else{
					$(window).off('resize', resizeFix);
				}
			}
			$(window).resize(resizeFix);
		});

	}

})(jQuery);
