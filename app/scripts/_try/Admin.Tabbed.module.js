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
							pageSize: 10,
							//mode: 'server'
						},
						columns: [
							{
								cell: 'select-all',
								header: 'select-all'
							},
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
							},
							{
								label: 'Actions',
								cell: 'action',
								actions: [
									{
										name: 'test',
										icon: 'icon-music',
										fn: function(record, row){
											console.log(record);
										}
									}
								]	
								// actions: {
								// 	test: {
								// 		icon: 'icon-music'
								// 	}
								// }
							}
						],
						toolbar: {
							tools: [
								{
									name: 'refresh',
									label: 'Refresh',
									icon: 'icon-refresh',
									group: 'other',
									fn: function(grid){
										console.log(grid.table.collection.size());
									}
								},
								{
									name: 'search',
									label: 'Search',
									icon: 'icon-search',
									group: 'search',
									panel: new (Backbone.Marionette.ItemView.extend({
									  template: "#_blank",
									  events: {
									  	'keyup': function(e){
									  		console.log(e);
									  	}
									  },
									  onShow: function(){
									  	this.activateEditors({
									  		editors: {
												abc: {
													type: 'text',
													label: 'Abc',
													help: 'This is abc',
													tooltip: 'Hey Abc here!',
													fieldname: 'newfield',
													validate: {
														required: {
															msg: 'Hey input something!'
														},
														fn: function(val, parentCt){
															if(!_.string.startsWith(val, 'A')) return 'You must start with an A';
														}
													}
												},
											}
									  	});
									  }
									}))
								},
								{
									name: 'search2',
									label: 'Search2',
									icon: 'icon-search',
									group: 'search',
									panel: new (Backbone.Marionette.ItemView.extend({
									  template: "#_blank",
									  events: {
									  	'keyup': function(e){
									  		console.log(e);
									  	}
									  },
									  onShow: function(){
									  	this.activateEditors({
									  		editors: {
												abc: {
													type: 'text',
													label: 'EFG',
													help: 'This is another input',
													tooltip: 'Whola!',
													fieldname: 'newfield',
													validate: {
														required: {
															msg: 'Hey input something!'
														},
														fn: function(val, parentCt){
															if(!_.string.startsWith(val, 'A')) return 'You must start with an A';
														}
													}
												},
											}
									  	});
									  }
									}))
								}								
							],
							//filter: 'disabled'
							// tools: {
							// 	refresh: {
							// 		label: 'Refresh',
							// 		icon: 'icon-refresh',
							// 	}
							// }
						}
					});
					grid.tab = {
						title: 'Grid2 Test'
					};
					this.addTab(grid);

					_.extend(grid.actions, {
						create: function($action){
							console.log($action.attr('action'));
						},

						delete: function($action){
							var targetIds = this.table.getSelectedRows(function(row){
								return row.meta.record.id;
							});

							console.log(targetIds);
						}
					});
					grid.filter = function(val){
						console.log(val);
					};


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