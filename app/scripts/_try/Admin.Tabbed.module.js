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
				regions: {
					tools: '[region=toolbar]',
					tabs: '[region=tabs]'
				},
				
				onShow: function(){
					this.enableTabLayout('', 'tabs');
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