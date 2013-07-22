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

            'click i.icon-filter' : 'filtColumn',
            'focusout input.columFilter' : 'closeFilt',
        },
        'View.DataGrid': { //Todo::
            //mode: undefined/editor
            onRenderPlus: function(view, mode) { //Todo::
                if(mode && view.options.mode === 'subDoc'){
                    view.$el.find('th').off();
                }
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

                //b. add filter icon to headers
                view.$el.find('th').each(function(index, el){
                    var $el = $(el);
                    if($el.find('a').text().length>0){
                        $el.append('<input class="columFilter" style="float:left;display:none;position:absolute;"><i class="icon-filter pull-right"></i>');
                    }
                });
                
            },

            filtColumn: function(e){
                var $el = $(e.currentTarget);
                var $searchBox = $el.prev().toggle();
                if($searchBox.offset()){
                    var offset = $el.parent().offset();
                    $searchBox.focus().offset({top: offset.top + ($el.parent().innerHeight()-$el.parent().height())/4 , left: offset.left + ($el.parent().innerWidth()-$el.parent().width())/4}).width($el.parent().width());
                }

            },

            closeFilt: function(e){
                var $el = $(e.currentTarget);
                $el.hide();
            }
        },
    });
})(Application);
