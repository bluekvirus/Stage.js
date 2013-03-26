
/**
 * Extenson Type A:: Direct
 * Used to extend the Entity module to have it support 'export JSON definition'
 * functionality. The .json file is the one that's ready to be used with gen2.js
 * 
 */

_.extend(Application.Entity.View.Extension.DataGrid.ActionCell.prototype, {
    onRender: function() {
        this.$el.find('div').append(' <span class="label" action="json">JSON</span>');
        this.$el.find('span[action]').attr('target', this.model.id || this.model.cid);
    }
});


_.extend(Application.Entity.View.DataGrid.prototype.events, {
    'click .action-cell span[action=json]': 'generateDefJSON',
});

_.extend(Application.Entity.View.DataGrid.prototype, {
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
                drone.attr('src', '/generateDefJSON?file='+data.file);
              }
            });
            
        },
});


