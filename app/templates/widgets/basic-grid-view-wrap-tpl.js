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