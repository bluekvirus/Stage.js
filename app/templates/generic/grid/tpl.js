/**
 *
 * Basic DataGrid Outline.
 * 
 */

Template.extend(
	'basic-datagrid-view-wrap-tpl',
	[
		'<div class="datagrid-header-container">',
			'<a class="btn btn-success" action="new">Create</a>',
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

/**
 *
 * Basic Property Grid Outline.
 * 
 */

Template.extend(	
	'property-item-tpl',
	[
		'<td>{{key}}</td>',
		'<td>{{val}}</td>'
	]
);

Template.extend(	
	'basic-propertygrid-view-wrap-tpl',
	[
		'<div region="title" class="alert alert-info">{{title}}</div>',
		'<table class="table">',
		'<tbody></tbody>',
		'</table>'
	]
);
