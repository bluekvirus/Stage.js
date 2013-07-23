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

            'click i.icon-filter' : 'showColumnFilter',
            'focusout input.columnFilter' : 'closeColumnFilter',
            'keyup input.columnFilter' : 'applyFilter',
            'click .filter-val' : 'showColumnFilter',
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
                        $el.append('<input class="columnFilter hide" style="position:absolute;"></span><i class="icon-filter pull-right"></i>');
                    }
                });
                    //add a column filter recovery gap
                view.$el.find('.datagrid-body-container').prepend('<div class="column-filter-recover-gap hide"></div>');
                
            },

            showColumnFilter: function(e){
                var $el = $(e.currentTarget);
                var $searchBox = $el.parent().find('.columnFilter').toggle();
                if($searchBox.offset()){
                    $searchBox.focus().width($el.parent().width()).position({
                        of:$el.parent(), 
                    });
                }

            },

            closeColumnFilter: function(e){
                var $el = $(e.currentTarget);
                var val = $el.val();
                if(val){
                    if($el.data().filter){
                        $el.data().filter.text(val);
                    }else {
                        var $filter = $('<span class="filter-val" style="position:absolute;padding:0px 5px;background-color:#eee;border-radius:6px 6px 0 0"><i class="icon-remove"></i></span>').text(val).appendTo($el.parent());
                        $el.data('filter', $filter);
                    }
                    $el.data().filter.position({
                        my: 'right bottom',
                        at: 'right top',
                        of: $el.parent()
                    });
                }else {
                    if($el.data().filter) $el.data().filter.remove();
                    delete $el.data().filter;
                }
                $el.hide();
            },

            applyFilter: function(e){
                if(e.keyCode === 13){
                    $(e.currentTarget).focusout();
                    //TBI
                }
            }
        },
    });
})(Application);
