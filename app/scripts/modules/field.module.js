/**
 * Generated through `models/field.json` for Backbone module **Field**
 *
 * 
 * 
 *
 * 
 * @module Field
 * @author Tim.Liu
 * @updated 
 * 
 * @generated on Mon Mar 04 2013 01:00:29 GMT+0800 (CST) 
 * Contact Tim.Liu for generator related issue (zhiyuanliu@fortinet.com)
 * 
 */

(function(app) {

    var module = app.module("Field");

    /**
     *
     * **Model**
     * 
     * We use Backbone.RelationalModel instead of the original Backbone.Model
     * for better has-many relation management.
     * 
     * @class Application.Field.Model
     */
    module.Model = Backbone.RelationalModel.extend({

        //url
        urlRoot: '/api/Field',
        //the id attribute to use
        idAttribute: '_id',

        //relations:
        relations: [],

        //validation:
        validation: {

            name: {
                required: true,
                rangeLength: [1, 32]
            },

            label: {
                required: false,
                rangeLength: [1, 32]
            },

        },

        //form:
        schema: {

            name: {
                type: "Text",
                title: "Field Name"
            },

            label: {
                type: "Text"
            },

            type: {
                type: "Select",
                options: ["String", "Number", "Date", "Buffer", "Boolean", "Mixed", "ObjectId", "Array"]
            },

            condition: {
                type: "List",
                title: "Only Shown When",
                itemType: "Text"
            },

            editor: {
                type: "Select",
                options: ["Text", "Number", "Password", "TextArea", "Checkbox", "Checkboxes", "Hidden", "Select", "Radio", "Object", "NestedModel", "Date", "DateTime", "List", "CUSTOM_GRID", "CUSTOM_PICKER", "File"]
            },

            editorOpt: {
                type: "List",
                itemType: "TextArea"
            },

        }

    });


    /**
     *
     * **Collection**
     * 
     * Backbone.PageableCollection is a strict superset of Backbone.Collection
     * We instead use the Backbone.PageableCollection for better paginate ability.
     *
     * @class Application.Field.Collection
     */
    module.Collection = Backbone.PageableCollection.extend({

        //model ref
        model: module.Model,
        url: '/api/Field'

    });


    /**
     * Start defining the View objects. e.g,
     *
     * - Single Entry View - for list or grid.
     * - Multi/List View - just wrap around single entry view.
     * - Grid View - with controlls and columns.
     * - Form View - another single entry view but editable. [Generated]
     * 
     * @type {Backbone.View or Backbone.Marionette.ItemView/CollectionView/CompositeView}
     */
    module.View = {};

    /**
     *
     * **View.Form**
     * 
     * Backbone.Marionette.ItemView is used to wrap up the form view and 
     * related interactions. We do this in the onRender callback.
     *
     * @class Application.Field.View.Form
     */
    module.View.Form = Backbone.Marionette.ItemView.extend({

        template: '#basic-form-view-wrap-tpl',

        ui: {
            header: '.form-header-container',
            body: '.form-body-container',
            ctrlbar: '.form-control-bar',
        },

        //Might create zombie views...let's see.
        onRender: function() {
            this.form = new Backbone.Form({
                model: this.model
            });
            this.ui.body.html(this.form.render().el);

            //bind the validators:
            Backbone.Validation.bind(this.form);
        },

        events: {
            'click button[action="submit"]': 'submitForm',
        },

        //event listeners:
        submitForm: function(e) {
            var error = this.form.validate();
            if (error) {
                console.log(error);
            } else {
                this.model.save(this.form.getValue(), {
                    error: function(model, res) {
                        var err = $.parseJSON(res.responseText).error;
                        console.log('!Possible Hack!', err);
                        //[optional]TODO::highlight error back to form fields
                    },

                }); //save the model to server
            }
        }


    });


})(Application);