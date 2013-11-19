/**
 * This is the Admin context module, note that there is a requireLogin flag that can be set
 * to call on switching to the Login context if the user is not logged in...
 *
 * Factory
 * -------
 * We also provide a 'create' method for producing a UI submodule under Admin context. 
 * This way we can glue the data, datagrid, form, layout and effect together in a generalized way.
 *
 * @author Tim.Liu
 * @created 2013.09.28
 */
;(function(app){

	app.Context.create('Admin', function(context){

		return {
			requireLogin: true,
			defaults: {
				region: 'content',
				module: 'Dashboard'
			},
			View: {
				Default: Backbone.Marionette.Layout.extend({
					template: '#application-context-admin-tpl',
					className: 'default row-fluid',
					regions: {
						sidebar: '.sidebar',
						content: '.content',
					},
					onShow: function(){
						this.sidebar.show(new context.Menu.View.Default());
					}
				})
			},

			/**
			 * Factory
			 * @param  {[type]} name    name of the admin submodule
			 * @param  {[type]} type    table|complex
			 *
			 * Options
			 * -------
			 * 1. dataunit { - see core/modules/data-units.js
			 *  modelOnly: true|false
			 * 	model: ...
			 * 	collection: ...
			 * }
			 * 2. datagrid { - see core/parts/widgets/standard/data-grid.js, ignored if of type complex.
			 * 	columns: [{
						label: default on field title, optional
						cell: default on "string", optional
						headerCell: default on 'string', optional
						filterable: default on 'true' , searchable through jquery.sieve, optional
						sortDisabled: default on 'false', apply local sort through table sorter, optional
						...
					}, - see datagrid widget and lib Backgrid.js
					...
				],
			 * 	tools: [{
	                //multiple button group can be added.
	                group: 'batch', //group name doesn't really matter atm.
	                buttons: [
	                    {
	                        label: 'New',
	                        icon: 'icon-plus-sign icon-white', //the icon class
	                        action: 'new' //the action attribute
	                    },
	                    {
	                        label: '',
	                        icon: 'icon-trash',
	                        action: 'remove'
	                    }
	                ]
            }]
			 * 	alterTools: function(tools) - change the tools
			 * 	pagination: {} collection pagination - see core/enhancements/collection.js
			 * }
			 * 3. form - a view object definition or a object wrapping {template + editors config} for activateEditors
			 * 4. defaultAdminPath - 'MenuItem->SubItem->...' menu item name and path.
			 * 
			 * @return the admin submodule
			 */
			create: function(name, type, options){
				var submodule = context.module(name);
				app.DataUnits.init(name, _.extend({}, options.dataunit, type === 'table'?{}:{modelOnly:true}));

				_.extend(submodule, {

					type: type,
					defaultAdminPath: options.defaultAdminPath,

					View: {
						List: type === 'table' ? app.Widget.get('DataGrid') : undefined,

						/*This is a template for implementing your own Form*/
						Detail: _.isFunction(options.form)?options.form:Backbone.Marionette.ItemView.extend({
							initialize: function(opt){
								this.template = '#custom-tpl-context-admin-submodule-general-form-' + type;
								this.autoDetectUIs();
								this.enableForm(options.form);
								this.enableActionTags('Admin.' + name);
							},

							onShow: function(){
								this.activateEditors(_.extend({
									appendTo: '[editorarea]',
									triggerOnShow: true,
								}, options.form));
								//fill the editors with vals
								this.setValues(this.model.attributes);
							},

							//pre-defined actions
							actions: {
								submit: function(){
									var errors = this.validate(true);
									if(errors) return;
									
									this.model.set(this.getValues());
									this.trigger('form:save-record');
								},
								cancel: function(){
									this.close();
								},
								refresh: function(){
									var that = this;
									if(this.model.id){
										this.model.fetch({
											success: function(m){
												that.setValues(m.attributes);
											}
										})
									}else throw new Error('DEV::Admin.' + name +'::Your model should have an id assigned by server');
								}
							}
						}),

						Default: Backbone.Marionette.Layout.extend({
							template: '#custom-tpl-context-admin-submodule-general',
							className: 'custom-tpl-layout-wrapper module-admin-layout-wrap',
							initialize: function(opt){
								opt = opt || {};
								this.model = opt.model || new Backbone.Model({
									//the layout view info package (as a model to a view) see the admin layout template below.
									title: _.string.titleize(_.string.humanize(name + 'Manager')) 
								});
								this.autoDetectRegions();
							},

							onShow: function(){
								if(type === 'table'){
									var collection = new (app.DataUnits.get(name).Collection);
									var grid = new submodule.View.List(_.extend({
						                collection: collection,
						            }, options.datagrid));
						            this.listenTo(grid, 'grid:show-form', function(m){
						            	var form = new submodule.View.Detail({
											model: m,
										});
										this.listenTo(form, 'form:save-record', function(){
											grid.saveRecord(form);
										});
										this.detail.show(form);
						            });
									this.list.show(grid);
								}
								else { //complex
									var model = new (app.DataUnits.get(name).Model);
									var that = this;
									model.fetch({
										data: { page: 1, per_page: 1},
										success: function(m){
											var form = new submodule.View.Detail({
												model: m
											});
											that.listenTo(form, 'form:save-record', function(){
												if(form.model.changedAttributes()){
													$.ajax({
														url: form.model.url(),
														type: 'PUT',
														contentType: 'application/json',
														processData: false,
														data: JSON.stringify(form.model.changedAttributes()),
														notify: true
													})
												}else {
													//do nothing
												}
											});
											that.detail.show(form);
										}
									})

								}
							},
						})
					}

				});

				return submodule;
			}
		} 
	});

})(Application);

//context layout 
Template.extend(
	'application-context-admin-tpl',
	[
	    '<div class="sidebar span2"></div>',
	    '<div class="content span10"></div>'
	]
);

//admin factory default submodule layout
Template.extend(
	'custom-tpl-context-admin-submodule-general',
	[
		'{{#if title}}<div class="default-layout-header"><i class="icon-th-list"></i> <span class="default-layout-header-title">{{title}}</span></div>{{/if}}',
		'<div class="default-layout-body">',
            '<div region="list"></div>',
            '<div region="detail"></div>',
		'</div>',
		'<div class="default-layout-footer"></div>',
	]
);

//admin factory default form layout - table
Template.extend(
	'custom-tpl-context-admin-submodule-general-form-table',
	[
		'<div><h3 class="record-action-type" style="border-bottom:2px solid #eee">{{#if _id}}Edit{{else}}Create{{/if}}</h3></div>',
		'<div editorarea="true"></div>',
		'<div>',
			//buttons
			'<div style="width:200px; margin: 0 auto;">',
				'<span class="btn btn-action-save" action="submit">Save</span> ',
				'<span class="btn" action="cancel">Cancel</span> ',
			'</div>',
		'<div>'
	]
);

//admin factory default form layout - complex
Template.extend(
	'custom-tpl-context-admin-submodule-general-form-complex',
	[
		'<div><h3 class="record-action-type" style="border-bottom:2px solid #eee">{{#if _id}}Edit{{else}}Create{{/if}}</h3></div>',
		'<div editorarea="true"></div>',
		'<div>',
			//buttons
			'<div style="width:200px; margin: 0 auto;">',
				'<span class="btn btn-action-save" action="submit">Save</span> ',
				'<span class="btn" action="refresh">Refresh</span> ',
			'</div>',
		'<div>'
	]
);