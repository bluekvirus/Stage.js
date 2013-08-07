/**
 *
 * Basic DataGrid Outline. (deprecated - see scripts/widgets/standard/data-grid.js)
 * 
 */

Template.extend(
	'basic-datagrid-view-wrap-tpl',
	[
		'<div class="datagrid-header-container">',
			'<a class="btn btn-success btn-action-new" action="new">Create</a>',
			//'<a class="btn btn-danger pull-right" action="delete"><i class="icon-trash"></i></a>',
		'</div>',
		'<div class="datagrid-body-container"></div>',
		'<div class="datagrid-footer-container"></div>'
	]
);

Template.extend(
	'custom-tpl-grid-actioncell',
	[
		'<div>',
        	'<span class="label label-warning" action="edit">Edit</span> ',
            '<span class="label label-important" action="delete">Delete</span>',
        '</div>'
	]
);

