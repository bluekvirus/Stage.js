/**
 * This is the meta module (modules' module) that produces the data admin module for a given data object.
 * It is a replacement for our client side data module code obtained by the AdminGen.
 *
 * ======
 * Design
 * ======
 * Since the data admin modules show common patterns, we don't want the developers to download/re-generate code each time they change something in the field cfg or
 * we change something in the template. This is the module that reflects the latest change in the data admin management process.
 * Also, tho a GUI to help visualize the data admin config is good, most of our programmers prefer to write it, so they can feel more in-charged mentally. After all,
 * a JSON format representation carries limited data, custom behaviors (those can not be generalized to use a flag var) need functions which can not be stored easily 
 * in a json file.
 * A data admin module usually has 4 parts:
 * 1. fields (definition block)
 * 2. datagrid (widget) - if of type table.
 * 3. form (widget) - only, if of type complex.
 * 4. view (default layout view to show the datagrid and/or form)
 *
 * ======
 * Usage
 * ======
 * app.Factory.AdminModule.create(...config...); //define.
 * app.Factory.AdminModule.get(...name...); //for extension. directly use .extend() on widgets or use the Extension Manager module [modules/special/extension/manager.js]
 *
 * created module will appear in app.Context.Admin.[...name...]
 * 
 * ===================
 * Config/Init Options
 * ===================
 * To create a data admin module, we need:
 * {
 * 		name: (*) - required, this name will be used to obtain Model/Collection definitions from the DataUnits module (see data-units.js)
 * 		type: table | complex - default on table, optional
 * 		menuPath: default admin menu path. e.g. 'Content Manager->Blogs->...->...', optional
 * 		fields: {
 * 			f-name: {
 * 				//validations
 * 					validation: see lib Backbone.Validations, optional
 * 				//form
 * 					title: label , optional
 * 					tooltip/description: hover 2s tooltip, optional
 * 					editor: '[editor name]' as defined in form editors(widgets) or 'null', default on text input, use ReadOnly(//TBI) or Hidden if needs be...
 * 					editorOpt: options used when init the editor widget.
 * 					fieldset: a group name. Fieldset can help regroup some of the fields and apply a custom tpl to the set. optional
 * 					conditions: upon each 'change' event fired by the form, this function will be checked to see if this field should still be visible.
 * 								(note that a Hidden field is considered to be visible all the time). optional
 * 				//grid
					column: {
						label: default on field title, optional
						cell: default on "string", optional
						headerCell: default on 'string', optional
						filterable: default on 'true' , searchable through jquery.sieve, optional
						sortDisabled: default on 'false', apply local sort through table sorter, optional
						index: re-arrange column order? NIU atm.
						...
					} - see datagrid widget and lib Backgrid.js
 * 			},
 * 			...
 * 		},
 * 		grid: ...a copy of widget definition (.extend({}))... see the Widgets Registry module [modules/special/registry/widgets.js]
 * 		actions: [edit, delete] or none (which will remove both select_all and action columns) or {
 * 			batch: false,
 * 			list: [edit, delete, ...] 
 * 		} (this means that only the select_all column will be removed)
 * 		form: ...a copy of widget definition ...like grid this can be overridden to a non-predefined widget during .create()
 * }
 *
 * ============
 * Default view
 * ============
 * Since a visible module will always have a layout view object (marionette.js) in our application, our admin module will conform to this design.
 * Creating this default view object in the admin module of a given data object definition is the core purpose of this factory module.
 *
 * @author Tim.Liu
 * @created 2013.09.16
 * 
 */

