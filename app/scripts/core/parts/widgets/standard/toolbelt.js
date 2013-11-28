/**
 * This is the generalized ToolBelt widget, you can use it in a DataGrid2
 *
 * Options
 * -------
 * 1 tools: [ (append to default tools) - default on having [create] [delete]
 * 		{
 * 			name: ..., action event string (*required)
 * 		 	label: ..., string [opt]
 * 		  	icon: ..., class string [opt]
 * 		  	group: ..., string [opt]
 * 		  	panel: ..., view object - used for opening a customized view in the panel region below toolbar region for further iteractions.
 * 		   	fn: impl function() 
 * 		},...,
 * ] or { (replace the tools)
 * 		'name': { 
 * 			label: ..., string [opt]
 * 			icon: ..., class string [opt]
 * 			group: ..., string [opt],
 * 			panel: ..., view object
 * 			fn: impl function() [opt]
 * 		},...,
 * }
 *
 * Advanced: since tool name is also the action trigger/event name, you can use ':name' to just fire event.
 *
 * 2 filter: enabled (default) | disabled - local collection filtering only
 * 
 * [TBI] 3 search: true, false (default), or { panel: advanced search panel view, callback: function(panel, collection) to call when user clicked search}
 * Note that search will have two modes:
 * 	a. remote - implemented by your panel and callback
 * 	b. local - linking with our extension to the collection. see core/enhancements/collection
 *
 * @author Tim.Liu
 * @created 2013.11.21
 */

Application.Widget.register('ToolBelt', function(){

	var UI = Backbone.Marionette.Layout.extend({
		template: '#widget-toolbelt-tpl',
		initialize: function(options){
			this.autoDetectRegions();
			//sort out tools.
			if(_.isArray(options.tools)){
				options.tools = [{
					name: 'create',
					label: 'Create',
					icon: 'icon-plus-sign'
				}, {
					name: 'delete',
					label: 'Delete',
					icon: 'icon-trash'
				}].concat(options.tools);
			}else {
				options.tools = _.map(options.tools, function(tool, name){
					return _.extend({
						name: name
					}, tool);
				});
			}
			//sort out groups
			var groups = { _default: [] };
			_.each(options.tools, function(tool){
				if(tool.group){
					groups[tool.group] = groups[tool.group] || [];
					groups[tool.group].push(tool);
				}else
					groups._default.push(tool);
			});

			this.model = new Backbone.Model({
				groups: groups,
				filter: options.filter
			});
		}

	});

	return UI;

});

Template.extend('widget-toolbelt-tpl', [

    '<div class="btn-toolbar">',
    	//tools (by group)
        '{{#each groups}}',
            '<div class="tool-group">',
                '{{#each this}}',
                    '<a class="btn tool-btn-{{name}}" {{#unless panel}}action="{{name}}"{{/unless}}><i class="{{icon}}"></i> {{label}}</a>',
                '{{/each}}',
            '</div>',
        '{{/each}}',

        //local data filter box (in a separate widget?)
        '{{#isnt filter "disabled"}}',
	        '<div class="pull-right input-prepend local-filter-box">',
	            '<span class="add-on"><i class="icon-filter"></i></span>',
	            '<input type="text" class="input input-medium" name="filter" placeholder="Local Filter...">',
	        '</div>',
	    '{{/isnt}}',
    '</div>',
    '<div region="panel"></div>'

]);