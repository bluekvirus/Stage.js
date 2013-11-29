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
 * 		   	fn: impl function() - note that if panel is specified, this will be ignored.
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
 * 3 parentCt: the one to pass to the tool fn implementation.
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
		className: 'tool-belt',
		initialize: function(options){

			this.parentCt = options.parentCt;
			if(!this.parentCt) throw new Error('DEV::Widget.ToolBelt::You must attach this toolbelt to a parentCt (action delegate)');

			this.autoDetectRegions();
			this.enableActionTags('Widget.ToolBelt', true);//letting action tag event pass if there is no impl found.
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
			//sort out panel, fn and groups
			var groups = { _default: [] };
			this.panels = {};
			this.fns = {};
			_.each(options.tools, function(tool){
				if(tool.panel) {
					tool.delayAction = true;
					this.panels[tool.name] = tool.panel;
				}else if(tool.fn){
					tool.customFn = true;
					this.fns[tool.name] = tool.fn;
				}
				if(tool.group){
					groups[tool.group] = groups[tool.group] || [];
					groups[tool.group].push(tool);
				}else
					groups._default.push(tool);
			}, this);

			this.model = new Backbone.Model({
				groups: groups,
				filter: options.filter
			});
		},

		events: {
			'click [showPanel]': function(e){
				e.preventDefault();
				e.stopPropagation();
				this.panel.ensureEl();
				$btn = $(e.currentTarget);
				var name = $btn.attr('showPanel');

				if(this.panel.$el.hasClass('hide')){
					this.panel.$el.removeClass('hide');
					$btn.addClass('active');
					if(this.currentPanel !== [name]){
						this.panels[name].delegateEvents(); //re-activate the event handlers, since since the panel view object might have been closed during panel switching.[!Important!]
						this.panel.show(this.panels[name]);
						this.currentPanel = name;
					}
				}else {
					this.$('[showPanel]').removeClass('active');
					if(this.currentPanel === name){
						this.panel.$el.addClass('hide');
					}else {
						$btn.addClass('active');
						this.panels[name].delegateEvents(); //re-activate the event handlers.[!Important!]
						this.panel.show(this.panels[name]);
						this.currentPanel = name;
					}
				}
			}
		},

		actions: {
			customized: function($action){
				this.fns[$action.attr('fn')](this.parentCt);
			}
		}

	});

	return UI;

});

Template.extend('widget-toolbelt-tpl', [

    '<div class="toolbelt-btns">',
    	//tools (by group)
        '{{#each groups}}',
            '<div class="tool-group">',
                '{{#each this}}',
                    '<a class="btn tool-btn-{{name}}" {{#if customFn}}action="customized" fn="{{name}}"{{/if}} {{#if delayAction}}showPanel="{{name}}"{{else}}action="{{name}}"{{/if}}><i class="{{icon}}"></i> {{label}}</a>',
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
    '<div region="panel" class="toolbelt-panel hide"></div>'

]);