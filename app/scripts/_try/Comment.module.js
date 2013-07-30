/**
 *
 * =====================
 * Module Definition
 * =====================
 * 
 * Generated through `D:\wamp\www\dup_Server_-0.9\temp\module-1374480045862-def.json` for Backbone module **Comment**
 *
 * 
 * Comments data module
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
 * @module Comment
 * @author Tim.Liu
 * @updated 
 * 
 * @generated on Mon Jul 22 2013 16:00:46 GMT+0800 (中国标准时间) 
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
    var module = app.module("Comment");


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
     * @class Application.Comment.Model
     */
    module.Model = Backbone.Model.extend({ //the id attribute to use
        idAttribute: '' || '_id',

        //validation:
        validation: {},
        //form:
        schema: {
            title: {
                type: "Text"
            },
            body: {
                type: "TextArea",
                title: "Content"
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
            this.urlRoot = (options && (options.urlRoot || options.url)) || '' || ((app.config.apiBase && app.config.apiBase.data) || '/data') + '/Comment';
        }

    });


    /**
     *
     * **Collection**
     * 
     * Backbone.PageableCollection is a strict superset of Backbone.Collection
     * We instead use the Backbone.PageableCollection for better paginate ability.
     *
     * @class Application.Comment.Collection
     */
    module.Collection = Backbone.PageableCollection.extend({
        model: module.Model,
        parse: function(response) {
            return response.payload; //to use mers on server.
        },
        initialize: function(data, options) {
            this.url = (options && options.url) || '' || ((app.config.apiBase && app.config.apiBase.data) || '/data') + '/Comment';
            this.on('error', function() {
                Application.error('Server Error', 'Can NOT initialize collection:Comment');
            })
        }

    });

    /**
     * **collection** 
     * An instance of Application.Comment.Collection
     * This collection is not nested in other models.
     * 
     * @type Application.Comment.Collection
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
     * @class Application.Comment.View.Form
     */
    module.View.Extension.Form = {};
    module.View.Extension.Form.ConditionalDisplay = function(formCt) {
        this.conditions = {};

        this.changeNotifyMap = {};

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
            ["title", "body"]
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
            this.form = new Backbone.Form({
                model: this.model,
                fieldsets: this.fieldsets
            });
            this.form.formCt = this; //for accepting field editor notifications
            var that = this;
            //Yes :(( it does, need to wire up the clean-ups.
            this.form.listenTo(this, 'close', function() {
                that.form.trigger('close'); //this is for the EditorLayouts (sub-grids, custom editors) to close off.
                that.form.remove();
            });
        },
        //Might create zombie views...let's see.
        onRender: function() {
            this.ui.body.html(this.form.render().el);

            //disable 'editOnce' type of editor
            _.each(this.form.fields, function(f) {
                if (f.schema.editOnce && f.editor.getValue()) {
                    f.editor.$el.prop('disabled', 'disabled');
                }
            });

            //bind the validators:
            Backbone.Validation.bind(this.form);

            //field show/hide according to pre-set conditions:
            this.displayManager.initRound();
        },
        //Empty Stub. override in extension
        onRenderPlus: function() {},
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
            //this.recordManager.$el.trigger('event_RefreshRecords');
        }



    });



    /**
     *
     * **View.DataGrid**
     * 
     * Backbone.Marionette.ItemView is used to wrap up the datagrid view and 
     * related interactions. We do this in the onRender callback.
     *
     * @class Application.Comment.View.DataGrid
     */
    module.View.Extension.DataGrid = {};

    module.View.DataGrid = app.Widget.DataGrid.extend({

        columns: [{
            name: "_selected_",
            label: "",
            sortable: false,
            cell: "boolean"
        }, {
            name: "title",
            label: "Title",
            cell: "string"
        }, {
            name: "body",
            label: "Content",
            cell: "string"
        }, {
            name: "_actions_",
            label: "",
            sortable: false,
            cell: "action",
            actions: [
                {name: "edit", title: "Edit"},
                {name: "delete", title: "Delete"},
                {name: "detail", title: "Details"}
            ]
        }]
        
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
     * @class Application.Comment.View.AdminLayout
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
            title: 'Comment Manager'
        },
        initialize: function(options) {
            if (!options || !options.model) this.model = new Backbone.Model({
                meta: this.meta
            });
        },
        onRender: function() {
            var dataGridView = new module.View.DataGrid({
                collection: module.collection,
                parentCt: this,
                formWidget: module.View.Form
            });
            this.list.show(dataGridView);
        }
    });


    /**
     * **View.EditorLayout**
     *
     * This is similar to AdminLayout but only using a different tpl to make datagrid
     * and form slide together thus fit into a parent form.
     *
     * @class Application.Comment.View.EditorLayout
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
                url: options.apiUrl,
                mode: options.datagridMode === 'subDoc'?'client' : 'server'
            });

            this.datagridMode = options.datagridMode;
        },
        onRender: function() {
            var dataGridView = new module.View.DataGrid({
                collection: this.collectionRef,
                parentCt: this,
                formWidget: module.View.Form,
                mode: this.datagridMode
            });
            this.list.show(dataGridView);
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
     * @class Application.Comment.View.Default
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
    module.defaultAdminPath = 'Content Manager->Comments';



})(Application);


/**
 * ==========================================
 * Module Specific Tpl
 * [Generic tpls go to templates/generic/...]
 * ==========================================
 * e.g. Template.extend('id', ['<div>', '...', </div>]);
 */
