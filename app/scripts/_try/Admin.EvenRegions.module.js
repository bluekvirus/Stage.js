/**
 * Testing on the evenRegionSize() extension to Layout objects.
 */

;(function(app){

	var context = app.Context.Admin;
	var module = context.module('EvenRegions');

	_.extend(module, {

		defaultAdminPath: "Test->EvenRegions",

		View: {
			Default: Backbone.Marionette.Layout.extend({
				template: '#custom-module-admin-evenregions-tpl',
				regions: {
					tools: '[region=toolbar]',
					tabs: '[region=tabs]'
				},

				initialize: function(options){
					this.hookUpWindowResize();
				},

				onShow: function(){
					this.fakeRegions();
					this.evenRegionSize({
						mode: 'vertical'
					});
				}
			})
		}

	});

})(Application);

Template.extend('custom-module-admin-evenregions-tpl',
[
	'<div region="toolbar"></div>',
	'<div region="tabs"></div>'
]);