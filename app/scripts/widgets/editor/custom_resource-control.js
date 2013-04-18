/**
 * 
 * This is the Resource Control Editor used for User privilege 
 * assignment. It is used in the Role entity and the same concept
 * can be used for any resource control mech. 
 *
 * Concept: (type here is not the mapping type, but a meta describing resource type)
 * register>> 
 *     Resource <- Signatures <- Mappings
 * assign>>
 *     Role <- (Resource.(type).Mappings) <- Signatures (yes/no)
 * resolve>>
 *     (req.path) -> (/:type/:Resource/...) -> User.Role.Privileges[Resource.(type).Mappings]
 *
 * For performance reason it is better to re-group the Mappings inside a Resource
 * to be grouped with types e.g /:type/:Resource when saved in a Role. Specifically,
 * 
 *     mapping.split('/') =>   [0]: should always be "";
 *                             [1]: type;
 *                             [2]: Resource name; [null] means "Index Page";
 *
 * Note:: We still use the full mappings(+mapping type) when try to match with req.path
 * in authorization middleware.
 *                             
 *
 * @author Tim.Liu
 * @created 2013.04.18
 * 
 */
(function(){

    var ResourceItem = Backbone.Marionette.ItemView.extend({
        template: '#custom-tpl-widget-editor-resource-item',
        className: 'custom-form-editor-resource-control-item',

    });

    var ViewWrap = Backbone.Marionette.CompositeView.extend({
        template: '#custom-tpl-widget-editor-resource-control-wrap',
        className: 'custom-form-editor-resource-control',
        itemView: ResourceItem,
        itemViewContainer: '.body',

        ui: {
            header: '.header',
            body: '.body',
            footer: '.footer'
        },

        events: {

        },

        initialize: function(options){
            this._options = options;
            Application.DataCenter.resolve('Resource', this._options.form, function(data){
                this.collection = new Backbone.Collection(data);
            });
        }

        onRender: function(){
            //TODO::
        }
    });

    Template.extend('custom-tpl-widget-editor-resource-item', [
        '<div>',
            '{{name}}',
            ' {{#each signatures}}',
                '{{this.name}} ',
            '{{/each}}',
        '</div>'
    ]);

    Template.extend('custom-tpl-widget-editor-resource-control-wrap',[
        '<div class="header"></div>',
        '<div class="body"></div>',
        '<div class="footer"></div>'
    ]);


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
