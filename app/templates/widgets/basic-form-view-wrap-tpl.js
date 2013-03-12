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