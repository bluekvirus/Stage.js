
/**
 *
 * Extension Type B:: Through app.Extend.module (mananger)
 * Used to extend the Entity module to have it support 'export JSON definition'
 * functionality. The .json file is the one that's ready to be used with gen2.js
 *
 * Note that, since we are using the '.' notations in the keys, we need to quote them.
 *
 * You DO NOT need to worry about nested attributes like View.xx.events, it is taken
 * cared of inside app.Extend (the extension manager module).
 *
 * @author Tim.Liu
 * @update 2013.03.26
 */
(function(app){
    app.Extend.module('Entity', {

        'View.Extension.DataGrid.ActionCell':{
            onRender: function() {
                this.$el.find('div').append(
                        ' <span class="label" action="json">JSON</span> '+
                        ' <span class="label label-success" action="src" srctype="module">Module</span> '+
                        ' <span class="label label-info" action="src" srctype="mongoose">Mongoose</span> '+
                        ' <span class="label label-inverse" action="src" srctype="extension">ext.B</span> '
                    );
                this.$el.find('span[action]').attr('target', this.model.id || this.model.cid);
            }
        },

        'View.DataGrid.events': {
            'click .action-cell span[action=json]': 'generateDefJSON',
            'click .action-cell span[action=src]': 'generateSrc',
        },

        'View.DataGrid': {
            _postAndDownload: function(url, params){
                jQuery.post(url, params, function(data, textStatus, xhr) {
                  //optional stuff to do after success
                  console.log(data);
                  if(data.file){
                    Application.downloader({
                        url: '/admin/downloadGenerated',
                        name: params.name,
                        file: data.file,
                        type: data.type
                    });
                  }
                });
                
            },

            generateDefJSON: function(e){
                e.stopPropagation();
                var info = e.currentTarget.attributes;
                var m = this.collection.get(info['target'].value);

                this._postAndDownload('/admin/generateDefJSON', m.toJSON());
                
            },

            generateSrc: function(e){
                e.stopPropagation();
                var info = e.currentTarget.attributes;
                var m = this.collection.get(info['target'].value);
                var type = info['srctype'].value;

                this._postAndDownload('/admin/generateSrc?type='+type, m.toJSON());
                
            }
        }

    });
})(Application);


