/**
 * This is the code template for **basic** <input>, <select>, <textarea> editor.
 *
 * Note that the validate function defaults on no-op. You should override this according to field settings during form/formPart init.
 *
 * Init Options
 * ============
 * [layout]: { - Note that if you use this layout class, you must also use form-horizontal in the outter most form container
 * 		label: in col-..-[1..12] bootstrap 3 grid class
 * 		field: ...
 * }
 * type (see predefined/parts/editors/README.md)
 * label
 * help
 * tooltip
 * placeholder
 * value: default value
 * 
 * //radios/selects/checkboxes only
 * options: { 
 * 	inline: true|false (for radios and checkboxes only - note that the choice data should be prepared and passed in instead of using url or callbacks to fetch within the editor)
 * 	data: [] or {group:[], group2:[]} - (groups are for select only)
 * 	labelField
 * 	valueField
 * 	remote: app.remote() options for fetching the options.data
 * }
 *
 * //single checkbox only
 * boxLabel: (single checkbox label other than field label.)
 * checked: '...' - checked value
 * unchecked: '...' - unchecked value
 *
 * //select only
 * multiple
 * 
 * //textarea only 
 * rows
 *
 * //specifically for file only (see also fileeditor.upload(options))
 * upload: {
 * 	standalone: false/true - whether or not to display a stand-alone upload button for this field.
 * 	formData: - an {} or function to return additional data to be submitted together with the file.
 * 	fileInput: - a jQuery collection of input[type=file][name=file[]] objects. (for multi-file upload through one editor api)
 * 	url - a string indicating where to upload the file to.
 * 	...  see complete option listing on [https://github.com/blueimp/jQuery-File-Upload/wiki/Options].
 *
 *  callbacks: { - with 'this' in the callbacks pointing to the editor.
 *  	done/fail/always/progress ... - see complete callback listing on [https://github.com/blueimp/jQuery-File-Upload/wiki/Options].
 *  }
 * }
 * 
 * validate (custom function and/or rules see core/parts/editors/basic/validations.js) - The validation function should return null or 'error string' to be used in status.
 * parentCt - event delegate.
 *
 * Events
 * ======
 * editor:change
 * editor:keyup
 * editor:focusin/out
 * view:editor-changed (parentCt)
 *
 * Constrain
 * =========
 * Do addon/transform stuff in onRender() *Do NOT* use onShow() it won't be invoked by _enableEditors() enhancement in ItemView/Layout.
 * 
 *
 * @author Tim Lauv
 * @contributor Yan.Zhu
 * @created 2013.11.10
 * @updated 2014.02.26 [Bootstrap 3.1+]
 * @updated 2015.12.07 [awesome-bootstrap-checkbox & radio]
 * @version 1.2.1
 */

