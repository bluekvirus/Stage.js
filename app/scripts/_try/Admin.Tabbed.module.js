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
						entity: 'Comment',
						pagination: {
							pageSize: 10,
							//mode: 'server'
							//mode: 'infinite'
						},
						columns: [
							{
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
											console.log(this, record);
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
										grid.refresh({reset: true});
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
							shortcut: {
								//icon: 'icon-search',
								fn: function(val, grid){
									console.log(val, grid);
								}
							},
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
					this.listenTo(grid, 'grid:show-form', function(form){
						form.openEffect({
							name: 'slide',
							options: {
								direction: 'up'
							}
						});
						this.details.show(form);
					});
					var formOpt = {
						layout: 'form-horizontal',
						editors: {
							title: {
								label: 'Title'
							},
							body: {
								label: 'Content',
								type: 'textarea'
							}
						},
						buttons: [
							'save', 'cancel', {
								name: 'nothing',
								fn: function($action){
									console.log('hey! nothing happened');
								}
							}, {
								name: 'refresh',
							}, 'reset'
						]
					};					
					_.extend(grid.actions, {
						create: function($action){
							//the form view.
							var view = app.Widget.create('BasicForm', _.extend({
								data: {
									body: 'nothing new...'
								},
								record: grid.table.collection.create()
							}, formOpt));
							this.trigger('grid:show-form', view);
							this.listenToOnce(view, 'form:record-saved form:cancelled', function(){
								view.close();
								grid.refresh();
							});
						},

						delete: function($action){
							var targetIds = this.table.getSelectedRows(function(row){
								return row.meta.record.id;
							});

							console.log(targetIds);
						}
					});
					this.listenTo(grid, 'toolbelt:shortcut:input-changed', function(val, grid){
						console.log('toolbelt:shortcut:input-changed', val);
					});

					grid.implementRowActions({
						'detail': function(record, row){
							console.log(record.id);
						},

						'edit': function(record, row){
							var view = app.Widget.create('BasicForm', _.extend({}, {
								data: record.attributes,
								record: record,
							}, formOpt));
							grid.highlight(row).trigger('grid:show-form', view);
							grid.listenToOnce(view, 'form:record-saved form:cancelled', function(){
								grid.highlight(row, false);
								view.close();
							});
						},

						'delete': function(record, row){
							grid.confirm(this, 'Do you want to delete this record?', function(record, row){
								record.destroy().always(function(){
									grid.refresh();
								});
							});
						}
					})


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
	'<div region="tabs"></div>',
	'<div region="details"></div>',
]);