
/**
 * Used to extend the Entity module to have it support 'export JSON definition'
 * functionality. The .json file is the one that's ready to be used with gen2.js
 * 
 */

Application.Entity.View.Extension.DataGrid.ActionCell = Application.Entity.View.Extension.DataGrid.ActionCell.extend({
    onRender: function() {
        this.$el.find('div').append(' <span class="label" action="json">JSON</span>');
        this.$el.find('span[action]').attr('target', this.model.id || this.model.cid);
    }
});

console.log(Application.Entity.View.Extension.DataGrid.ActionCell);

Application.Entity.View.DataGrid = _.extend(Application.Entity.View.DataGrid, {
        events: {
            'click .btn[action=new]': 'showForm',
            'click .action-cell span[action=edit]': 'showForm',
            'click .action-cell span[action=delete]': 'deleteRecord',
            'event_SaveRecord': 'saveRecord',
            'event_RefreshRecords': 'refreshRecords',
        },
        generateDefJSON: function(e){
            e.stopPropagation();
            var info = e.currentTarget.attributes;
            var m = this.collection.get(info['target'].value);

            jQuery.post('/generateDefJSON', m.toJSON(), function(data, textStatus, xhr) {
              //optional stuff to do after success
              console.log(data);
            });
            
        },
});


