/**
 * This is the generalized form widget that based on backbone-forms.js.
 *
 * ======
 * Design
 * ======
 * We want the field editors to be generated and put on form dynamically. The closest lib that does this is backbone-forms.
 * So at the momemt, we use a marionette.layout view object to wrap up a instance of backbone-forms. (This dependency might be removed in the future)
 * Note that we modified backbone-forms on its 0.11.0 version so that it can:
 * 1. Not submit the 'invisible' fields (those of css display:none);
 * 2. Have custom template to its fieldsets;
 * 3. Trigger display condition checks upon field val changes;
 * see - vender/modified/backbone-forms
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

		initialize: function(options){
			//0 choose the right template (according to this.type)
			this.type = options.type || this.type || 'table';
			if(this.type === 'complex')
				this.template = '#basic-form-only-view-wrap-tpl';

			//1 extract fieldsets and condition blocks
			//TBI
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

            this.enableUILocks();
            this.enableActionTags('Widget.Form');
		},

		onShow: function(){
			this.body.show(this.form);
			this.refresh();	//apply to form:complex only.
		},
		afterRender: $.noop(),

		actions: {
			submit: function($action){
				//1 check if there are validations to apply to the fields
	            var error = this.form.validate();
	            if (error) { //output error and scroll to first error field.
	                //console.log(error);
	                for (var key in error) {
	                    $('html').animate({
	                        scrollTop: this.form.$el.find('.invalid[name=' + key + ']').offset().top - 30
	                    }, 400);
	                    break;
	                }
	            } else { //delegating the save/upate action to the recordManager.
	                this.model.set(this.form.getValue());
	            }				
				//2 save the record
				if(this.recordManager) {
					//delegate to recordManager
					this.recordManager.$el.trigger('event_SaveRecord', this);					
				}else {
					//save it directly using this.model.save
					this.model.save({}, {notify: true});
				}
			},

			cancel: function($action){
				this.close();
			},

			refresh: function($action){
				this.refresh();
			}
		},


		refresh: function(){
			var that = this;
			if(this.type === 'complex')
				this.model.fetch({data: { page: 1, per_page: 1},
					beforeSend: function(){
						that.showWaitingSpin(true);
					},
					success: function(m){
						that.form.setValue(m.attributes);
						that.showWaitingSpin(false);
					}
				});//grab 1 record only.
		},
		//depends on spin.js jquery plugin
		showWaitingSpin: function(flag){
			if(flag)
				this.form.$el.spin();
			else
				this.form.$el.spin(false);
		}			


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