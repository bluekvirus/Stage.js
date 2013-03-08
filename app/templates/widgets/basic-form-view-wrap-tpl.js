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
			'<button class="btn btn-primary" type="button" action="submit">Submit</button>',
			'<button class="btn" type="button" action="cancel">Cancel</button>',
		'</div>'
	]
);