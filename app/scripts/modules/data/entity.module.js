/**
 *
 * =====================
 * Module Definition
 * =====================
 * 
 * Generated through `def_models/entity.json` for Backbone module **Entity**
 *
 * 
 * Mother of All Models
 *
 *
 * **General Note**
 * A module has a Model a Collection (with pagination support) and a few View objects to render itself
 * on different occations. The most common ones are View.Form and View.DataGrid:
 *
 * View.Form - Used to render a form to create a new model object from user inputs. The fieldset tpl are
 * 			   there to help to override the default 'append' operation when adding field editors. tpl 
 * 			   names are the 'id' of <script type="text/tpl">...</script> tags. tpl should use 
 * 			   <tag target="fieldname">...</tag> to identify the placeholder for certain field editor.
 *
 * View.DataGrid - Used to render a grid widget for displaying records of this module. It will call 
 * 				   collection.fetch() to populate the grid data upon rendering.
 * 
 * 
 * @module Entity
 * @author Tim.Liu (zhiyuanliu@fortinet.com)
 * @updated 
 * 
 * @generated on Sun Mar 31 2013 16:54:02 GMT+0800 (CST) 
 * Contact Tim.Liu for generator related issue (zhiyuanliu@fortinet.com)
 * 
 */

(function(app) {
    /**
     * ================================
     * [*REQUIRED*] 
     * 
     * Module Name 
     * ================================
     */
    var module = app.module("Entity");


    /**
     * ================================
     * Module Data Sources
     * [Model/Collection]
     * ================================
     */

    /**
     *
     * **Model**
     * 
     * We use the original Backbone.Model
     * [Not Backbone.RelationalModel, since it offers more trouble than solved]
     * 
     * @class Application.Entity.Model
     */
    module.Model = Backbone.Model.extend({ //the id attribute to use
        idAttribute: '_id',

        //validation:
        validation: {
            name: {
                required: true,
                rangeLength: [1, 32]
            },
        },
        //form:
        schema: {
            name: {
                type: "Text",
                title: "Model"
            },
            author: {
                type: "Text"
            },
            description: {
                type: "TextArea"
            },
            type: {
                type: "Select",
                options: [{
                    val: "table",
                    label: "Table"
                }, {
                    val: "complex",
                    label: "Complex"
                }]
            },
            header: {
                type: "List",
                itemType: "Text"
            },
            serverApi: {
                type: "Text",
                title: "Server Data API"
            },
            autoAdminMenuPath: {
                type: "List",
                title: "Admin Menu Path",
                itemType: "Text"
            },
            fields: {
                type: "CUSTOM_GRID",
                moduleRef: "Field",
                mode: "subDoc"
            },
        },
        //backbone.model.save will use this to merge server response back to model.
        //this behaviour is not even optional...We really don't want the model to have
        //this pre-set behaviour...	
        parse: function(response) {
            if (response.payload) {
                if (_.isArray(response.payload)) return response.payload[0]; //to use mers on server.
                return response.payload;
            }
            return response;
        },
        initialize: function(data, options) {
            this.urlRoot = (options && (options.urlRoot || options.url)) || '' || '/api/Entity';
        }

    });


    /**
     *
     * **Collection**
     * 
     * Backbone.PageableCollection is a strict superset of Backbone.Collection
     * We instead use the Backbone.PageableCollection for better paginate ability.
     *
     * @class Application.Entity.Collection
     */
    module.Collection = Backbone.PageableCollection.extend({ //model ref
        model: module.Model,
        parse: function(response) {
            return response.payload; //to use mers on server.
        },
        //register sync event::
        initialize: function(data, options) { //support for Backbone.Relational - collectionOptions
            this.url = (options && options.url) || '' || '/api/Entity';
            this.on('error', function() {
                Application.error('Server Error', 'API::collection::Entity');
            })
        }

    });

    /**
     * **collection** 
     * An instance of Application.Entity.Collection
     * This collection is not nested in other models.
     * 
     * @type Application.Entity.Collection
     */
    module.collection = new module.Collection();


    /**
     * ================================
     * Module Views(+interactions)
     * [Widgets]
     * ================================
     */

    /**
     * Start defining the View objects. e.g,
     *
     * - Single Entry View - for list or grid.
     * - Multi/List View - just wrap around single entry view.
     * - Grid View - with controlls and columns.
     * - Form View - another single entry view but editable. [Generated]
     *
     * - Extension - all the extension/sub-class/sub-comp goes here.
     * 
     * @type {Backbone.View or Backbone.Marionette.ItemView/CollectionView/CompositeView}
     */
    module.View = {};
    module.View.Extension = {};

    /**
     *
     * **View.Form**
     * 
     * Backbone.Marionette.ItemView is used to wrap up the form view and 
     * related interactions. We do this in the onRender callback.
     *
     * @class Application.Entity.View.Form
     */
    module.View.Extension.Form = {};
    module.View.Extension.Form.ConditionalDisplay = function(formCt) {
        this.conditions = {
            header: function(f) {
                return f('type') === 'table';
            },
        };

        this.changeNotifyMap = {
            type: ["header"]
        };

        this.f = function(field) {
            if (formCt.form.fields[field].$el.css('display') !== 'none') return formCt.form.getValue(field);
            return undefined;
        };

        this.fin = function(field, values) {
            if (formCt.form.fields[field].$el.css('display') !== 'none') return _.contains(values, formCt.form.getValue(field));
            return undefined;
        };

        //1st round checking, when the form is first displayed.
        //[unconditional-fields] -> [level-1 conditional fields] -> [level 2]
        //till the number of fields to be checked is reduced to 0.
        this.initRound = function() {
            var queue = [],
                that = this;
            _.each(formCt.form.fields, function(f) {
                if (!that.conditions[f.key] && that.changeNotifyMap[f.key]) {
                    queue = _.union(queue, that.changeNotifyMap[f.key]);
                }
            });

            while (queue.length > 0) {
                var fName = queue.pop();
                this.check(fName);
                if (this.changeNotifyMap[fName]) queue = _.union(queue, this.changeNotifyMap[fName]);
            }

        };

        //see if this field can show itself.
        //Only those that appears in the changeNotifyMap will
        //get checked, so there is no this.conditions[f] === undefined
        //check...since it is not needed.
        this.check = function(fieldname) {
            if (this.conditions[fieldname](this.f)) formCt.form.fields[fieldname].$el.show();
            else formCt.form.fields[fieldname].$el.hide();
        };

    };

    module.View.Form = Backbone.Marionette.ItemView.extend({
        template: '#basic-form-view-wrap-tpl',


        className: 'basic-form-view-wrap',

        fieldsets: [
            ["name", "author", "description", "type", "header", "serverApi", "autoAdminMenuPath", "fields"]
        ],
        ui: {
            header: '.form-header-container',
            body: '.form-body-container',
            ctrlbar: '.form-control-bar',
        },
        initialize: function(options) { //This is usually a datagrid (view object).
            //We are delegating the create/update action to it.
            this.recordManager = options.recordManager;
            this.displayManager = new module.View.Extension.Form.ConditionalDisplay(this);
        },
        //Might create zombie views...let's see.
        onRender: function() {
            this.form = new Backbone.Form({
                model: this.model,
                fieldsets: this.fieldsets
            });
            var that = this;
            //Yes :(( it does, need to wire up the clean-ups.
            this.form.listenTo(this, 'close', function() {
                that.form.trigger('close'); //this is for the EditorLayouts (sub-grids, custom editors) to close off.
                that.form.remove();
            });
            this.ui.body.html(this.form.render().el);

            //bind the validators:
            Backbone.Validation.bind(this.form);

            //field show/hide according to pre-set conditions:
            this.displayManager.initRound();
        },
        events: {
            'click .btn[action="submit"]': 'submitForm',

            'click .btn[action="cancel"]': 'closeForm',

            'change': 'onFieldValueChange',
        },
        //event listeners:
        onFieldValueChange: function(e) { //using a loop-implemented recursive way to check affected fields.
            var queue = _.clone(this.displayManager.changeNotifyMap[e.target.name]);
            while (queue && queue.length > 0) {
                var fieldName = queue.pop();
                this.displayManager.check(fieldName);
                if (this.displayManager.changeNotifyMap[fieldName]) queue = queue.concat(this.displayManager.changeNotifyMap[fieldName]);
            }
        },
        submitForm: function(e) {
            e.stopPropagation();
            var error = this.form.validate();
            if (error) { //output error and scroll to first error field.
                console.log(error);
                for (var key in error) {
                    $('html').animate({
                        scrollTop: this.form.$el.find('.invalid[name=' + key + ']').offset().top - 30
                    }, 400);
                    break;
                }
            } else { //delegating the save/upate action to the recordManager.
                this.model.set(this.form.getValue());
                this.recordManager.$el.trigger('event_SaveRecord', this);

            }
        },
        closeForm: function(e) {
            e.stopPropagation();
            this.close();
            this.recordManager.$el.trigger('event_RefreshRecords');
        }



    });



    /**
     *
     * **View.DataGrid**
     * 
     * Backbone.Marionette.ItemView is used to wrap up the datagrid view and 
     * related interactions. We do this in the onRender callback.
     *
     * @class Application.Entity.View.DataGrid
     */
    module.View.Extension.DataGrid = {};
    module.View.Extension.DataGrid.ActionCell = Backbone.Marionette.ItemView.extend({
        tagName: 'td',
        className: 'action-cell',
        template: '#custom-tpl-grid-actioncell',
        initialize: function(options) {
            this.column = options.column;
        },
        //patch-in the id property for action locator.
        onRender: function() {
            this.$el.find('span[action]').attr('target', this.model.id || this.model.cid);
        }
    });

    module.View.DataGrid = Backbone.Marionette.ItemView.extend({
        template: '#basic-datagrid-view-wrap-tpl',

        className: 'basic-datagrid-view-wrap',

        ui: {
            header: '.datagrid-header-container',
            body: '.datagrid-body-container',
            footer: '.datagrid-footer-container'
        },
        //remember the parent layout. So later on a 'new' or 'modify'
        //event will have a container region to render the form.
        initialize: function(options) {
            this.columns = [{
                name: "_selected_",
                label: "",
                sortable: false,
                cell: "boolean"
            }, {
                name: "name",
                label: "Model",
                cell: "string"
            }, {
                name: "type",
                label: "Type",
                cell: "string"
            }, {
                name: "_actions_",
                label: "",
                sortable: false,
                cell: module.View.Extension.DataGrid.ActionCell
            }];
            this.mode = options.mode;
            this.parentCt = options.layout;
            this.editable = options.editable;
            var that = this;
            _.each(this.columns, function(col) {
                col.editable = that.editable;
            });

        },
        //Add a backgrid.js grid into the body 
        onRender: function() {
            this.grid = new Backgrid.Grid({
                columns: this.columns,
                collection: this.collection
            });

            this.ui.body.html(this.grid.render().el);
            //if it is not in subDoc mode, we let the collection to fetch data itself.
            if (this.mode !== 'subDoc') this.collection.fetch();

            //Do **NOT** register any event listeners here.
            //It might get registered again and again. 
        },
        //Clean up zombie views.
        onBeforeClose: function() {
            this.grid.remove();
        },
        //datagrid actions DOM-events.
        events: {
            'click .btn[action=new]': 'showForm',
            'click .action-cell span[action=edit]': 'showForm',
            'click .action-cell span[action=delete]': 'deleteRecord',
            'event_SaveRecord': 'saveRecord',
            'event_RefreshRecords': 'refreshRecords',
        },
        //DOM event listeners:
        showForm: function(e) {
            e.stopPropagation();
            var info = e.currentTarget.attributes;

            if (info['target']) { //edit mode.
                var m = this.collection.get(info['target'].value);
            } else //create mode.
            var m = new module.Model({}, {
                url: this.collection.url
            });

            this.parentCt.detail.show(new module.View.Form({
                model: m,
                recordManager: this
            }));
        },
        saveRecord: function(e, sheet) {
            e.stopPropagation();
            //1.if this grid is used as top-level record holder:
            var that = this;
            if (this.mode !== 'subDoc') {
                sheet.model.save({}, {
                    error: function(model, res) {
                        var err = $.parseJSON(res.responseText).error;
                        console.log('!Possible Hack!', err);
                        if (err.db) { //server db error::
                            Application.error('Server DB Error', err.db);
                        }
                        //[optional]TODO::highlight error back to form fields
                    },
                    success: function(model, res) {
                        if (res.payload) {
                            that.collection.fetch();
                            sheet.close();
                        } else Application.error('Server Error', 'Not yet saved...');
                    }
                }); //save the model to server
            } else { //2.else if this grid is used in subDoc mode for sub-field:
                //add or update the model into the referenced collection:
                this.collection.add(sheet.model, {
                    merge: true
                });
                sheet.close();
            }
        },
        deleteRecord: function(e) {
            e.stopPropagation();
            var info = e.currentTarget.attributes;
            //find target and ask user
            var m = this.collection.get(info['target'].value);
            //promp user [TBI]
            var that = this;
            Application.prompt('Are you sure?', 'error', function() {
                if (!that.parentCt.collectionRef) m.destroy({
                    success: function(model, resp) {
                        that.collection.fetch(); //refresh
                    },
                    error: function(model, resp) {
                        Application.error('Server Error', 'Can NOT remove this record...');
                    }
                });
                else that.collection.remove(m);
            })
        },
        refreshRecords: function(e) {
            e.stopPropagation();
            if (!this.parentCt.collectionRef) this.collection.fetch();
        }

    });

    /**
     * ================================
     * [*REQUIRED*]
     *  
     * Module Layout
     * Opt.[+interactions] 
     * ================================
     */

    /**
     * **View.AdminLayout**
     *
     * Basic Backbone.Marionette.Layout (basically an ItemView with region markers.) to
     * show a datagrid and a form/property grid stacked vertically. This view is mainly
     * there to respond to user's admin menu selection event.
     *
     * @class Application.Entity.View.AdminLayout
     */
    module.View.AdminLayout = Backbone.Marionette.Layout.extend({
        template: '#custom-tpl-layout-module-admin',

        className: 'custom-tpl-layout-wrapper module-admin-layout-wrap',

        regions: {
            list: '.list-view-region',
            detail: '.details-view-region'
        },
        //Metadata for layout tpl. e.g. meta.title
        meta: {
            title: 'Entity Manager'
        },
        initialize: function(options) {
            if (!options || !options.model) this.model = new Backbone.Model({
                meta: this.meta
            });
        },
        onRender: function() {
            this.list.show(new module.View.DataGrid({
                collection: module.collection,
                layout: this,
                editable: false //in-place edit default off.
            }));
        }
    });


    /**
     * **View.EditorLayout**
     *
     * This is similar to AdminLayout but only using a different tpl to make datagrid
     * and form slide together thus fit into a parent form.
     *
     * @class Application.Entity.View.EditorLayout
     */
    module.View.EditorLayout = Backbone.Marionette.Layout.extend({
        template: '#custom-tpl-layout-module-admin',

        className: 'module-editor-layout-wrap',

        regions: {
            list: '.list-view-region',
            detail: '.details-view-region'
        },
        initialize: function(options) { //This is also used as a flag by datagrid to check if it is working in 'editor-mode'
            this.collectionRef = new module.Collection(options.data, {
                url: options.apiUrl
            });

            this.datagridMode = options.datagridMode;
        },
        onRender: function() {
            this.list.show(new module.View.DataGrid({
                collection: this.collectionRef,
                layout: this,
                mode: this.datagridMode,
                editable: false,
                //in-place edit default off.
            }));
        }
    });




    /**
     * ================================
     * [*REQUIRED*] 
     * 
     * Module's default menu view
     * (Points to a layout view above)
     * ================================
     */

    /**
     * **View.Default**
     * 
     * The default view used with menu.
     * 
     * @class Application.Entity.View.Default
     */
    module.View.Default = module.View.AdminLayout;


    /**
     * ================================
     * Admin Menu Auto-load Path
     * 
     * Parents node of a non-existing path
     * will be created in menu module]
     * ================================
     */
    module.defaultAdminPath = 'Development->Generator';



})(Application);


/**
 * ==========================================
 * Module Specific Tpl
 * [Generic tpls go to templates/generic/...]
 * ==========================================
 * e.g. Template.extend('id', ['<div>', '...', </div>]);
 */