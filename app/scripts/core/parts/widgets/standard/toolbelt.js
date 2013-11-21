/**
 * This is the generalized toolbelt widget
 *
 * @author Tim.Liu
 * @created 2013.11.21
 */

;(function(app){



})(Application);

Template.extend('widget-toolbelt-tpl', [

	//to be refined:
    '<div class="btn-toolbar">',
    	//tools (by group)
        '{{#each tools}}',
            '<div class="btn-group">',
                '{{#each buttons}}',
                    '<a class="btn btn-action-{{action}}" action="{{action}}"><i class="{{icon}}"></i> {{label}}</a>',
                '{{/each}}',
            '</div>',
        '{{/each}}',

        //search box (in a separate widget?)
        '<div class="pull-right input-prepend local-filter-box">',
            '<span class="add-on"><i class="icon-filter"></i></span>',
            '<input type="text" class="input input-medium" name="filter" placeholder="Filter...">',
        '</div>',
    '</div>',

]);