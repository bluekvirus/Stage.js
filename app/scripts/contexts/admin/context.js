/**
 * This is the Admin context module, note that there is a requireLogin flag that can be set
 * to call on switching to the Login context if the user is not logged in...
 *
 * Factory
 * -------
 * We also provide a 'create' method for producing a UI submodule under Admin context. 
 * This way we can glue the data, datagrid, form, layout and effect together in a generalized way.
 *
 *
 * Menu
 * ----
 * We need both 1-level accordion and 2-level one so that if 1-level menu section list goes too long we can use the 2-level layout.
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

					initialize: function(){
						this.autoDetectRegions();
						if(app.config.fullScreen){
							this.resize = function(){
								this.content.$el.height(app.fullScreenContextHeight.bodyOnly);
								this.sidebar.$el.height(app.fullScreenContextHeight.bodyOnly);
							}
							this.listenTo(app, 'view:resized', function(){
								this.resize();
							});
						}						
					},

					onShow: function(){
						this.sidebar.show(new context.Menu.View.Default());
						if(app.config.fullScreen) this.sidebar.$el.addClass('with-border-right');
						this.content.ensureEl();
						this.content.$el.css('overflowY', 'auto');
						this.resize();
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

							className: 'admin-submodule-general-form',
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
									title: options.defaultAdminPath.split('->')
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
	    '<div region="sidebar" class="span2"></div>',
	    '<div region="content" class="span10"></div>'
	]
);

//admin factory default submodule layout
Template.extend(
	'custom-tpl-context-admin-submodule-general',
	[
		'<div class="default-layout-header" ui="header">',
			'<ul class="inline" style="margin:0;">',
				'{{#each title}}',
					'<li><span>{{this}}</span> <i class="icon-chevron-right"></i></li>',
				'{{/each}}',
			'</ul>',
		'</div>',
		'<div class="default-layout-body" ui="body">',
			'<div region="detail"></div>',
            '<div region="list"></div>',
		'</div>',
		'<div class="default-layout-footer"></div>',
	]
);

//admin factory default form layout - table
Template.extend(
	'custom-tpl-context-admin-submodule-general-form-table',
	[

		'<div class="form-body" editorarea="true"></div>',
		//buttons
		'<div class="btn-bar-ct">',
			'<div class="btn-bar">',
				'<span class="btn btn-action-save" action="submit">Save</span> ',
				'<span class="btn" action="cancel">Cancel</span> ',
			'</div>',		
		'</div>',
	]
);

//admin factory default form layout - complex
Template.extend(
	'custom-tpl-context-admin-submodule-general-form-complex',
	[

		'<div class="form-body" editorarea="true"></div>',
		//buttons
		'<div class="btn-bar">',
			'<span class="btn btn-action-save" action="submit">Save</span> ',
			'<span class="btn" action="refresh">Refresh</span> ',
		'</div>',

	]
);