;(function(app){

	app.Core.Editor.register('Basic', function(){

		var UI = app.view({

			template: '#editor-basic-tpl',
			className: 'form-group', //this class is suggested to be removed if there is no label in this editor options.
			type: 'ItemView',
			forceViewType: true, //supress ItemView type warning by framework.

			events: {
				//fired on both parentCt and this editor
				'change': '_triggerEvent', 
				'keyup input, textarea': '_triggerEvent', 
				'focusout': '_triggerEvent', 
				'focusin': '_triggerEvent' 
			},

			//need to forward events if has this.parentCt
			_triggerEvent: function(e){
				var host = this;
				host.trigger('editor:' + e.type, this.model.get('name'), this);
				//host.trigger('editor:' + e.type + ':' + this.model.get('name'), this);

				if(this.parentCt){
					this.parentCt.trigger('editor:' + e.type, this.model.get('name'), this);
					//this.parentCt.trigger('editor:' + e.type + ':' + this.model.get('name'), this);
					if(e.type == 'change')
						this.parentCt.trigger('view:editor-changed', this.model.get('name'), this);
				}
			},

			initialize: function(options){
				//[parentCt](to fire events on) as delegate
				this.parentCt = options.parentCt || this.parentCt;
				
				//prep the choices data for select/radios/checkboxes
				if(options.type in {'select': true, 'radios': true, 'checkboxes': true}){
					switch(options.type){
						case 'radios':
						options.type = 'radio'; //fix the <input> type
						break;
						case 'checkboxes':
						options.type = 'checkbox'; //fix the <input> type
						break;
						default:
						break;
					}

					options.options = options.options || {};
					options.options = _.extend({
						data: [],
						valueField: 'value',
						labelField: 'label'
					}, options.options);

					var choices = options.options; //for easy reference within extractChoices()
					var extractChoices = function (data){
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

					var prepareChoices = function (choices){

						if(!_.isArray(choices.data)){
							choices.grouped = true;
						}

						if(choices.grouped){
							//select (grouped)
							_.each(choices.data, function(array, group){
								choices.data[group] = extractChoices(array);
							});
						}else {
							//select, radios, checkboxes
							choices.data = extractChoices(choices.data);
						}

						return choices;
					};

					if(!choices.remote)
						prepareChoices(options.options);
					else
						this.listenToOnce(this, 'render', function(){
							var that = this;
							app.remote(choices.remote).done(function(data){
								
								//Warning: to leave less config overhead, developers have no way to pre-process the choice data returned atm.
								that.setChoices(data);
							});
						});

					//give it a method for reconfigure the choices later
					this.setChoices = function(data){
						var choices = this.model.get('options');
						choices.data = data;
						this.model.set('options', prepareChoices(choices));
						this.render();
					};
				}

				//prep basic editor display
				var uuiid = _.uniqueId('basic-editor-'); //unique UI id
				this.model = new Backbone.Model({
					uiId: uuiid, 
					layout: options.layout || '',
					name: options.name, //*required
					type: options.type, //default: text
					multiple: options.multiple || false, //optional
					rows: options.rows || 3, //optional
					fieldname: options.fieldname || uuiid, //optional - not recommended, 1. with jquery.serializeForm plugin, 2. prevent same-def form radios collision
					label: options.label || '', //optional
					placeholder: options.placeholder || '', //optional

					help: options.help || '', //optional
					tooltip: (_.isString(options.tooltip) && options.tooltip) || '', //optional
					options: options.options || undefined, //optional {inline: true|false, data:[{label:'l', val:'v', ...}, {label:'ll', val:'vx', ...}] or ['v', 'v1', ...], labelField:..., valueField:...}
					//specifically for a single checkbox field:
					boxLabel: options.boxLabel || '',
					value: options.value,
					checked: options.checked || true,
					unchecked: options.unchecked || false
				});
				//mark view name to be Basic.type.name (more specific than just Basic)
				this.name = [this.name, options.type, options.name].join('.');

				//prep validations
				if(options.validate) {
					this.validators = _.map(options.validate, function(validation, name){
						if(_.isFunction(validation)){
							return {fn: validation};
						}else 
							return {rule: name, options:validation};
					});
					//forge the validation method of this editor				
					this.validate = function(show){
						if(!this.isEnabled()) return; //skip the disabled ones.
						
						var error;
						if(_.isFunction(options.validate)) {
							error = options.validate(this.getVal(), this.parentCt); 

						}
						else {
							var validators = _.clone(this.validators);
							while(validators.length > 0){
								var validator = validators.shift();
								if(validator.fn) {
									error = validator.fn(this.getVal(), this.parentCt);
								}else {
									error = (app.Core.Editor.rules[validator.rule] && app.Core.Editor.rules[validator.rule](validator.options, this.getVal(), this.parentCt));
								}
								if(!_.isEmpty(error)) break;
							}
						}
						if(show) {
							this._followup(error); //eager validation, will be disabled if used in Compound editor 
							//this.status(error);
						}
						return error;//return error msg or nothing						
					};

					//internal helper function to group identical process (error -> eagerly validated)
					this._followup = function(error){
						if(!_.isEmpty(error)){
							this.status(error);
							//become eagerly validated
							this.eagerValidation = true;
						}else {
							this.status();
							this.eagerValidation = false;
						}
					};
					this.listenTo(this, 'editor:change editor:keyup', function(){
						if(this.eagerValidation)
							this.validate(true);
					});

				}

				//prep tooltip upon rendered.
				if(options.tooltip)
					this._enableTooltips(_.isObject(options.tooltip)?options.tooltip:{});

				//prep fileupload if type === 'file'
				if(options.type === 'file'){
					this._enableActionTags('Editor.File');
					if(!options.upload || !options.upload.url) throw new Error('DEV::Editor.Basic.File::You need options.upload.url to point to where to upload the file.');

					//1. listen to editor:change so we can reveal [upload] and [clear] buttons
					this.listenTo(this, 'editor:change', function(){
						if(this.ui.input.val()){
							if(options.upload.standalone)
								this.ui.upload.removeClass('hidden').show();
							this.ui.clearfile.removeClass('hidden').show();
						}
						else {
							this.ui.upload.hide();
							this.ui.clearfile.hide();
						}
					});
					this.onRender = function(){

						this.$el.fileupload({
							fileInput: null, //-remove the plugin's 'change' listener to delay the add event.
							//forceIframeTransport: true, //-note that if iframe is used, error/fail callback will not be possible without further hack using frame['iframe name'].document
						});

						if(options.upload.callbacks){
							_.each(options.upload.callbacks, function(f, e){
								this.$el.bind('fileupload' + e, _.bind(f, this));
							}, this);
						}
					};
					
					_.extend(this.actions, {
						//2. implement [clear] button action
						clear: function(){
							this.setVal('', true);
						},
						//3. implement [upload] button action
						upload: function(){
							var that = this;
							this.upload(_.extend({
								//stub success callback:
								success: function(reply){
									that.ui.result.html(_.isString(reply)?reply.i18n():JSON.stringify(reply));
									_.delay(function(){
										that.ui.result.empty();
									}, 6000);
								}
							}, options.upload));
						}
					});

					//unique editor api
					this.upload = function(config){
						config = _.extend({}, options.upload, config);
						//fix the formData value
						if(config.formData) 
							config.formData = _.result(config, 'formData');
						
						//fix the url with app.config.baseAjaxURI
						if(app.config.baseAjaxURI)
							config.url = [app.config.baseAjaxURI, config.url].join('/');

						//send the file(s) through fileupload plugin.
						this.$el.fileupload('send', _.extend({
							timeout: app.config.timeout * 2,
							fileInput: this.ui.input,
						}, config));
					};

				}

			},

			isEnabled: function(){
				return !this._inactive;
			},
			
			disable: function(flag){

				if(flag === false){
					this._inactive = false;
				}else {
					this._inactive = true;
				}

				if(_.isUndefined(flag)){
					//disable but visible, will not participate in validation
					if(this.ui.input)
						this.ui.input.prop('disabled', true);
					return;
				}

				if(flag){
					//hide and will not participate in validation
					this.$el.hide();
				}else {
					//shown and editable
					if(this.ui.input)
						this.ui.input.prop('disabled', false);
					this.$el.show();
				}
			},

			setVal: function(val, loud){
				if(this.ui.inputs){
					//radios/checkboxes
					this.ui.inputs.find('input').val(_.isArray(val)?val:[val]);
				}else if(this.ui['input-ro']){
					val = _.escape(val);
					this.ui['input-ro'].data('value', val).html(val);
				}else {
					if(this.model.get('type') === 'checkbox'){
						this.ui.input.prop('checked', val === this.model.get('checked'));
					}
					this.ui.input.val(val);
				}
				if(loud) {
					this._triggerEvent({type: 'change'});
				}
			},

			getVal: function(){
				if(!this.isEnabled()) return; //skip the disabled ones.

				if(this.ui.inputs){
					//radios/checkboxes
					var result = this.$('input:checked').map(function(el, index){
						return $(this).val();
					}).get();
					if(this.model.get('type') === 'radio') result = result.pop();
					return result;
				}else {
					if(this.model.get('type') === 'checkbox'){
						return this.ui.input.prop('checked')? (this.model.get('checked') || true) : (this.model.get('unchecked') || false);
					}
					if(this.ui.input)
						return this.ui.input.val();
					
					//skipping input-ro field val...
				}
			},

			validate: $.noop,

			status: function(options){
			//options: 
			//		- false/undefined: clear status
			//		- object: {
			//			type:
			//			msg:
			//		}
			//		- string: error msg

				//set or clear status of this editor UI
				if(options){

					var type = 'error', msg = options;
					if(!_.isString(options)){
						type = options.type || type;
						msg = options.msg || type;
					}

					//set warning, error, info, success... msg type, no checking atm.
					var className = 'has-' + type;
					this.$el
						.removeClass(this.$el.data('type-class'))
						.addClass(className)
						.data('type-class', className);
					this.ui.msg.html(msg.i18n());

				}else {
					//clear
					this.$el
						.removeClass(this.$el.data('type-class'))
						.removeData('type-class');
					this.ui.msg.empty();
				}
			}

		});

		UI.supported = {
			'ro': true,
			'text': true,
			'textarea': true,
			'select': true,
			'file': true,
			'checkboxes': true,
			'checkbox': true,
			'radios': true,
			'hidden': true,
			'password': true,
			//h5 only (use Modernizr checks)
			'number': Modernizr.inputtypes.number,
			'range': Modernizr.inputtypes.range,
			'email': Modernizr.inputtypes.email,
			'tel': Modernizr.inputtypes.tel,
			'search': Modernizr.inputtypes.search,
			'url': Modernizr.inputtypes.url,
			'color': Modernizr.inputtypes.color,
			'time': Modernizr.inputtypes.time,
			'date': Modernizr.inputtypes.date,
			'datetime': Modernizr.inputtypes.datetime,
			'datetime-local': Modernizr.inputtypes['datetime-local'],
			'month': Modernizr.inputtypes.month,
			'week': Modernizr.inputtypes.week,
		};

		return UI;

	});



	app.Util.Tpl.build('editor-basic-tpl', [
		'{{#if label}}',
			'<label class="control-label {{#if layout}}{{layout.label}}{{/if}}" for="{{uiId}}">{{i18n label}}</label>',
		'{{/if}}',
		'<div class="{{#if layout}}{{layout.field}}{{/if}}" data-toggle="tooltip" title="{{i18n tooltip}}">', //for positioning with the label.

			//1. select
			'{{#is type "select"}}',
				'<select ui="input" name="{{#if fieldname}}{{fieldname}}{{else}}{{name}}{{/if}}" class="form-control" id="{{uiId}}" {{#if multiple}}multiple="multiple"{{/if}} style="margin-bottom:0">',
					'{{#if options.grouped}}',
						'{{#each options.data}}',
						'<optgroup label="{{i18n @key}}">',
							'{{#each this}}',
							'<option value="{{value}}">{{i18n label}}</option>',
							'{{/each}}',
						'</optgroup>',
						'{{/each}}',
					'{{else}}',
						'{{#each options.data}}',
						'<option value="{{value}}">{{i18n label}}</option>',
						'{{/each}}',
					'{{/if}}',
				'</select>',
			'{{else}}',
				//2. textarea
				'{{#is type "textarea"}}',
					'<textarea ui="input" name="{{#if fieldname}}{{fieldname}}{{else}}{{name}}{{/if}}" class="form-control" id="{{uiId}}" rows="{{rows}}" placeholder="{{i18n placeholder}}" style="margin-bottom:0"></textarea>',
				'{{else}}',
					//3. input
					//checkboxes/radios
					'{{#if options}}',
						'<div ui="inputs">',
						'{{#each options.data}}',
							'<div class="{{../type}} {{#if ../options.inline}}{{../type}}-inline{{/if}}">',
								//note that the {{if}} within a {{each}} will no longer impose +1 level down in the content scope. (after Handlebars v4)
								'<input id="{{../uiId}}-{{@index}}" ui="input" name="{{#if ../fieldname}}{{../fieldname}}{{else}}{{../name}}{{/if}}{{#is ../type "checkbox"}}[]{{/is}}" type="{{../type}}" value={{value}}> ',
								'<label for="{{../uiId}}-{{@index}}">{{i18n label}}</label>',
							'</div>',
						'{{/each}}',
						'</div>',
					//single field
					'{{else}}',
						'<div class="{{type}}">',
						'{{#is type "checkbox"}}',
							//single checkbox
							'<input id="{{uiId}}" ui="input" name="{{#if fieldname}}{{fieldname}}{{else}}{{name}}{{/if}}" type="checkbox" value="{{value}}"> ',
							'<label for="{{uiId}}">{{i18n boxLabel}}</label>',
						'{{else}}',
							//normal field
							'{{#is type "ro"}}',//read-only
								'<div ui="input-ro" data-value="{{{value}}}" class="form-control-static">{{value}}</div>',
							'{{else}}',
								'<input ui="input" name="{{#if fieldname}}{{fieldname}}{{else}}{{name}}{{/if}}" {{#isnt type "file"}}class="form-control"{{else}} style="display:inline;" {{/isnt}} type="{{type}}" id="{{uiId}}" placeholder="{{i18n placeholder}}" value="{{value}}"> <!--1 space-->',
								'{{#is type "file"}}',
									'<span action="upload" class="hidden file-upload-action-trigger" ui="upload" style="cursor:pointer;"><i class="glyphicon glyphicon-upload"></i> <!--1 space--></span>',
									'<span action="clear" class="hidden file-upload-action-trigger" ui="clearfile"  style="cursor:pointer;"><i class="glyphicon glyphicon-remove-circle"></i></span>',
									'<span ui="result" class="file-upload-result wrapper-horizontal"></span>',
								'{{/is}}',							
							'{{/is}}',
						'{{/is}}',
						'</div>',	
					'{{/if}}',
				'{{/is}}',
			'{{/is}}',

			//msg & help
			'{{#if help}}<span class="help-block editor-help-text" style="margin-bottom:0"><small>{{i18n help}}</small></span>{{/if}}',
			'<span class="help-block editor-status-text input-error" ui="msg">{{i18n msg}}</span>',
		'</div>'
	]);

})(Application);