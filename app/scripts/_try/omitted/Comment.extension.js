/**
 *
 * Extension Type B:: Through app.Extend.module (mananger)
 *
 * Note that, since we are using the '.' notations in the keys, we need to quote them.
 *
 * You DO NOT need to worry about nested attributes like View.xx.events, it is taken
 * cared of inside app.Extend (the extension manager module).
 *
 * Two types of extension are supported:
 * 1. Override: to override a given attribute, e.g A.B.c, use 
 *     'A.B' : {*         c : ...
 *     }
 *
 * 2. Extend: to extend a given attribute, e.g A.B.c, use
 *     'A.B.c' : {*         ... : ...
 *     }
 *
 * =======
 * WARNING
 * =======
 * Do not extend a non-existing attribute, if you do, an infinite loop will occur.
 * 
 *
 * @author Tim.Liu
 * @update Mon Jul 22 2013 15:25:38 GMT+0800 (中国标准时间)
 * 
 */


(function(app) {
    var module = app['Comment'];
    if (!module) {
        app.error('Can NOT extend undefined module: ', 'Comment');
    }

    app.Extend.module('Comment', {
        'View.Form.events': { //Todo::

        },
        'View.Form': {
            onRenderPlus: function(view, partnerGridView) { //Todo::
            }

        },
        'View.Extension.DataGrid': { //Todo:: your customized cell definition goes here...

        },
        'View.DataGrid.cells': { //Todo:: field:cell type mapping

        },
        'View.DataGrid.events': { //Todo::

        },
        'View.DataGrid': { //Todo::
            //actionColumnTagOverride: true,
            actionColumnTags: [
                {name: "detail", title: "Details"},
                {name: "show", title: "Show"}
            ],
            afterRender: function() { //Todo::
                console.log('datagrid:rendered', this.$el.find('.data-row').length); //will fire only after backgrid:rendered. (can't use $('.data-row') )
            },
            afterRefresh: function(){
                console.log('datagrid:refresh', this.$el.find('.data-row').length); //will fire upon each sort, reset (backgrid:refresh)
            },
            showDetails: function($actionBtn){
                console.log($actionBtn.attr('target'));
            },
            // abc: function(){
            //     console.log('hi5');
            // }
        },
        'View.DataGrid.actions': {
            //detail: 'showDetails'
            //delete: 'abc'
        }
    });
})(Application);
