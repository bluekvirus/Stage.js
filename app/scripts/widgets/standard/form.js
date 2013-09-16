/**
 * This is the generalized form widget that based on backbone-forms.js.
 *
 * ======
 * Design
 * ======
 * ...
 * 	
 * ======
 * Usage
 * ======
 * ...
 * 
 * =======
 * Options
 * =======
 * ...
 *
 * @author Tim.Liu
 * @created 2013.09.16
 */

Application.Widget.register('Form', function(){

});



/**
 * ====================
 * Basic Form Templates
 * ====================
 */
Template.extend(
	'basic-form-view-wrap-tpl',
	[
		'<div class="form-header-container"></div>',
		'<div class="form-body-container"></div>',
		'<div class="form-control-bar">',
			'<div class="form-control-bar-btn-holder">',
				'<a class="btn btn-primary btn-action-save" action="submit">Save</a> ',
				'<a class="btn" action="cancel">Cancel</a>',
			'</div>',
		'</div>'
	]
);

Template.extend(
	'basic-form-only-view-wrap-tpl',
	[
		'<div class="form-header-container"></div>',
		'<div class="form-body-container"></div>',
		'<div class="form-control-bar">',
			'<div class="form-control-bar-btn-holder">',
				'<a class="btn btn-primary btn-action-save" action="submit">Save</a> ',
				'<a class="btn" action="refresh">Refresh</a>',
			'</div>',
		'</div>'
	]
);