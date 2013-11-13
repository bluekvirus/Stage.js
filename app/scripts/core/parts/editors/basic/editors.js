/**
 * This is the code template for **basic** <input>, <select>, <textarea> editor.
 *
 * Note that the validate function defaults on no-op. You should override this according to field settings during form/formPart init.
 *
 * Init Options
 * ============
 * name
 * type (see core/parts/editors/README.md)
 * fieldname - this is to override the field this editor points to (in case of an array of inputs for one array field) e.g "abc[]" - see jquery-serializeForm in lib
 * label
 * help
 * tooltip
 * placeholder
 * multiple - select only
 * rows - textarea only
 * options: { 
 * 	inline: true|false (for radios and checkboxes only - note that the choice data should be prepared and passed in instead of using url or callbacks to fetch within the editor)
 * 	data: [] or {group:[], group2:[]} - (groups are for select only)
 * 	labelField
 * 	valueField
 * }
 * validate (custom function and/or rules see core/parts/editors/basic/validations.js)
 *
 * The validation function should return null or 'error string' to be used in status.
 *
 * @author Tim.Liu, Yan.Zhu
 * @created 2013.11.10
 * @version 1.1.0
 */

Application.Editor.register('Basic', function(){

	var UI = Backbone.Marionette.ItemView.extend({

		template: '#editor-Basic-tpl',
		className: 'control-group',

		events: {
			'change input': '_triggerEvent', //editor:change:[name]
			'focusout': '_triggerEvent', //editor:focusout:[name]
			'focusin': '_triggerEvent' //editor:focusin:[name]
		},

		initialize: function(options){
			this.autoDetectUIs();
			//collect [parentCt](to fire events on), name, label, type, placeholder/help/tooltip, options(radios/checkboxes only) and validation settings
			this.parentCt = options.parentCt;
			
			//prep the choices data for select/radios/checkboxes
			if(options.options){
				var choices = options.options;
				choices.valueField = choices.valueField || 'value';
				choices.labelField = choices.labelField || 'label';

				if(options.type === 'select' && !_.isArray(choices.data)){
					choices.grouped = true;
				}

				function extractChoices(data){
					if(_.isObject(data[0])){
						data = _.map(data, function(c){
							return {value: c[choices.valueField], label: c[choices.labelField]};
						});
					}else {
						data = _.map(data, function(c){
							return {value: c, label: _.string.titleize(c)};
						});
					}
					return data;
				};

				if(choices.grouped){
					//select (grouped)
					_.each(choices.data, function(array, group){
						choices.data[group] = extractChoices(array);
					});
				}else {
					//select, radios, checkboxes
					choices.data = extractChoices(choices.data);
				}
			}

			//prep basic editor display
			this.model = new Backbone.Model({
				uiId: _.uniqueId('basic-editor-'),
				name: options.name, //*
				type: options.type, //*
				multiple: options.multiple || false, //optional
				rows: options.rows || 3, //optional
				fieldname: options.fieldname || undefined, //optional
				label: options.label || '', //optional
				placeholder: options.placeholder || '', //optional
				help: options.help || '', //optional
				tooltip: (_.isString(options.tooltip) && options.tooltip) || '', //optional
				options: options.options || undefined, //optional {inline: true|false, data:[{label:'l', val:'v', ...}, {label:'ll', val:'vx', ...}] or ['v', 'v1', ...], labelField:..., valueField:...}
			});

			//prep validations
			if(options.validate) {
				this.validators = _.map(options.validate, function(validation, name){
					if(_.isFunction(validation)){
						return {fn: validation};
					}else 
						return {rule: name, options:validation};
				});				
				this.validate = function(){
					if(_.isFunction(options.validate)) return options.validate(this.getVal(), this.parentCt); //return error msg or nothing
					else {
						var error, validators = _.clone(this.validators);
						while(validators.length > 0){
							var validator = validators.shift();
							if(validator.fn) {
								error = validator.fn(this.getVal(), this.parentCt);
							}else {
								error = (Application.Editor.rules[validator.rule] && Application.Editor.rules[validator.rule](validator.options, this.getVal(), this.parentCt));
							}
							if(error) return error;
						}
					}
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

		setVal: function(val, loud){
			//throw new Error('DEV::Editor.Basic::Has not yet implemented setVal()!');
			if(this.ui.inputs.length > 0){
				//radios/checkboxes
				this.ui.inputs.find('input').val(_.isArray(val)?val:[val]);
			}else {
				this.ui.input.val(val);
			}
			if(loud) this._triggerEvent({type: 'change'});
		},

		getVal: function(){
			//throw new Error('DEV::Editor.Basic::Has not yet implemented getVal()!');
			if(this.ui.inputs.length > 0){
				//radios/checkboxes
				var result = this.$('input:checked').map(function(el, index){
					return $(this).val();
				}).get();
				if(this.model.get('type') === 'radio') result = result.pop();
				return result;
			}else {
				return this.ui.input.val();
			}
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
		_triggerEvent: function(e){
			var host = this;
			if(this.parentCt){
				host = this.parentCt;
			}
			host.trigger('editor:' + e.type + ':' + this.model.get('name'), this);

			//this.trigger(e.type, this); - need to hook up with passed-in callbacks from init options
	
		}

	});

	return UI;

});

Template.extend('editor-Basic-tpl', [
	'<label class="control-label" for="{{uiId}}"><strong>{{label}}</strong></label>',
	'<div class="controls">',

		//1. select
		'{{#is type "select"}}',
			'<select ui="input" name="{{#if fieldname}}{{fieldname}}{{else}}{{name}}{{/if}}" class="input-block-level" id="{{uiId}}" {{#if multiple}}multiple="multiple"{{/if}} data-toggle="tooltip" title="{{tooltip}}" style="margin-bottom:0">',
				'{{#if options.grouped}}',
					'{{#each options.data}}',
					'<optgroup label="{{@key}}">',
						'{{#each this}}',
						'<option value="{{value}}">{{label}}</option>',
						'{{/each}}',
					'</optgroup>',
					'{{/each}}',
				'{{else}}',
					'{{#each options.data}}',
					'<option value="{{value}}">{{label}}</option>',
					'{{/each}}',
				'{{/if}}',
			'</select>',
		'{{else}}',
			//2. textarea
			'{{#is type "textarea"}}',
				'<textarea ui="input" name="{{#if fieldname}}{{fieldname}}{{else}}{{name}}{{/if}}" class="input-block-level" id="{{uiId}}" rows="{{rows}}" placeholder="{{placeholder}}" data-toggle="tooltip" title="{{tooltip}}" style="margin-bottom:0"></textarea>',
			'{{else}}',
				//3. input
				//checkboxes/radios
				'{{#if options}}',
					'<div ui="inputs" id={{uiId}} data-toggle="tooltip" title="{{tooltip}}">',
					'{{#each options.data}}',
						'<label class="{{../type}} {{#if ../options.inline}}inline{{/if}}">',
							//note that the {{if}} within a {{each}} will impose +1 level down in the content scope.  
							'<input name="{{#if ../fieldname}}{{../../fieldname}}{{else}}{{../../name}}{{/if}}{{#is ../type "checkbox"}}[]{{/is}}" type="{{../type}}" value={{value}}> {{label}}',
						'</label>',
					'{{/each}}',
					'</div>',
				//normal single field
				'{{else}}',
				'<div data-toggle="tooltip" title="{{tooltip}}">',
					'<input ui="input" name="{{#if fieldname}}{{fieldname}}{{else}}{{name}}{{/if}}" class="input-block-level" type="{{type}}" id="{{uiId}}" placeholder="{{placeholder}}" style="margin-bottom:0">',
				'</div>',
				'{{/if}}',
			'{{/is}}',
		'{{/is}}',

		//msg & help
		'<span class="help-block" style="margin-bottom:0"><small>{{help}}</small></span>',
		'<span class="help-block"><strong ui="msg">{{msg}}</strong></span>',
	'</div>'
]);