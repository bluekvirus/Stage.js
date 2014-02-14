/**
 * This is a convenient widget that creates a basic form for you.
 *
 * Options
 * -------
 * 1. sampe options as activateEditors(options);
 * 
 * 2. buttons [optional, default on 'save', 'cancel']
 * as an array of button ui config:
 * 	[
 * 		{
 * 			name: '0',
 * 			[label: ''],
 * 			[fn: ...]
 * 		},
 *   	or
 * 		'name1',
 * 		'name2',
 * 	];
 * 	
 * 3. data [optional]
 * as an object of default form data:
 * {
 * 		fieldname: val,
 * 		group: {
 * 			f1: v1,
 * 			f2: v2,
 * 		}
 * }
 * 
 * 4. record [optional]
 * as a Backbone.Model used to submit changes upon save.
 *
 * 
 * Default Actions Impl
 * --------------------
 * 1. cancel: this will just close the form
 *
 * if you pass in a record 3 more actions will be implemented for you
 * 2. save: this will create/update the record model to server.
 * 3. reset: this will reset the form according to the record model's attributes
 * 4. refresh: this will reload the record model from server.
 *
 * Name your buttons to the above 4 names to pick up the default action implementations.
 *
 * @author Tim.Liu
 * @created 2013.12.14
 */

Application.Widget.register('BasicForm', function(){

	var View = Backbone.Marionette.ItemView.extend({
		template: '#widget-basic-form-tpl',
		tagName: 'form',
		className: 'form basic-form',
		initialize: function(options){
			this.template = options.template || this.template;
			this.autoDetectUIs();
			this.enableActionTags('Widget.BasicForm');
			this.enableForm();
			this.actions = this.actions || {};
			this.options = _.extend({
				appendTo: '[container="editors"]',
			}, options);

			//buttons:
			options.buttons = options.buttons || ['save', 'cancel'];
			var btns = _.map(options.buttons, function(btn){
				if(_.isString(btn)){
					return {
						name: btn,
						label: _.string.titleize(btn)
					}
				}else {
					if(!btn.name)
						throw new Error('DEV::Widget.BasicForm::You must define a proper name for each button');
					if(btn.fn){
						this.actions[btn.name] = btn.fn;
					}
					if(!btn.label)
						btn.label = _.string.titleize(btn.name);
					return btn;
				}
			}, this);
			this.collection = new Backbone.Collection(btns);

			//if init with a data model record (note that we do NOT use model directly here to avoid the backbone-model->view linkage)
			//we give it 2 default action implementations. save/refresh
			if(this.options.record){
				var that = this;
				_.extend(this.actions, {
					//default save action impl.
					save: function(){
						var error = this.validate(true);
						if(error) return;
						this.options.record.set(this.getValues());
						this.options.record.save().done(function(){
							that.trigger('form:record-saved');
						});
					},
					//default refresh action impl.
					refresh: function(){
						this.options.record.load({
							success: function(record){
								that.setValues(record.attributes);								
							}
						});
					},
					//default reset action impl.
					reset: function(){
						this.setValues(this.options.data);
					}
				});
			}
			//default cancel action impl
			_.extend(this.actions, {
				cancel: function(){
					this.trigger('form:cancelled');
				}
			});

		},
		onRender: function(){
			if(this.options.layout)//form-horizontal, form-inline?
				this.$el.addClass(this.options.layout);
			this.activateEditors(this.options);
			if(this.options.data)
				this.setValues(this.options.data);
		},
		onShow: function(){
			var maxOW = 0, maxW = 0, count = 0;
			this.ui.btn.each(function(index, el){
				var $el = $(el);
				var ow = $el.outerWidth(true);
				var w = $el.width();
				if(maxOW < ow) {
					maxOW = ow;
					maxW = w;
				}
				count = index;
			});
			this.ui.btn.width(maxW);
			this.ui.btnBar.width(maxOW * (count + 1));
		}
	});

	return View;

});

Template.extend('widget-basic-form-tpl', [

	'<div class="form-body" container="editors"></div>',
	'<div class="btn-bar-ct"><div class="btn-bar" ui="btnBar">',
		'{{#each items}}',
			'<span class="btn" action="{{name}}" ui="btn">{{label}}</span>',
		'{{/each}}',
	'</div></div>',

]);
