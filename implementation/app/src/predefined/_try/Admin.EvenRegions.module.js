/**
 * Testing on the evenRegionSize() extension to Layout objects.
 */

;(function(app){

	var context = app.Context.Admin;
	var module = context.module('EvenRegions');

	_.extend(module, {

		defaultMenuPath: "Test->Layout->EvenRegions",

		View: {
			Default: Backbone.Marionette.Layout.extend({
				template: '#custom-module-admin-evenregions-tpl',
				regions: {
					tools: '[region=toolbar]',
					tabs: '[region=tabs]',
					test: '[region=test]',
					tabs2: '[region=tabs2]',
					test2: '[region=test2]'					
				},

				initialize: function(options){
					this.hookUpWindowResize();
				},

				onShow: function(){
					this.fakeRegions();
					this.evenRegionSize({
						mode: 'horizontal'
						//mode: 'vertical'
					});
				}
			})
		}

	});

})(Application);

Template.extend('custom-module-admin-evenregions-tpl',
[
	'<div region="toolbar"></div>',
	'<div region="tabs"></div>',
	'<div region="test"></div>',
	'<div region="tabs2"></div>',
	'<div region="test2"></div>'	
]);