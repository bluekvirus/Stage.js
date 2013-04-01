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
        template: '#custom-tpl-widget-editor-file-item',
        tagName: 'tr'
    });
    var EditorView = Backbone.Marionette.CompositeView.extend({
        template: '#custom-tpl-widget-editor-file',
        className: 'custom-form-editor-file',
        itemView: FileEleView,
        itemViewContainer: 'tbody',

        ui: {
            uploader: '.fileupload-field',
            dropzone: '.fileupload-dropzone',
            progress: '.fileupload-progress',
            progressbar: '.fileupload-progress-bar',
            progressfileQ: '.fileupload-progress-fileQ',
            filelist: '.file-editor-body'
        },

        onRender: function(){
            this.ui.uploader.fileupload({
                dropzone: this.ui.dropzone
            });

            if(this.collection.length > 0){
                this.ui.filelist.show();
            }else {
                this.ui.filelist.hide();
            }
        }
    });

    //editor tpl::
    Template.extend(
        'custom-tpl-widget-editor-file',
        [
            '<div class="file-editor-header row-fluid">',
            '<div class="span3"><div class="fileinput-button btn btn-block">Choose File<input class="fileupload-field" type="file" name="files[]" data-url="{{meta.url}}" multiple></div></div>',
            '<div class="span9 fileupload-dropzone"><p class="alert alert-info">Or...drop you file here...</p></div>',
                '<div class="fileupload-progress">',
                    '<p class="fileupload-progress-bar"></p>',
                    '<div class="fileupload-progress-fileQ"></div>',
                '</div>',
            '</div>',
            '<div class="file-editor-body">',
                '<table class="table">',
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
            '<td>{{name}}</td>',
            '<td>{{size}}</td>',
            '<td>{{#each actions}}<span class="action-trigger action-trigger-{{this.action}} label" action={{this.action}}>{{this.lable}}</span> {{/each}}</td>'
        ]
    );    

    //editor hook::
    Backbone.Form.editors['File'] = Backbone.Form.editors.Base.extend({

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
            // this.schema.options
            this._options = options.schema.options || {};
        },

        render: function() {
            this.delegatedEditor = new EditorView({
                model: new Backbone.Model({
                    meta:{
                        url:this._options.url || '/api/uploads'
                    }
                }),
                collection: new Backbone.Collection({url:this._options.url})
            });
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