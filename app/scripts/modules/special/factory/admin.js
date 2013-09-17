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
 * created module will appear in app.Admin.[...name...]
 * 
 * ===================
 * Config/Init Options
 * ===================
 * To create a data admin module, we need:
 * {
 * 		name: (*) - required, this name will be used to obtain Model/Collection definitions from the DataUnits module (see data-units.js)
 * 		type: table | complex - default on table
 * 		menuPath: default admin menu path. e.g. 'Content Manager->Blogs->...->...', optional
 * 		fields: {
 * 			f-name: {
 * 				//validations
 * 					validation: see lib Backbone.Validations
 * 				//form
 * 					title: label 
 * 					tooltip/description: hover 2s tooltip
 * 					editor: '[editor name]' as defined in form editors(widgets) or 'null', default on text input, use ReadOnly(//TBI) or Hidden if needs be...
 * 					editorOpt: options used when init the editor widget.
 * 					fieldset: a group name. Fieldset can help regroup some of the fields and apply a custom tpl to the set.
 * 					conditions: upon each 'change' event fired by the form, this function will be checked to see if this field should still be visible.
 * 								(note that a Hidden field is considered to be visible all the time)
 * 				//grid
					column: {
						label: default on field title
						cell: default on "string"
						headerCell: 
						filterable: searchable through jquery.sieve
						sortDisabled: apply local sort through table sorter
						index: re-arrange column order?
						...
					} - see datagrid widget and lib Backgrid.js
 * 			},
 * 			...
 * 		},
 * 		grid: ...a copy of widget definition (.extend({}))... see the Widgets Registry module [modules/special/registry/widgets.js]
 * 		actions: [edit, delete] (default) or none (which will remove both select_all and action columns) or {
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

;(function(app, _){

	var Factory = app.Factory || app.module('Factory');
	var Admin = app.Admin || app.module('Admin');

	Factory.AdminModule = {

		get: function(name){
			return Admin[name];
		},

		create: function(options){
			options = options || {};
			//apply defaults:
			options = _.defaults(options, {type: 'table'});
			if(!options.name) return;

			//prepare options from passed in config to the module components
			//validations, form schema, and grid columns
			var config = {
				validation: {}, schema: {}, columns: []
			}
			_.each(options.fields, function(f, fname){
				//1. extract validation for backbone-validations
				if(f.validation) config.validation[fname] = f.validation;
				//2. extract form schema (WARNING::note that currently we use the format defined by backbone-forms.js)
				f.title = f.title || _.string.titleize(fname);
				config.schema[fname] = _.extend(_.omit(f, 'validation', 'column', 'editorOpt'), f.editorOpt);
				//3. extract datagrid columns
				if(f.column) config.columns.push = _.extend({name: fname, label: f.title, cell: 'string'}, f.column);
			});
			if(options.type === 'table'){
				//0. sort columns according to index (TBI)
				
				//1.need a little [action, select_all] columns fix according to options.actions
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
							actionsColumn.push({
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

			//build the admin module
			Admin[name] = (function(){

				var dataUnit = app.DataUnits.get(options.name);
				var module = {
					name: options.name,
					type: options.type,
					defaultAdminPath: options.menuPath, //optional

					Model: dataUnit.Model,
					Collection: dataUnit.Collection, //can be undefined if of type table

					Widgets: {
						DataGrid: options.grid || app.Widget.get('DataGrid'), //can be undefined if of type complex
						Form: options.form || app.Widget.get('Form')
					},

					View: {
						Default: Backbone.Marionette.Layout.extend({
							template: '#custom-tpl-layout-module-admin',
							className: 'custom-tpl-layout-wrapper module-admin-layout-wrap',

							regions: {
							    list: '.list-view-region',
							    detail: '.details-view-region'
							},

							initialize: function(options){
								options = options || {};
								this.model = options.model || new Backbone.Model({
									meta: { //the layout view info package (as a model to a view) see the admin layout template below.
										title: _.string.titleize(_.string.humanize(options.name))
									}
								});
							},
							onShow: function(){
								//TBI
							}
						})
					}
				};

				//a little tidy up / pre config work here...
				module.Model = module.Model.extend({validation: config.validation}); //+ validation to model
				module.Widgets.Form = module.Widgets.Form.extend({type:module.type, schema: config.schema}); //+ schema to form (note that we no longer apply this to model)
				if(module.type === 'table'){
					module.Widgets.DataGrid = module.Widgets.DataGrid.extend({columns: config.columns, formWidget: module.Widgets.Form}); //+ columns to datagrid
				}else {
					delete module.Collection;
					delete module.Widgets.DataGrid;
				}

				return module;

			})();
		},

	};

})(Application, _);

/**
 * =======================================
 * The genaric layout tpl for data modules
 * =======================================
 */
Template.extend(
	'custom-tpl-layout-module-admin',
	[
		'{{#if meta.title}}<div class="default-layout-header"><i class="icon-tasks"></i> <span class="default-layout-header-title">{{meta.title}}</span></div>{{/if}}',
		'<div class="default-layout-body">',
            '<div class="list-view-region"></div>',
            '<div class="details-view-region"></div>',
		'</div>',
		'<div class="default-layout-footer"></div>',
	]
);