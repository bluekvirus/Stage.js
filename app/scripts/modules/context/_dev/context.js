/**
 * This is the developer context which groups UI modules for developer tools. (e.g. UI for modelgen under server/tools/)
 *
 * @author Tim.Liu
 * @created 2013.09.30
 */

;(function(app){

	var tools = [
		{
			label: 'Manage Server Models',
			action: '#navigate/Models',
			icon: 'icon-hdd icon-white'
		},
	];
	
	//Context Definition
	app.Context.create('_Dev', function(context){

		return {
			requireLogin: true,
			defaults: {
				region: 'content',
				module: 'Models'
			},
			View: {
				Default: Backbone.Marionette.Layout.extend({
					template: '#application-context-_dev-tpl',
					className: 'default row-fluid',
					regions: {
						sidebar: '.sidebar',
						content: '.content',
					},
					onShow: function(){
						//
					}
				})
			}
		} 
	});

	//Patch in UI hooks to footer UI.
	var HookUI = Backbone.Marionette.ItemView.extend({
		template: '#application-context-_dev-hookui-tpl',
		initialize: function(options){
			options = options || {};
			this.model = options.model || new Backbone.Model({
				tasks: tools
			});
			//$(window).on('resize', _.bind(this.onWindowResize, this));
		},
		onRender: function(){
			app.main.ensureEl();
			this.$el.css({
				padding: '10px',
				borderTop: '1px solid',
				marginTop: '10px',
				position: 'fixed',
				bottom: 0,
				right: app.main.$el.css('paddingRight'),
				left: app.main.$el.css('paddingLeft')
			});
		},
		onShow: function(){
		},
		// onWindowResize: function(){
		// 	this.$el.width($(window).width());
		// },
		// onClose: function(){
		// 	$(window).off('resize', this.onWindowResize);
		// }
	});

	app.on("initialize:after", function(options){
		var $hook = app.getRegion('footer');
		var uihook = new HookUI().render();
		if($hook.currentView){
			$hook.$el.append(uihook.el);
		}else
			$hook.show(uihook);

	});


})(Application);

Template.extend(
	'application-context-_dev-hookui-tpl',
	[
		'<div class="clearfix">',
			'Developer Tools',
			'{{#each tasks}}',
				'<span class="btn btn-small btn-warning pull-right" style="margin-left: 10px;" action="{{action}}"><i class="{{icon}}"></i> {{label}}</span>',
			'{{/each}}',
		'</div>'
	]
);

Template.extend(
	'application-context-_dev-tpl',
	[
        '<div class="sidebar span2"></div>',
        '<div class="content span10"></div>',
	]
);