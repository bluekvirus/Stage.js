/**
 * This is the developer context which groups UI modules for developer tools. (e.g. UI for modelgen under server/tools/)
 *
 * @author Tim.Liu
 * @created 2013.09.30
 */

;(function(app){
	
	//Context Definition
	var context = app.Context.create('_Dev'); //the tool UIs are hooked into the footer region.

	/*=====The immediate action buttons on the 'Developer Tools' bar.=====*/
	//Note that this is different than the tool panel listing...which is determined by tool UI module labels.
	var buttons = [
		{
			label: 'Toggle Tool Panels',
			action: 'toggleToolPanel',
			icon: 'icon-info-sign icon-white',
			color: 'warning'
		}
	];
	/*====================================================================*/

	//Patch in UI hooks to footer UI.
	var HookUI = Backbone.Marionette.Layout.extend({
		template: '#application-context-_dev-hookui-tpl',
		regions: {
			panel: '#dev-tool-panel'
		},
		ui: {
			contextSwitcher: '[ui=contextSwitcher]'
		},
		initialize: function(options){
			options = options || {};
			this.model = options.model || new Backbone.Model({
				tasks: buttons,
				contexts: _.map(app.Context.submodules, function(m){
					if(!_.contains(['Shared', '_Dev'], m.name))
						return {name: m.name};
					return {};
				})
			});
			this.listenTo(app, 'app:context-switched', this.onContextSwitched);
			this.enableActionTags('Context._DEV.HookUI');
		},
		onContextSwitched: function(context){
			context = context || app.currentContext.name;
			this.ui.contextSwitcher.find('[context]').removeClass('active');
			this.ui.contextSwitcher.find('[context=' + context + ']').addClass('active');
		},
		onShow: function(){
			this.$el.css({
				padding: '10px',
				borderTop: '1px solid',
				marginTop: '10px',
				position: 'fixed',
				backgroundColor: '#fff',
				bottom: 0,
				right: 0,
				left: 0,
				overflowY: 'auto'
			});
			//show the tool UI modules
			this.enableTabLayout('left', 'panel');
			_.each(context.submodules, function(tool){
				this.addTab(new tool.View.Default());
			}, this);
			this.showTab(0);
			this.onContextSwitched();
		},
		actions: {
			toggleToolPanel: function($action){
				if(this._expended){
					this.panel.$el.hide();
					this.$el.css('top', '');
					this._expended = false;
					return;
				}
				this.$el.animate(
				{
					top: '20%'
				}, 500, _.bind(function(){
					this._expended = true;
					this.panel.$el.toggle();
				}, this));
			},

			switchContext: function($action){
				app.trigger('app:switch-context', $action.attr('context'), true);
			}
		}
	});

	app.on("initialize:after", function(options){
		var $hook = app.getRegion('footer');
		var uihook = new HookUI().render();
		if($hook.currentView){
			$hook.$el.append(uihook.el);
			uihook.onShow()
		}else
			$hook.show(uihook);

	});


})(Application);

Template.extend(
	'application-context-_dev-hookui-tpl',
	[
		'<div>',
			'<i class="icon-wrench"></i> Developer Tools ',
			//tool bar buttons
			'{{#each tasks}}',
				'<span class="btn btn-small btn-{{color}} pull-right" style="margin-left: 10px;" action="{{action}}"><i class="{{icon}}"></i> {{label}}</span>',
			'{{/each}}',
			//available contexts (quick switch)
			'<div class="btn-group pull-right" ui="contextSwitcher" style="margin-left:10px;">',
				'{{#each contexts}}',
					'{{#if name}}',
                		'<button type="button" class="btn btn-small" action="switchContext" context="{{name}}">{{name}}</button>',
                	'{{/if}}',
                '{{/each}}',
            '</div>',
		'</div>',
		'<div id="dev-tool-panel" style="display:none; margin-top:10px; padding-top:5px; border-top:5px solid #eee">',
			'<div class="tabbable tabs-left" id="dev-tool-panel-tabs">',
				//'<ul class="nav nav-tabs">/*<li><a data-toggle="tab" href="#tooltab1">123</a></li></ul>',
				'<ul class="nav nav-tabs"></ul>',
				//'<div class="tab-content"><div class="tab-pane" id="tooltab1">hello!!</div></div>',
				'<div class="tab-content" style="border-left: 5px solid #eee; padding-left: 10px;"></div>',
			'</div>',
		'</div>'
	]
);
