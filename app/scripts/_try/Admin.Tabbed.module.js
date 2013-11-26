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
					var grid = app.Widget.create('DataGrid2', {
						collection: new (app.DataUnits.get('Comment').Collection)(),
						pagination: {
							pageSize: 8,
							mode: 'server'
						},
						columns: [
							// {
							// 	cell: 'select-all'
							// },
							{
								name: 'title',
								label: 'Title'
							},
							{
								name: 'updated_at',
								label: 'Update',
								cell: Backbone.Marionette.ItemView.extend({
									template: '#_blank',
									onRender: function(){
										this.$el.html(this.model.get('val') + ' new Cell');
									}
								})
							}
						]
					});
					grid.tab = {
						title: 'Grid2 Test'
					};
					this.addTab(grid);
					this.addTab(new (Backbone.Marionette.ItemView.extend({
						template: '#_blank',
						tab: {
							title: '$.md Plugin Test'
						},
						onShow: function(){
							this.$el.md({
								file: 'testmd.test',
								callback: function($el){
									//console.log($el);
								}
							});
						}
					}))());
					this.showTab(0);
				}
			})
		}

	});

})(Application);

Template.extend('custom-module-admin-tabbed-tpl',
[
	//'<div region="intro"></div>',
	'<div region="tabs"></div>'
]);