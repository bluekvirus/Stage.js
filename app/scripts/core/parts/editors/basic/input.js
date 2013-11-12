/**
 * This is the code template for **basic** <input> editor.
 *
 * Note that the validate function defaults on no-op. You should override this according to field settings during form/formPart init.
 *
 * Init Options
 * ============
 * name
 * type (see core/parts/editors/README.md)
 * label
 * help
 * tooltip
 * options: { (for radios and checkboxes only - note that the choice data should be prepared and passed in instead of using url or callbacks to fetch within the editor)
 * 	inline: true|false
 * 	data: []
 * 	labelField
 * 	valueField
 * }
 * validate (custom function or settings to use Backbone.Validations)
 *
 * The validation function should return null or 'error string' to be used in status.
 *
 * @author Tim.Liu
 * @created 2013.11.10
 * @version 1.0.1
 */

Application.Editor.register('Input', function(){

	var UI = Backbone.Marionette.ItemView.extend({

		template: '#editor-Input-tpl',
		className: 'control-group',

		events: {
			'change input': 'onChange',
			'blur input': 'onBlur',
			'focus input': 'onFocus'
		},

		initialize: function(options){
			this.autoDetectUIs();
			//collect [parentCt](to fire events on), name, label, type, placeholder/help/tooltip, options(radios/checkboxes only) and validation settings
			this.parentCt = options.parentCt;
			
			if(options.options){
				//radios, checkboxes
				var choices = options.options;
				if(_.isObject(choices.data[0])){
					choices.valueField = choices.valueField || 'value';
					choices.labelField = choices.labelField || 'label';
					choices.data = _.map(choices.data, function(c){
						return {value: c[choices.valueField], label: c[choices.labelField]};
					});
				}else {
					choices.data = _.map(choices.data, function(c){
						return {value: c, label: _.string.titleize(c)};
					});
				}
			}
			this.model = new Backbone.Model({
				uiId: _.uniqueId('basic-editor-'),
				name: options.name, //*
				type: options.type, //*
				label: options.label || '', //optional
				placeholder: options.placeholder || '', //optional
				help: options.help || '', //optional
				tooltip: (_.isString(options.tooltip) && options.tooltip) || '', //optional
				options: options.options, //optional {inline: true|false, data:[{label:'l', val:'v', ...}, {label:'ll', val:'vx', ...}] or ['v', 'v1', ...], labelField:..., valueField:...}
			});

			if(options.validate) {
				this.validate = function(){
					//TBI
				}
			}

			if(_.isObject(options.tooltip)){
				//will activate tooltip with specific config object - see /libs/bower_components/bootstrap[x]/docs/javascript.html#tooltips
				this._tooltipOpt = options.tooltip;
			}
		},

		onRender: function(){
			//activate tooltips
			this.$('[data-toggle="tooltip"]').tooltip(this._tooltipOpt);
		},

		setVal: function(){
			throw new Error('DEV::Editor.Input::Has not yet implemented setVal()!');
		},

		getVal: function(){
			throw new Error('DEV::Editor.Input::Has not yet implemented getVal()!');
		},

		validate: $.noop,

		status: function(status, msg){
			//set or get status of this editor UI
			if(status){
				//set warning, error, info, success... status, no checking atm.				
				this.$el
					.removeClass(this.$el.data('status'))
					.addClass(status)
					.data('status', status);
				this.ui.msg.html(msg || '');
			}else {
				//get
				return this.$el.data('status');
			}
		},

		//need to forward events if has this.parentCt
		onChange: $.noop,
		onBlur: $.noop,
		onFocus: $.noop

	});

	return UI;

});

Template.extend('editor-Input-tpl', [
	'<label class="control-label" for="{{uiId}}"><strong>{{label}}</strong></label>',
	'<div class="controls">',
		//checkboxes/radios
		'{{#if options}}',
			'<div id={{uiId}} data-toggle="tooltip" title="{{tooltip}}">',
			'{{#each options.data}}',
				'<label class="{{../type}} {{#if ../options.inline}}inline{{/if}}">',
					'<input name="{{../name}}" type="{{../type}}" value={{value}}> {{label}}',
				'</label>',
			'{{/each}}',
			'</div>',
		//normal single field
		'{{else}}',
		'<div data-toggle="tooltip" title="{{tooltip}}">',
			'<input name="{{name}}" class="input-block-level" type="{{type}}" id="{{uiId}}" placeholder="{{placeholder}}" style="margin-bottom:0">',
		'</div>',
		'{{/if}}',
		'<span class="help-block" style="margin-bottom:0"><small>{{help}}</small></span>',
		'<span class="help-block"><strong ui="msg">{{msg}}</strong></span>',		
	'</div>'
]);