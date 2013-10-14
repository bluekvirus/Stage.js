/**
 * This is the File upload editor used with Backbone.Forms
 *
 * [Req: jQuery-file-upload.js]
 *
 * @author Tim.Liu
 * @update 2013.04.01
 *
 */
(function() {

    //editor UI::
    var FileEleView = Backbone.Marionette.ItemView.extend({
        template: '#custom-tpl-widget-editor-file-item',
        tagName: 'tr',
        initialize: function(options) {

            //Add your file item actions here:
            //Write the aciton listeners down below in the EditorView._actions
            _.extend(this.model.attributes, {
                actions: [
                    {
                        action: 'delete',
                        label: 'Delete',
                        labelCls: 'important',
                        method: 'DELETE', //http method type used for this action
                        url: this.model.get('deleteUrl')
                    },

                ]
            });
        }
    });
    
    var FileProgressEleView = Backbone.Marionette.ItemView.extend({
        template: '#custom-tpl-widget-editor-file-progress-item',
        initialize: function(options){
            this.model = new Backbone.Model(options.fileinfo);
            this.handle = options.handle; //for cancelling the job using .abort;
        },

        events: {
            'click [action=cancel-job]': 'cancelUpload',
        },

        cancelUpload: function(e){
            e.stopPropagation();
            this.handle.abort();
        }
    });

    var EditorView = Backbone.Marionette.CompositeView.extend({
        template: '#custom-tpl-widget-editor-file',
        className: 'custom-form-editor-file custom-editor-wrap',
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

        events: {
            'click .action-trigger': '_runAction'
        },

        _runAction: function(e) {
            e.stopPropagation();
            var action = e.target.attributes.action.value;
            if (this._actions[action]) this._actions[action]({
                url: e.target.attributes._url.value,
                type: e.target.attributes._method.value, //http method type used for this action
            }, this);
        },

        _actions: {
            'delete': function(info, editor) {
                $.ajax({
                    url: info.url,
                    notify: true,
                    type: info.type, //http method type used for this action
                    success: function() {
                        editor.collection.fetch();
                    },
                    error: function(err) {
                        Application.error('File Deletion Error', err);
                    }
                });
            },
        },

        initialize: function(options) {
            this.listenTo(this.collection, 'sync', function() {
                if (this.collection.length === 0) this.ui.filelist.hide();
                else this.ui.filelist.show();
            });

            this.form = options.form;
            this.editorCt = options.editor;
        },

        onRender: function() {
            var that = this;
            this.ui.progress.hide();
            this.ui.uploader.fileupload({
                dropzone: this.ui.dropzone,
                dataType: 'json',
                //success
                // done: function(e, data) {
                //     //single file done... see - progressall
                // },
                add: function(e, data) {
                    //[ASSUMPTION] single file upload at a time...
                    var f = data.files[0];
                    //start uploading
                    var jobHandle = data.submit().always(function(){
                        fItemView.close(); //lazy eval                        
                    });
                    //+ to progressfileQ
                    var fItemView = new FileProgressEleView({fileinfo:f, handle:jobHandle});
                    that.ui.progressfileQ.append(fItemView.render().el);
                },
                start: function(e, data) {
                    //all files
                    that.ui.progressbar.width(0);
                    that.ui.progress.show();
                },
                success: function(e, data) {
                    //single file
                    //moved into progressall for notification of 'all done';
                    //this is to counter the delay in the ui progress update.
                },
                fail: function(e, data) {
                    //single file
                    Application.error('File Upload Failed', data.errorThrown);
                },
                // stop: function(e, data) {
                //     that.ui.progress.hide(); //since this one is called after success and fail.
                // },                                
                progressInterval: 250,
                progressall: function(e, data){
                    //TBI upload bit rate display
                    var progress = parseInt(data.loaded / data.total * 100, 10);
                    that.ui.progressbar.width(progress + '%');
                    if(progress === 100){
                        Application.success('File Uploaded', function(){
                            if(that.form.formCt)//notify the backbone-forms' wrapper view (View.Form)
                                that.form.formCt.$el.trigger('notify', {
                                    field: that.editorCt.key,
                                    type: 'success', //'error', 'success', 'complete', 'abort'
                                });
                        });
                        that.ui.progress.hide();                        
                        that.collection.fetch();
                    }
                }
            });
            this.collection.fetch();
        },
    });


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
            this._options = options.schema.options || options.schema;
            this._options.url = this._options.url || ((Application.config.apiBase && Application.config.apiBase.file && Application.config.apiBase.file.up) || '/upload')+'/' + this._options.hostName + '/' + (this._options.hostType === 'table' ? this.model.id : 'shared') + '/' + this.key;
            this.FileCollection = Backbone.Collection.extend({
                url: this._options.url + '?listing=' + (new Date()).getTime(),
                model: Backbone.Model.extend({
                    defaults: {
                        _options: this._options
                    }
                }),
                parse: function(res){
                    return res.files; //Warning:: this is the collection that accepts the server returned file descriptions. Update this if jquery-file-upload-middleware changes the file listing reply.
                }
            });
        },

        render: function() {
            if (this._options.hostType === 'table' && !this.model.id) {
                //new table record...
                this.$el.html('<div class="alert alert-info edit-later-info">Create your record before uploading file(s) to it.</div>');
            } else {
                this.delegatedEditor = new EditorView({
                    model: new Backbone.Model({
                        meta: {
                            url: this._options.url,
                            noActions: this._options.noActions,
                        }
                    }),
                    collection: new this.FileCollection(),
                    form: this.form,
                    editor: this,
                });
                this.delegatedEditor.listenTo(this.form, 'close', this.delegatedEditor.close);
                this.$el.html(this.delegatedEditor.render().el);
            }

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

/**
 * =====================
 * Templates and Helpers
 * =====================
 */
Template.extend(
    'custom-tpl-widget-editor-file', 
    [
    '<div class="file-editor-header row-fluid">',
        '<div class="span2">',
            '<div class="fileinput-button btn btn-block">',
                '<i class="icon-upload"></i> File',
                '<input class="fileupload-field" type="file" name="files[]" data-url="{{meta.url}}" multiple>',
            '</div>',
        '</div>',
        // '<div class="span8 fileupload-dropzone well well-small stripes"><p class="text-info">Or...Drop your file(s) here...</p></div>',
        '<div class="span9 fileupload-progress">',
            '<div class="progress progress-success progress-striped active">',
                '<div class="fileupload-progress-bar bar"></div>',
            '</div>',
            '<div class="fileupload-progress-fileQ"></div>',
        '</div>',
    '</div>',
    '<div class="file-editor-body clear-margin-left row-fluid">',
        '<div class="span11">',
            '<table class="table table-striped">',
                '<thead>',
                    '<tr>',
                        '<th>Name</th>',
                        '<th>Size</th>',
                        '{{#unless meta.noActions}}<th>Action</th>{{/unless}}',
                    '</tr>',
                '</thead>',
                '<tbody></tbody>',
            '</table>',
        '</div>',
    '</div>',
    '<div class="file-editor-footer"></div>', 
    ]);
Template.extend(
    'custom-tpl-widget-editor-file-item', 
    [
    '<td><a href="{{url}}">{{name}}</a></td>',
    '<td>{{printSize "file" size}}</td>',
    '{{#unless _options.noActions}}',
        '<td>',
            '{{#each actions}}',
            '<span class="action-trigger action-trigger-{{this.action}} label label-{{this.labelCls}} pointer-hand" action="{{this.action}}" _method="{{this.method}}" _url="{{this.url}}">{{this.label}}</span> ',
            '{{/each}}',
        '</td>',
    '{{/unless}}'
    ]);

Template.extend(
    'custom-tpl-widget-editor-file-progress-item',
    [
        '<p>{{name}} <span class="muted">[{{printSize "file" size}} - {{type}}]</span> <span class="btn btn-small btn-danger pull-right" action="cancel-job">Cancel</span></p>',
    ]
);

//To format given type of data to string
Handlebars.registerHelper('printSize', function(type, value){
    //enums
    var config = {
        fileSizeType: ['Byte', 'KB', 'MB', 'GB', 'TB'],
    };
    //format
    switch(type){
        //print file size
        case 'file':
            var biggerSizeUnit;
            var i = 0;
            for(; i < config.fileSizeType.length; i++){
                biggerSizeUnit = value/1024;
                if(Math.floor(biggerSizeUnit) === 0) break;
                value = biggerSizeUnit;
            }
            return value.toFixed(2) + ' ' + config.fileSizeType[i];
            break;

        default:
            return value;
    };
});