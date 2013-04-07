/**
 * This is the multi-selector editor 'Double-Picker'
 *
 * It needs a 'src' option to get the available selections and a 'namespace'
 * to distinguish from other 'Drag-n-Drop' zones.
 *
 * 'src' can be of 3 types: (it talks to a data manager to resolve the src resource)
 * 1. data url; ['/api/Abc']
 * 2. module name; ['Abc']
 * 3. fieldname; ['fff'] which indicates a field on the same form. (without data-refreshing)
 *
 * After fetching data from the 'src', it will need to be filtered with what's already selected.
 * Only to highlight what's still available.
 *
 * Utilizing the 'Sortable' jQuery-UI interaction helper.
 *
 * @author Tim.Liu
 * @update 2013.04.07
 * 
 */
(function(){

    var DataEleView = Backbone.Marionette.ItemView.extend({
        template: '#custom-tpl-widget-editor-double-picker-item',
        tagName: 'li'
    });

    var DataListView = Backbone.Marionette.CollectionView.extend({
        itemView: DataEleView,
        tagName: 'ul'
    });

    var EditorView = Backbone.Marionette.Layout.extend({
        template: '#custom-tpl-widget-editor-double-picker',

        regions: {
            header: '.double-picker-header',
            footer: '.double-picker-footer',
            src: '.src-dnd-zone',
            target: '.target-dnd-zone'
        },

        initialize: function(options){
            //1. fetch from options.src - passed from editorOpt: dataSrc
            //2. store options.selectedValue - passed from Form editor this.value
            //3. filter
        },

        onRender: function(){
            //1.render src collection view,
            //2.render target collection view,
            //3.activate dnd with name space (only make both collection draggable within [target collection] ns)
        },

        reloadSrc: function(){
            //ToDo::
        },

        getValue: function(){
            //ToDo::
        }
    });


    Template.extend(
        'custom-tpl-widget-editor-double-picker-item',
        [
            '<span>{{this}}</span>'
        ]
    );

    Template.extend(
        'custom-tpl-widget-editor-double-picker',
        [
            '<div class="double-picker-header"></div>',
            '<div class="double-picker-body row-fluid">',
                '<div class="src-dnd-zone dnd-zone span4 well"></div>',
                '<div class="target-dnd-zone target-dnd-zone-{{meta.ns}} dnd-zone span4 well"></div>',
            '</div>',
            '<div class="double-picker-footer"></div>',
        ]
    );


    Backbone.Form.editors['CUSTOM_PICKER'] = Backbone.Form.editors.Base.extend({

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
            this._options = options.schema.options || options.schema;
        },

        render: function() {
            //this.setValue(this.value);
            this.delegatedEditor = new EditorView({
                    selectedVal: this.value,
                    src: this._options.dataSrc,
                    model: new Backbone.Model({
                        meta: {
                            ns: this._options.dndNS
                        }
                    })
            });
            this.delegatedEditor.listenTo(this.form, 'close', this.delegatedEditor.close);
            this.$el.html(this.delegatedEditor.render().el);
        
            return this;
        },

        getValue: function() {
            //return this.$el.val();
            return this.delegatedEditor.getValue();
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