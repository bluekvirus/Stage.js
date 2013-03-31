/**
 * The genaric AdminLayout and EditorLayout tpl for data modules
 */
Template.extend(
	'custom-tpl-layout-module-admin',
	[
		'<div class="admin-layout-header"><span class="admin-layout-header-title">{{meta.title}}</span></div>',
		'<div class="admin-layout-body">',
            '<div class="list-view-region"></div>',
            '<div class="details-view-region"></div>',
		'</div>',
		'<div class="admin-layout-footer"></div>',
	]
);
