/**
 * This is a convenient widget that creates a basic form for you.
 *
 * Options
 * -------
 * 1. sampe options as activateEditors(options);
 * 2. plus options.buttons as an array of button ui config:
 * 	[
 * 		{
 * 			name: '0',
 * 			[label: ''],
 * 			[fn: ...]
 * 		},
 *   	or
 * 		'name1',
 * 		'name2',
 * 	]
 *
 * @author Tim.Liu
 * @created 2013.12.14
 */

Application.Widget.register('BasicForm', function(){

	var View = Backbone.Marionette.ItemView.extend({
		template: '#widget-basic-form-tpl',
		tagName: 'form',
		className: 'form',
		initialize: function(options){
			this.template = options.template || this.template;
			this.enableActionTags('Widget.BasicForm');
			this.enableForm();
			this.options = _.extend({
				appendTo: '[container="editors"]',
			}, options);
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
						this.actions = this.action || {};
						this.actions[btn.name] = btn.fn;
					}
					if(!btn.label)
						btn.label = _.string.titleize(btn.name);
					return btn;
				}
			}, this);
			this.collection = new Backbone.Collection(btns);
		},
		onRender: function(){
			if(this.options.layout)//form-horizontal, form-inline?
				this.addClass(this.options.layout);
			this.activateEditors(this.options);
		}
	});

	return View;

});

Template.extend('widget-basic-form-tpl', [

	'<div container="editors"></div>',
	'<div>',
		'{{#each items}}',
			'<span class="btn" action="{{name}}">{{label}}</span> ',
		'{{/each}}',
	'</div>'

]);
