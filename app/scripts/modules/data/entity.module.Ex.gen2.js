
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
                this.$el.find('div').append(' <span class="label" action="json">JSON</span>');
                this.$el.find('span[action]').attr('target', this.model.id || this.model.cid);
            }
        },

        'View.DataGrid.events': {
            'click .action-cell span[action=json]': 'generateDefJSON',
        },

        'View.DataGrid': {
            generateDefJSON: function(e){
                e.stopPropagation();
                var info = e.currentTarget.attributes;
                var m = this.collection.get(info['target'].value);

                jQuery.post('/generateDefJSON', m.toJSON(), function(data, textStatus, xhr) {
                  //optional stuff to do after success
                  console.log(data);
                  if(data.file){
                    var drone = $('#hiddenframe');
                    if(drone.length > 0){
                    }else{
                        $('body').append('<iframe id="hiddenframe" style="display:none"></iframe>');
                        drone = $('#hiddenframe');
                    }
                    drone.attr('src', '/generateDefJSON?name='+m.get('name')+'&file='+data.file);
                  }
                });
                
            },
        }

    });
})(Application);


