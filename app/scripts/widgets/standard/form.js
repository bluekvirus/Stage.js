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
 * type: table or complex form, optional.
 * schema: see - the Admin Factory module [factory/admin.js], optional.
 * template: template of backbone forms. see - lib backbone-forms.js, optional.
 * recordManager: the view or object to delegate the save event & data to, optional.
 * model: the model that has form data, *required if there is no recordManager.
 *
 * @author Tim.Liu
 * @created 2013.09.16
 */

Application.Widget.register('Form', function(){

	var Form = Backbone.Marionette.Layout.extend({
		template: '#basic-form-view-wrap-tpl',
		className: 'basic-form-view-wrap',

		regions: {
			header: '.form-header-container',
			body: '.form-body-container',
			controls: '.form-control-bar'
		},

		events: {
			//TBI
		},

		initialize: function(options){
			//0 choose the right template (according to this.type)
			this.type = options.type || this.type || 'table';
			if(this.type === 'complex')
				this.template = '#basic-form-only-view-wrap-tpl';
			//1 extract fieldsets and condition blocks
			//TBI
			this.schema = options.schema || this.schema;
			//2 assign record manager
			this.recordManager = options.recordManager; //undefined means using model.save() when the save button is clicked.
			if(!this.recordManager && !this.model) throw new Error('DEV::You must pass in either a recordManager or model for the Form widget to work properly');
			//3 listen to 'show' to hookup 'afterRender'
			this.form = new Backbone.Form({
                model: this.model,
                schema: this.schema
                //fieldsets: this.fieldsets
            });
            this.listenTo(this.form, 'show', this.afterRender);
		},

		onShow: function(){
			this.body.show(this.form);
		},

		afterRender: $.noop()

	});

	return Form;

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