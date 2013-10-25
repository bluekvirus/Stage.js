/**
 * Testing on the tabbedLayout() extension to Layout objects.
 */

;(function(app){

	var context = app.Context.Admin;
	var module = context.module('TabbedLayout');

	_.extend(module, {

		defaultAdminPath: "Test->TabbedLayout",

		View: {
			Default: Backbone.Marionette.ItemView.extend({
				template: '#custom-module-admin-tabbed-tpl',
				// regions: {
				// 	tools: '[region=toolbar]',
				// 	tabs: '[region=tabs]'
				// },

				onShow: function(){
					//this.fakeRegions();
					this.enableTabLayout('top', 'tabs');
					_.each(app.Context._Dev.submodules, function(m){
						this.addTab(new m.View.Default());
					}, this);
					this.showTab(0);
				}
			})
		}

	});

})(Application);

Template.extend('custom-module-admin-tabbed-tpl',
[
	'<div region="toolbar"></div>',
	'<div region="tabs"></div>'
]);