/**
 *
 * Basic DataGrid Outline.
 * 
 */

Template.extend(
	'basic-datagrid-view-wrap-tpl',
	[
		'<div class="datagrid-header-container">',
			'<button class="btn btn-primary" action="new">Create</button>',
		'</div>',
		'<div class="datagrid-body-container"></div>',
		'<div class="datagrid-footer-container"></div>'
	]
);