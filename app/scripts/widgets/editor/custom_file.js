/**
 * This is the File upload editor used with Backbone.Forms
 *
 * [Req: jQuery-file-upload.js]
 * 
 * @author Tim.Liu
 * @update 2013.04.01
 * 
 */
(function(){

    //editor UI::
    var FileEleView = Backbone.Marionette.ItemView.extend({
        template: '#custom-tpl-widget-editor-file-item'
    });
    var EditorView = Backbone.Marionette.CompositeView.extend({
        template: '#custom-tpl-widget-editor-file',
        itemView: FileEleView,
        itemViewContainer: 'tbody',
    });

    //editor tpl::
    Template.extend(
        'custom-tpl-widget-editor-file',
        [
            '<div class="file-editor-header row-fluid">',
            '<div class="span3"><input class="fileupload-field" type="file" name="files[]" data-url="{{meta.url}}" multiple></div>',
            '<div class="span9 fileupload-dropzone"></div>'
            '</div>',
            '<div class="file-editor-body">',
            '<table>',
                '<thead>',
                    '<tr>',
                        '<th>Name</th>',
                        '<th>Size</th>',
                        '<th>Action</th>',
                    '</tr>',
                '</thead>',
                '<tbody></tbody>',
            '</table>',
            '</div>',
            '<div class="file-editor-footer"></div>',
        ]
    );
    Template.extend(
        'custom-tpl-widget-editor-file-item',
        [
            '<tr>',
            '<td>{{name}}</td>',
            '<td>{{size}}</td>',
            '<td>{{#each actions}}<span class="action-trigger action-trigger-{{this.action}} label" action={{this.action}}>{{this.lable}}</span> {{/each}}</td>',
            '</tr>'
        ]
    );    

    //editor hook::
    Backbone.Form.editors['File'] = Backbone.Form.editors.Base.extend({

        tagName: 'input',

        className: 'custom-form-editor-file',

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
            if (this.schema.customParam) this.doSomething();
        },

        render: function() {
            //this.setValue(this.value);
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