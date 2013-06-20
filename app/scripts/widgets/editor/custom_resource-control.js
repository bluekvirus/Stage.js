/**
 * 
 * Base Editor Example. [Modified]
 * Based on [https://github.com/powmedia/backbone-forms#custom-editors]
 *
 * @author Tim.Liu
 * @update 2013.04.18
 * 
 */
(function(){

    var ViewWrap = Backbone.Marionette.Layout.extend({
        template: '#custom-tpl-widget-editor-resource-control-wrap',
        className: 'custom-form-editor-resource-control',

        regions: {
            header: '.header',
            body: '.body',
            footer: '.footer'
        },

        // events: {

        // },

        initialize: function(options){
            this._options = options;
        },

        onRender: function(){
            this.body.show(new ResourcesView({model: new Resources()}));
        }
    });

    var Resources = Backbone.Model.extend({
        urlRoot: 'logic/Resources/list',
        parse: function(resp){
            return resp.payload;
        }
    });

    var ResourcesView = Backbone.Marionette.ItemView.extend({
        template: '#custom-tpl-widget-editor-resource-control-items',

        onShow: function(){
            this.model.fetch({
                success: _.bind(function(resp){
                    this.render();
                }, this)
            });
        }
    });


    Backbone.Form.editors['ResourceControl'] = Backbone.Form.editors.Base.extend({

        //tagName: 'input',

        events: {
            'change': function() {
                // The 'change' event should be triggered whenever something happens
                // that affects the result of `this.getValue()`.
                this.trigger('change', this);
            },
            'focus': function() {
                // The 'focus' event should be triggered whenever an input within
                // this editor becomes the `document.activeElement`.
                this.trigger('focus', this);
                // This call automatically sets `this.hasFocus` to `true`.
            },
            'blur': function() {
                // The 'blur' event should be triggered whenever an input within
                // this editor stops being the `document.activeElement`.
                this.trigger('blur', this);
                // This call automatically sets `this.hasFocus` to `false`.
            }
        },

        initialize: function(options) {
            // Call parent constructor
            Backbone.Form.editors.Base.prototype.initialize.call(this, options);

            // Custom setup code.
            //if (this.schema.customParam) this.doSomething();
        },

        render: function() {
            //this.setValue(this.value);

            this.delegatedEditor = new ViewWrap({form:this.form, editor:this});
            this.delegatedEditor.listenTo(this.form, 'close', this.delegatedEditor.close);
            this.$el.html(this.delegatedEditor.render().el);
        
            return this;
        },

        getValue: function() {
            //return this.$el.val();
        },

        setValue: function(value) {
            //this.$el.val(value);
        },

        focus: function() {
            if (this.hasFocus) return;

            // This method call should result in an input within this edior
            // becoming the `document.activeElement`.
            // This, in turn, should result in this editor's `focus` event
            // being triggered, setting `this.hasFocus` to `true`.
            // See above for more detail.
            this.$el.focus();
        },

        blur: function() {
            if (!this.hasFocus) return;

            this.$el.blur();
        }
    });
})();


Template.extend('custom-tpl-widget-editor-resource-control-wrap',[
    '<div class="header">',
        '<p class="alert alert-warning edit-later-info">Assign Privileges for this Role below...</p>',
    '</div>',
    '<div class="body"></div>',
    '<div class="footer"></div>'
]);

Template.extend('custom-tpl-widget-editor-resource-control-items', [
    '<div class="data-obj-list">',
        '{{#each models}}',
            '<div>{{name}}</div>',
        '{{/each}}',
    '</div>',
]);





