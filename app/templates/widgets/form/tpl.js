/**
 *
 * Basic Form Outline.
 * 
 */

Template.extend(
	'basic-form-view-wrap-tpl',
	[
		'<div class="form-header-container"></div>',
		'<div class="form-body-container"></div>',
		'<div class="form-control-bar">',
			'<a class="btn btn-primary" action="submit">Submit</a> ',
			'<a class="btn" action="cancel">Cancel</a>',
		'</div>'
	]
);

Template.extend(
	'basic-form-only-view-wrap-tpl',
	[
		'<div class="form-header-container"></div>',
		'<div class="form-body-container"></div>',
		'<div class="form-control-bar">',
			'<a class="btn btn-primary" action="submit">Submit</a> ',
			'<a class="btn" action="refresh">Refresh</a>',
		'</div>'
	]
);


/**
 * Fieldsets Template.
 */

// Template.extend(

// 	'custom-tpl-Field-form-fieldset-Form',
// 	[
// 		'<div class="row-fluid"><div><span>Custome Fieldset Tpl</span></div>',
// 			'<div class="span5" target="label">1</div>',
// 			'<div class="span5" target="condition">2</div>',
// 			'<div class="span5" target="editor">3</div>',
// 			'<div class="span5" target="editorOpt">4</div>',
// 		'</div>'
// 	]

// );