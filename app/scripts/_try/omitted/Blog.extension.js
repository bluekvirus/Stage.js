/**
 *
 * Extension Type B:: Through app.Extend.module (mananger)
 *
 * Note that, since we are using the '.' notations in the keys, we need to quote them.
 *
 * You DO NOT need to worry about nested attributes like View.xx.events, it is taken
 * cared of inside app.Extend (the extension manager module).
 *
 * @author Tim.Liu
 * @update Mon Jul 01 2013 20:44:21 GMT+0800 (CST)
 * 
 */


(function(app) {
    app.Extend.module('Blog', {
        'View.Form.events': { //Todo::
            'notify': 'onFieldNotify'
        },
        'View.Form': {

            onRenderPlus: function() { //Todo::
                //$('select').flattenSelect();
                $('select').hoverSelect();
            },

            onFieldNotify: function(e, data){
                console.log(data);
            }

        },
        'View.Extension.DataGrid': { //Todo:: your customized cell definition goes here...
        },
        'View.DataGrid.cells': { //Todo:: field:cell type mapping
        },
        'View.DataGrid.events': { //Todo::
        },
        'View.DataGrid': { //Todo::
        },
    });
})(Application);