;(function(app, _, Backbone){

	var Factory = app.Factory || app.module('Factory');
	var Admin = app.Context.Admin;

	Factory.AdminModule = {

		get: function(name){
			return Admin[name];
		},

		create: function(options){
			options = options || {};
			//apply defaults:
			options = _.defaults(options, {type: 'table', actions:['edit', 'delete']});
			if(!options.name) return;

			//1 prepare options from passed in config to the module components
			//validations, form schema, and grid columns
			var config = {
				validation: {}, schema: {}, columns: []
			}
			_.each(options.fields, function(f, fname){
				//1.1 extract validation for backbone-validations
				if(f.validation) config.validation[fname] = f.validation;
				//1.2 extract form schema (WARNING::note that currently we use the format defined by backbone-forms.js)
				f.title = f.title || _.string.titleize(fname);
				if(f.editor) config.schema[fname] = _.extend(_.omit(f, 'validation', 'column', 'editor', 'editorOpt'), f.editorOpt, {type: f.editor});
				//1.3 extract datagrid columns
				if(f.column) config.columns.push(_.extend({name: fname, label: f.title, cell: 'string'}, f.column));
			});
			//warning msgs.
			if(_.isEmpty(config.schema)) throw new Error('DEV::AdminFactory::You must have at least one editor configured for the form widget');
			if(_.isEmpty(config.columns)) throw new Error('DEV::AdminFactory::You must have at least one column configured for the datagrid widget');
			//go on refine the datagrid columns
			if(options.type === 'table'){
				//1.4.0. sort columns according to index (TBI)
				
				//1.4.1.need a little [action, select_all] columns fix according to options.actions
				if(options.actions){
					//+Action Column
			        var actionsColumn = {
			        	    name: "_actions_",
				            label: "",
				            cell: "action",
				            filterable: false,
				            sortDisabled: true,
				            actions: []
			        };
			        config.columns.push(actionsColumn);
			        function pushActions(actionList){
						_.each(actionList, function(action){
							actionsColumn.actions.push({
								name: action,
								title: _.string.titleize(_.string.humanize(action))
							});
						});
			        };
					if(_.isObject(options.actions)){
						if(!options.actions.batch)
							pushActions(options.actions.list);
						else
							options.actions = options.actions.list; //convert it back to array
					}	        
					if(_.isArray(options.actions)){
						//+Select All Column
						config.columns.unshift({
				            name: "_selected_",
				            label: "",
				            cell: "select-row",
				            headerCell: "select-all",
				            filterable: false,
				            sortDisabled: true
				        });
				        pushActions(options.actions);
					}
				}
			}

			//2 build the admin module as a sub-module of app.Context.Admin
			var module = Admin.module(options.name);
			(function(module, config, forwaredOptions){
				//create the required data unit. see - special/registry/data-units.js
				var dataUnitOpt = (forwaredOptions.type === 'table')?{}:{modelOnly: true};
				app.DataUnits.init(forwaredOptions.name, dataUnitOpt);
				var	dataUnit =  app.DataUnits.get(forwaredOptions.name),
				//create the module skeleton
					module = _.extend(module, {
						name: forwaredOptions.name,
						type: forwaredOptions.type,
						defaultAdminPath: forwaredOptions.menuPath, //optional

						Model: dataUnit.Model,
						Collection: dataUnit.Collection, //can be undefined if of type table

						Widgets: {
							DataGrid: forwaredOptions.grid || app.Widget.get('DataGrid'), //can be undefined if of type complex
							Form: forwaredOptions.form || app.Widget.get('Form')
						},
						View: {
							Default: Backbone.Marionette.Layout
						}
					});

				//3 a little tidy up / pre config work here...bring the module to life.
				module.Model = module.Model.extend({validation: config.validation}); //+ validation to model
				module.Widgets.Form = module.Widgets.Form.extend({type:module.type, schema: config.schema}); //+ schema to form (note that we no longer apply this to model)
				if(module.type === 'table'){
					//table module
					module.collection = new module.Collection();
					module.Widgets.DataGrid = module.Widgets.DataGrid.extend({columns: config.columns, formWidget: module.Widgets.Form}); //+ columns, form to datagrid
				}else {
					//complex module
					module.model = new module.Model();
					delete module.Collection;
					delete module.Widgets.DataGrid;
				}
				module.View.Default = module.View.Default.extend({

					template: '#custom-tpl-layout-module-admin',
					className: 'custom-tpl-layout-wrapper module-admin-layout-wrap',
					regions: {
					    list: '.list-view-region',
					    detail: '.details-view-region'
					},

					initialize: function(options){
						options = options || {};
						this.model = options.model || new Backbone.Model({
							//the layout view info package (as a model to a view) see the admin layout template below.
							title: _.string.titleize(_.string.humanize(forwaredOptions.name + 'Manager')) 
						});
					},
					onShow: function(){
						if(module.type === 'table')
							this.list.show(new module.Widgets.DataGrid({
				                collection: module.collection,
				                parentCt: this
				            }));
						else 
							this.detail.show(new module.Widgets.Form({
								model: module.model
							}));
					},
					//this is for the datagrid widget to call from its _showForm method. so it won't have to know the layout of this parentCt view.
					showForm: function(form){
						this.detail.show(form);
					}

				});
				return module;
			})(module, config, options);
		},

	};

})(Application, _, Backbone);

/**
 * =======================================
 * The genaric layout tpl for data modules
 * =======================================
 */
Template.extend(
	'custom-tpl-layout-module-admin',
	[
		'{{#if title}}<div class="default-layout-header"><i class="icon-th-list"></i> <span class="default-layout-header-title">{{title}}</span></div>{{/if}}',
		'<div class="default-layout-body">',
            '<div class="list-view-region"></div>',
            '<div class="details-view-region"></div>',
		'</div>',
		'<div class="default-layout-footer"></div>',
	]
);