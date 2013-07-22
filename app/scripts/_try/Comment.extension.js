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
            onRenderPlus: function(view) { //Todo::
            }

        },
        'View.Extension.DataGrid.ActionCell': { //Todo:: 

        },
        'View.Extension.DataGrid': { //Todo:: your customized cell definition goes here...

        },
        'View.DataGrid.cells': { //Todo:: field:cell type mapping

        },
        'View.DataGrid.events': { //Todo::

        },
        'View.DataGrid': { //Todo::
            //mode: undefined/editor
            onRenderPlus: function(view, mode) { //Todo::
                //a. apply the client side search filter
                var fields = _.pluck(view.columns, 'name');
                fields.pop();fields.shift();//get the _select_, _action_ columns out;

                    //add more fields? You can :))

                view.filter = new Backgrid.Extension.ClientSideFilter({
                  collection: view.collection,
                  fields: fields,
                });

                    //render it to the datagrid header ct
                view.$el.find('.datagrid-header-container').append(view.filter.render().el);
                view.filter.$el.find('a.close').replaceWith('<i class="close icon-x"></i>');
                
            }
        },
    });
})(Application);
