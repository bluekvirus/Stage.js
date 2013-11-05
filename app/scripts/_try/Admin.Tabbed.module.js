/**
 * Testing on the tabbedLayout() extension to Layout objects.
 */

;(function(app){

	var context = app.Context.Admin;
	var module = context.module('TabbedLayout');

	_.extend(module, {

		defaultAdminPath: "Test->TabbedLayout",

		View: {
			Default: Backbone.Marionette.Layout.extend({
				template: '#custom-module-admin-tabbed-tpl',

				initialize: function(){
					this.autoDetectRegions();
				},

				onShow: function(){
					this.fakeRegions();
					this.enableTabLayout('top', 'tabs');
					_.each(app.Context._Dev.submodules, function(m){
						this.addTab(new m.View.Default());
					}, this);
					this.showTab(0);
					this.intro.$el.md({
						file: 'testmd.test',
						callback: function($el){
							//console.log($el);
						}
					});
				}
			})
		}

	});

})(Application);

Template.extend('custom-module-admin-tabbed-tpl',
[
	'<div region="intro"></div>',
	'<div region="tabs"></div>'
]);