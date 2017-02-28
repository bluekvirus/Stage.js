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
 * (all editor:* events require manual .listenTo to catch, there is no meta event nor triggerMethod for e-name and method mapping)
 * ======
 * editor:change (self)
 * editor:keyup (self)
 * editor:focusin/out (self)
 * view:editor-changed (parentCt) -- change
 * view:editor-e (parentCt) -- keyup, focusin/out
 *
 *
 * @author Tim Lauv
 * @contributor Yan Zhu, Patrick Zhu, Andy Fan
 * @created 2013.11.10
 * @updated 2014.02.26 [Bootstrap 3.1+]
 * @updated 2015.12.07 [awesome-bootstrap-checkbox & radio]
 * @updated 2016.11.16
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
				//Caveat: .trigger is basic Backbone.EE method (so require manual .listenTo to catch), different than .triggerMethod which is Marionette and auto calls method by camelized event name.
				host.trigger('editor:' + e.type, this.model.get('name'), this);
				//host.trigger('editor:' + e.type + ':' + this.model.get('name'), this);

				if(this.parentCt){
					if(e.type == 'change')
						this.parentCt.trigger('view:editor-changed', this.model.get('name'), this);
					else
						this.parentCt.trigger('view:editor-' + e.type, this.model.get('name'), this);
				}
			},

			initialize: function(options){
				var that = this;
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
				this.model = app.model({
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
					//specifically for a range field:
					min: _.isNumber(options.min) ? options.min : 0,
					max: _.isNumber(options.max) ? options.max : 100,
					step: options.step || 1,
					unitLabel: options.unitLabel || '',
					//specifically for a single checkbox field:
					boxLabel: options.boxLabel || '',
					value: options.value,
					checked: options.checked || true,
					unchecked: options.unchecked || false,
					//specifically for date
					startDate: options.startDate || (function(){ var today = new Date(); d = today.getDate(); m = today.getMonth() + 1; y = today.getFullYear(); return m + '/' + d + '/' + y;})(),
					hidden: options.hidden || false,
					//specifically for time
					startTime: options.startTime || (function(){ return new Date().toLocaleTimeString().split(' ')[0];})(), //hh:mm:ss
					startPeriod: (options.startPeriod && options.startPeriod.toLowerCase()) || (function(){ return new Date().toLocaleTimeString().split(' ')[1];})(), //am or pm
				}, true);
				//mark view name to be Basic.type.name (more specific than just Basic)
				this._name = [this.name, options.type, options.name].join('.');

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
						var that = this;

						this.$el.fileupload({
							fileInput: null, //-remove the plugin's 'change' listener to delay the add event.
							//forceIframeTransport: true, //-note that if iframe is used, error/fail callback will not be possible without further hack using frame['iframe name'].document
						});

						if(options.upload.callbacks){
							_.each(options.upload.callbacks, function(f, e){
								this.$el.bind('fileupload' + e, _.bind(f, this));
							}, this);
						}
						
						//Note: bind events with callback functions here will not overridden user defined callbacks
						//reset progress bar width and show progress bar
						this.$el.bind('fileuploadstart', function(e, data){
							//reset the width of progress bar
							that.$el.find('.progress-bar').css({
								width: '0%'
							});
							//show progress bar
							that.$el.find('.progress').removeClass('hidden');
						});

						//for updating progress bar
						this.$el.bind('fileuploadprogress', function(e, data){
							var progress = parseInt(data.loaded / data.total * 100);
							that.$el.find('.progress-bar').css({
								width: progress + '%'
							});
						});
						
						//for hidding progress bar
						this.$el.bind('fileuploadalways', function(){
							//hide progress bar after 6 seconds, same as result message
							_.delay(function(){
								that.$el.find('.progress').addClass('hidden');
							}, 6000);
						});
					};

					_.extend(this.actions, {
						//2. implement [clear] button action
						clear: function(){
							this.setVal('', true);
						},
						//3. implement [upload] button action
						upload: function(){
							var that = this;
							//hide upload and cancel botton, once upload is clicked
							this.ui.upload.addClass('hidden').hide();
							this.ui.clearfile.addClass('hidden').hide();

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

						//fix the url with app.config.baseAjaxURI (since form uploading counts as data api)
						if(app.config.baseAjaxURI)
							config.url = [app.config.baseAjaxURI, config.url].join('/');

						//send the file(s) through fileupload plugin.
						this.$el.fileupload('send', _.extend({
							timeout: app.config.timeout * 2,
							fileInput: this.ui.input,
						}, config));
					};

				//prep current value display if type === 'range'
				}else if(options.type === 'range'){
					this.listenTo(this, 'view:show editor:change', function(e){
						if(options.label && this.ui.input.val() !== undefined){
								this.ui.currentVal.text(this.ui.input.val() + (options.unitLabel || ''));
								this.ui.currentValPostfix.text('\u00A0' + ("(current value)".i18n()));
						}
					});
				}
				//specified logical if type === 'date'
				else if(options.type === 'date'){
					//enable action tag before extending actions
					this._enableActionTags('Editor.Date');

					//set up initial month and day value
					this.onRender = function(){
						//get startDate from model
						var startDate = this.model.get('startDate');

						//show the initial date
						this.ui['date-currentvalue'].text(startDate);

						//give year and month selector, initial value.
						//month is date[0], day is date[1] and year is date[2]
						var date = startDate.split('/');
						this.ui.year.text(date[2]);
						this.ui.month.text(date[0]);
						
						//insert days
						this.calDaysLayout(date[2], date[0]);

						//register a click event if hidden is true
						if(options.hidden){
							this.ui['date-currentvalue'].on('click', function(){
								that.$el.find('.date-selector').toggleClass('hidden');
								that.$el.find('.date-arrow-holder').toggleClass('hidden');
							});
						}
					};

					//extend actions
					_.extend(this.actions, {
						'year-decrease': function(){
							this.ui.year.text(parseInt(this.ui.year.text()) - 1);
							//trigger update event
							this.trigger('date-editor:update');
						},
						'year-increase': function(){
							this.ui.year.text(parseInt(this.ui.year.text()) + 1);
							//trigger update event
							this.trigger('date-editor:update');
						},
						'month-decrease': function(){
							if(parseInt(this.ui.month.text()) > 1){
								var temp = parseInt(this.ui.month.text()) - 1;
								this.ui.month.text(temp);
								//temp < 10 ? this.ui.month.text('0' + temp) : this.ui.month.text(temp);
							}else{
								//if it is already January, then loop back to December
								this.ui.month.text(12);
							}
							//trigger update event
							this.trigger('date-editor:update');
						},
						'month-increase': function(){
							if(parseInt(this.ui.month.text()) < 12){
								var temp = parseInt(this.ui.month.text()) + 1;
								this.ui.month.text(temp);
								//temp < 10 ? this.ui.month.text('0' + temp) : this.ui.month.text(temp);
							}else{
								//if it is already December, then loop back to Jan
								this.ui.month.text(1);
							}
							//trigger update event
							this.trigger('date-editor:update');
						}
					});

					//register listen event to listen editor change
					this.listenTo(this, 'date-editor:update', function(){
						//call calculate layout
						this.calDaysLayout(this.ui.year.text(), this.ui.month.text());
					});
					
					//function for calculating the days selector layout
					this.calDaysLayout = function(y/*string*/, m/*string*/){

						var that = this;

						var year = parseInt(y),
							month = parseInt(m),
							firstDay = 1, //calculate the weekday of the first day of the month.
							lastDay,
							lastPrevious; //store the lastday for the previous month
						
						//array indicates how many days in a perticular month
						//element[0] saved for Feb. of leap years, for easier accessing using index.
						var monthDays = [29/*Feb. Leap Year*/, 31/*Jan*/, 28/*Feb*/, 31/*Mar*/, 30/*Apr.*/, 31/*May*/, 30/*Jun*/, 31/*Jul*/, 31/*Aug*/, 30/*Sep*/, 31/*Oct*/, 30/*Nov*/, 31/*Dec*/];

						//calculate the last day for the current month
						if(month !== 2){
							lastDay = monthDays[month];
						}else{
							//check leap year or not
							(year % 4 === 0 || (year % 100 === 0 && year % 400 === 0)) ? lastDay = monthDays[0] : lastDay = monthDays[2];
						}

						//calculate the last day for the previous month
						if(month !== 3)
							if(month !== 1)
								lastPrevious = monthDays[month - 1];
							else
								lastPrevious = monthDays[12];
						else{
							//check leap year or not
							(year % 4 === 0 || (year % 100 === 0 && year % 400 === 0)) ? lastPrevious = monthDays[0] : lastPrevious = monthDays[2];
						}

						//calculate what is the weekday for the first day and the last day
						var firstWeekDay = this.calWeekDay(year, month, firstDay);
						var lastWeekDay = this.calWeekDay(year, month, lastDay);

						//clean current content
						this.$el.find('.date-selector-days .days-holder').empty();

						//insert the tail for last month first
						var firstPrevious = lastPrevious - firstWeekDay + 1,
							i;
						for(i = firstPrevious; i <= lastPrevious; i++){
							this.$el.find('.date-selector-days .days-holder').append('<div class="day-holder non-current">' + i + '</div>');
						}

						//insert current month
						for(i = firstDay; i <= lastDay; i++){
							this.$el.find('.date-selector-days .days-holder').append('<div class="day-holder current">' + i + '</div>');
						}

						//insert the head for next month
						var lastNext = 7 - lastWeekDay - 1;
						if(lastWeekDay < 6){//insert only when needed
							for(i = 1; i <= lastNext; i++){
								this.$el.find('.date-selector-days .days-holder').append('<div class="day-holder non-current">' + i + '</div>');
							}
						}

						//Highlight the current selected date
						var current = this.ui['date-currentvalue'].text().split('/');
						if(this.ui.year.text() === current[2] && this.ui.month.text() === current[0]){//highlight only when necessary
							_.each(this.$el.find('.day-holder.current'), function(el){
								var $el = $(el);
								if($el.text() === current[1])
									$el.addClass('active');
							});
						}

						//register click event for choosing date
						this.$el.find('.day-holder.current').on('click', function(){
							var $this = $(this);
							//change color to indicator the chosen day
							$this.siblings().removeClass('active');
							$this.addClass('active');
							//update date value in the ui="input"
							var y = that.ui.year.text(),
								m = that.ui.month.text(),
								d = $this.text();
							that.ui['date-currentvalue'].text(m + '/' + d + '/' + y);

							//if options hidden is true, after every selection hide the selector panel
							if(options.hidden){
								that.$el.find('.date-selector').addClass('hidden');
								that.$el.find('.date-arrow-holder').addClass('hidden');
							}
						});

					};

					//function for calculating the weekday for a particular date
					this.calWeekDay = function(year, month, day){
						//calculating weekday for first day of the month by using *Zeller* formula.
						//That is, w = y + [y / 4]  + [c / 4] - 2 * c + [26 * (m + 1) / 10] + d - 1
						//If month is Jan or Feb, it should be considered as the 13th and 14th month
						//of the previous year. For example: 2017/1/1 should be treated as 2016/13/1.
						
						var y = year % 100, //get last two digit of year
							c = Math.floor(year / 100), //get centry - 1, which is just the first two digit of the year., 
							d = day,
							m, w;

						(month === 1 || month === 2) ? ( --y && (month === 1) ? m = 13 : m = 14) : m = month;

						w = y + Math.floor(y / 4) + Math.floor(c / 4) - 2 * c + Math.floor(26 * (m + 1) / 10) + d - 1;

						w = w % 7; //%7 to calculate the weekday

						return w; //0 is Sunday, 1 is Monday and so on...

					};
				}
				//specified logic if type === 'time'
				else if(options.type === 'time'){
					//enable action tag before extending actions
					this._enableActionTags('Editor.Time');

					this.onRender = function(){
						//get initial values
						var startTime = this.model.get('startTime'),
							period = this.model.get('startPeriod'),
							temp, hour, minute, second;

						//check type of the startTime, it can be number(milliseconds) or string(hh:mm:ss)
						if(_.isString(startTime)){
							
							//assert
							if(!_.contains(startTime, ':'))
								throw new Error('Dev::Editor.Time::the given startTime is inValid.');

							//turn strings into numbers
							temp = _.map(startTime.split(':'), function(str){ return parseInt(str); });
							
						}else{

							//translate milliseconds to standard time. *Note*: supported by IE9+ and all other modern browsers
							temp = new Date(startTime).toISOString().slice(11, 19);
							
							//turn string into numbers
							temp = _.map(temp.split(':'), function(str){ return parseInt(str); });

							//standard form are in 24 hour mode, switch it to 12 hour mode
							if( temp[0] > 12 ){
								temp[0] = temp[0] - 12;
								period = 'pm';
							}else{
								period = 'am';
							}
						}

						hour = temp[0];
						minute = temp[1];
						second = temp[2];

						//assert
						if(hour < 1 || hour > 12 || minute < 0 || minute > 59 || second < 0 || second > 59)
							throw new Error('Dev::Editor.Time::the given startTime is inValid.');
						
						//fill number
						this.fillNum(hour, minute, second);

						//assert
						if(period !== 'am' && period !== 'pm')
							throw new Error('Dev::Editor.Time::the given periods inValid.');
						//active period
						(period === 'am') ? this.$el.find('.am-holder').addClass('active') : this.$el.find('.pm-holder').addClass('active');
					};

					_.extend(this.actions, {
						'hour-increase': function(){
							var hour = parseInt(this.$el.find('.time-hour-holder .left-number .value').text() + this.$el.find('.time-hour-holder .right-number .value').text());
							if( ++hour === 13) hour = 1;
							this.fillNum(hour);
						},
						'hour-decrease': function(){
							var hour = parseInt(this.$el.find('.time-hour-holder .left-number .value').text() + this.$el.find('.time-hour-holder .right-number .value').text());
							if( --hour === 0) hour = 12;
							this.fillNum(hour);
						},
						'minute-increase': function(){
							var minute = parseInt(this.$el.find('.time-minute-holder .left-number .value').text() + this.$el.find('.time-minute-holder .right-number .value').text());
							if( ++minute === 60) minute = 0;
							this.fillNum(undefined, minute);
						},
						'minute-decrease': function(){
							var minute = parseInt(this.$el.find('.time-minute-holder .left-number .value').text() + this.$el.find('.time-minute-holder .right-number .value').text());
							if( --minute === -1) minute = 59;
							this.fillNum(undefined, minute);
						},
						'second-increase': function(){
							var second = parseInt(this.$el.find('.time-second-holder .left-number .value').text() + this.$el.find('.time-second-holder .right-number .value').text());
							if( ++second === 60) second = 0;
							this.fillNum(undefined, undefined, second);
						},
						'second-decrease': function(){
							var second = parseInt(this.$el.find('.time-second-holder .left-number .value').text() + this.$el.find('.time-second-holder .right-number .value').text());
							if( --second === -1) second = 59;
							this.fillNum(undefined, undefined, second);
						},
						'select-am': function(){
							this.$el.find('.pm-holder').removeClass('active');
							this.$el.find('.am-holder').addClass('active');
						},
						'select-pm': function(){
							this.$el.find('.am-holder').removeClass('active');
							this.$el.find('.pm-holder').addClass('active');
						}
					});


					//function for fill up the numbers
					this.fillNum = function(hour/*number*/, minute/*number*/, second/*number*/){
						//setup initial value in template'
						if(hour !== undefined)
							(hour < 10) ? (this.$el.find('.time-hour-holder .left-number .value').text(0) && this.$el.find('.time-hour-holder .right-number .value').text(hour))
										: (this.$el.find('.time-hour-holder .left-number .value').text(Math.floor(hour / 10)) && this.$el.find('.time-hour-holder .right-number .value').text(hour % 10));
						if(minute !== undefined)
							(minute < 10) ? (this.$el.find('.time-minute-holder .left-number .value').text(0) && this.$el.find('.time-minute-holder .right-number .value').text(minute))
										: (this.$el.find('.time-minute-holder .left-number .value').text(Math.floor(minute / 10)) && this.$el.find('.time-minute-holder .right-number .value').text(minute % 10));
						if(second !== undefined)
							(second < 10) ? (this.$el.find('.time-second-holder .left-number .value').text(0) && this.$el.find('.time-second-holder .right-number .value').text(second))
										: (this.$el.find('.time-second-holder .left-number .value').text(Math.floor(second / 10)) && this.$el.find('.time-second-holder .right-number .value').text(second % 10));
					};
				}
			},

			isEnabled: function(){
				return !this._inactive;
			},

			disable: function(flag){

				if(flag === false){
					this._inactive = false;

					if(this.ui['input-date']){//for date editor
						this.ui['input-date'].overlay(false);
					}else if(this.ui['input-time']){//for date editor
						this.ui['input-time'].overlay(false);
					}

				}else {
					this._inactive = true;
				}

				if(_.isUndefined(flag)){
					//disable but visible, will not participate in validation
					if(this.ui.input)
						this.ui.input.prop('disabled', true);
					else if(this.ui['input-date']){//for date editor
						//use overlay to block users' interaction
						this.ui['input-date'].overlay({
							content: '<div> </div>',
							effect: false,
							background: 'rgba(0, 0, 0, 0.1)',
						});
					}
					else if(this.ui['input-time']){//for time editor
						//use overlay to block users' interaction
						this.ui['input-time'].overlay({
							content: '<div> </div>',
							effect: false,
							background: 'rgba(0, 0, 0, 0.1)',
						});
					}
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
				}else if(this.ui['input-date']){//for date editor
					/**
					 * The setVal for date editor can be two types of values
					 * 1). number: represents the milliseconds of a date
					 * 2). string: standard form of date 'mm/dd/yyyy', *Note*: Do not add 0 before a single digit number.
					 */
					var date, month, day, year;
					
					//Note: This kind of check is for the case that number 0 evaluates to false in JS
					if((val !== 0 && !val) || (_.isNumber(val) && val < 0))
							throw new Error('Dev::Editor.Date::arguments for setVal is inValid.');

					//check the type of val
					if(_.isString(val)){//standard form

						//validate the input string
						date = val.split('/');
						month = parseInt(date[0]);
						day = parseInt(date[1]);
						year = parseInt(date[2]);

						if(month > 12 || month < 1){//check month
							throw new Error('Dev::Editor.Date::arguments for setVal is inValid.');
						}else{//check day
							var monthDays = [29/*Feb. Leap Year*/, 31/*Jan*/, 28/*Feb*/, 31/*Mar*/, 30/*Apr.*/, 31/*May*/, 30/*Jun*/, 31/*Jul*/, 31/*Aug*/, 30/*Sep*/, 31/*Oct*/, 30/*Nov*/, 31/*Dec*/];

							if(month !== 2 && (day < 1 || day > monthDays[month])){
								throw new Error('Dev::Editor.Date::month arguments for setVal is inValid.');
							}else{
								//check leap year or not
								if(year % 4 === 0 || (year % 100 === 0 && year % 400 === 0)){//leap year
									if((day < 1 || day > monthDays[0]))
										throw new Error('Dev::Editor.Date::day arguments for setVal is inValid.');
								}else{
									if((day < 1 || day > monthDays[2]))
										throw new Error('Dev::Editor.Date::day arguments for setVal is inValid.');
								}
							}
						}

						//update the input value
						this.ui['date-currentvalue'].text(val);
						this.ui.year.text(year);
						this.ui.month.text(month);
						//trigger update event for day selector
						this.calDaysLayout(year, month);

					}else{//milliseconds

						date = new Date(val);
						month = date.getMonth() + 1; //JS month starts from 0
						day = date.getDate();
						year = date.getFullYear();

						//update the input value
						this.ui['date-currentvalue'].text(month + '/' + day + '/' + year);
						this.ui.year.text(year);
						this.ui.month.text(month);
						//trigger update event for day selector
						this.calDaysLayout(year, month);						

					}
				}else if(this.ui['input-time']){//for time edtior
					/**
					 * setVal can take two types of value
					 * 1). number: time in milliseconds
					 * 2). string: with the style of 'hh:mm:ss am/pm'
					 */

					//Note: This kind of check is for the case that number 0 evaluates to false in JS
					if((val !== 0 && !val) || (_.isNumber(val) && val < 0))
							throw new Error('Dev::Editor.Time::arguments for setVal is inValid.');

					var temp, hour, minute, second, period;

					if(_.isString(val)){

						temp = _.map((val.split(' ')[0]).split(':'), function(str){ return parseInt(str); });
						period = val.split(' ')[1];

					}else{
						//translate milliseconds to standard time. *Note*: supported by IE9+ and all other modern browsers
						temp = new Date(val).toISOString().slice(11, 19);
						
						//turn string into numbers
						temp = _.map(temp.split(':'), function(str){ return parseInt(str); });

						//stanard form are in 24 hour mode, switch it to 12 hour mode
						if( temp[0] > 12 ){
							temp[0] = temp[0] - 12;
							period = 'pm';
						}else if(temp[0] === 0){
							temp[0] = 12;
							period = 'am';
						}else{
							period = 'am';
						}
					}

					hour = temp[0];
					minute = temp[1];
					second = temp[2];

					//assert
					if(hour < 1 || hour > 12 || minute < 0 || minute > 59 || second < 0 || second > 59)
						throw new Error('Dev::Editor.Time::the given startTime is inValid');
					
					//fill number
					this.fillNum(hour, minute, second);

					//assert
					period = period.toLowerCase();
					if(period !== 'am' && period !== 'pm')
						throw new Error('Dev::Editor.Time::the given periods inValid.');
					//active period
					(period === 'am') ? this.$el.find('.pm-holder').removeClass('active') && this.$el.find('.am-holder').addClass('active') 
										: this.$el.find('.am-holder').removeClass('active') && this.$el.find('.pm-holder').addClass('active');

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

			getVal: function(flag/*boolean, for date editor only*/){
				if(!this.isEnabled()) return; //skip the disabled ones.

				if(this.ui.inputs){
					//radios/checkboxes
					var result = this.$('input:checked').map(function(el, index){
						return $(this).val();
					}).get();
					if(this.model.get('type') === 'radio') result = result.pop();
					return result;
				}else if(this.ui['input-date']){//for date editor
					if(flag){
						var date = new Date(this.ui['date-currentvalue'].text());
						//convert date to milliseconds
						return date.getTime();
					}else{
						return this.ui['date-currentvalue'].text();
					}
				}else if(this.ui['input-time']){//for time editor
					var hour, minute, second, period;

					hour = this.$el.find('.time-hour-holder .left-number .value').text() + this.$el.find('.time-hour-holder .right-number .value').text();
					minute = this.$el.find('.time-minute-holder .left-number .value').text() + this.$el.find('.time-minute-holder .right-number .value').text();
					second = this.$el.find('.time-second-holder .left-number .value').text() + this.$el.find('.time-second-holder .right-number .value').text();
					period = this.$el.find('.single-period-holder.active').text();
					return hour + ':' + minute + ':' + second + ' ' + period;
				}else {
					if(this.model.get('type') === 'checkbox'){
						return this.ui.input.prop('checked')? (this.model.get('checked') || true) : (this.model.get('unchecked') || false);
					}
					if(this.ui.input)
						return this.ui.input.val();

					//skipping input-ro field val...
				}
			},

			//forged upon initialize()
			validate: _.noop,

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
			
			//framework built-in
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
			'range': true,
			'date': true,
			'time': true,

			//not implemented, h5 native only (use Modernizr checks)
			'search': Modernizr.inputtypes.search,
			'color': Modernizr.inputtypes.color,
			'number': Modernizr.inputtypes.number,
			//'range': Modernizr.inputtypes.range,
			'email': Modernizr.inputtypes.email,
			'tel': Modernizr.inputtypes.tel,
			'url': Modernizr.inputtypes.url,
			//'time': Modernizr.inputtypes.time,
			//'date': Modernizr.inputtypes.date,
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
								'{{#is type "range"}}',
									'<div class="clearfix">',
										'{{#if label}}',
											'<span ui="currentVal"></span><span ui="currentValPostfix" class="text-muted"></span>',
										'{{/if}}',
										'<input id="{{uiId}}" ui="input" name="{{#if fieldname}}{{fieldname}}{{else}}{{name}}{{/if}}" type="range" value="{{value}}" min="{{min}}" max="{{max}}" step="{{step}}">',
										'<span class="pull-left">{{min}}{{unitLabel}}</span>',
										'<span class="pull-right">{{max}}{{unitLabel}}</span>',
									'</div>',
								'{{else}}',
									'{{#is type "file"}}',
										'<div class="clearfix">',
											'<input ui="input" name="{{#if fieldname}}{{fieldname}}{{else}}{{name}}{{/if}}" style="display:inline;" type="{{type}}" id="{{uiId}}" placeholder="{{i18n placeholder}}" value="{{value}}"> <!--1 space-->',
											'<span action="upload" class="hidden file-upload-action-trigger" ui="upload" style="cursor:pointer;"><i class="glyphicon glyphicon-upload"></i> <!--1 space--></span>',
											'<span action="clear" class="hidden file-upload-action-trigger" ui="clearfile"  style="cursor:pointer;"><i class="glyphicon glyphicon-remove-circle"></i></span>',
											'<span ui="result" class="file-upload-result wrapper-horizontal"></span>',
										'</div>',
										'<div class="hidden {{#if fieldname}}{{fieldname}}{{else}}{{name}}{{/if}}-progress-bar progress progress-striped active">',
											'<div class="progress-bar"></div>',
										'</div>',
									'{{else}}',
										'{{#is type "date"}}',
											'<div ui="input-date" id="{{uiId}}" name="{{#if fieldname}}{{fieldname}}{{else}}{{name}}{{/if}}" class="date-editor-holder">',
												'<div ui="date-currentvalue" class="date-currentvalue form-control"><span></span></div>',//form control is for same appearance as other editors
												'<div class="date-arrow-holder {{#if hidden}}hidden{{/if}}">',
													'<div class="date-arrow"></div>',
												'</div>',
												'<div class="date-selector {{#if hidden}}hidden{{/if}}">',
													'<div class="row">',
														'<div class="date-selector-year col-xs-6 text-center">',
															'<span action="year-decrease" class="left-arrow"><i class="fa fa-caret-left"></i></span>',
															'<span ui="year" class="year-value"></span>',
															'<span action="year-increase" class="right-arrow"><i class="fa fa-caret-right"></i></span>',
														'</div>',
														'<div class="date-selector-month col-xs-6 text-center">',
															'<span action="month-decrease" class="left-arrow"><i class="fa fa-caret-left"></i></span>',
															'<span ui="month" class="month-value"></span>',
															'<span action="month-increase" class="right-arrow"><i class="fa fa-caret-right"></i></span>',
														'</div>',
													'</div>',
													'<div ui="days" class="date-selector-days">',
														'<div class="weekday-holder clearfix">',
															'<div class="day-holder day-name">Sun.</div>',
															'<div class="day-holder day-name">Mon.</div>',
															'<div class="day-holder day-name">Tue.</div>',
															'<div class="day-holder day-name">Wed.</div>',
															'<div class="day-holder day-name">Thu.</div>',
															'<div class="day-holder day-name">Fri.</div>',
															'<div class="day-holder day-name">Sat.</div>',
														'</div>',
														'<div class="days-holder clearfix"></div>',
													'</div>',
												'</div>',
											'</div>',
										'{{else}}',
											'{{#is type "time"}}',
												'<div ui="input-time" class="time-editor-holder clearfix" id="{{uiId}}" name="{{#if fieldname}}{{fieldname}}{{else}}{{name}}{{/if}}">',
													'<div class="time-hour-holder wrapper-horizontal">',
														'<div class="upper-arrow-holder text-center">',
															'<span action="hour-increase"><i class="fa fa-caret-up"></i></span>',
														'</div>',
														'<div class="number-holder clearfix">',
															'<div class="left-number">',
																'<div class="value">',
																	'<span>-</span>',
																'</div>',
															'</div>',
															'<div class="right-number">',
																'<div class="value">',
																	'<span>-</span>',
																'</div>',
															'</div>',
														'</div>',
														'<div class="lower-arrow-holder text-center">',
															'<span action="hour-decrease"><i class="fa fa-caret-down"></i></span>',
														'</div>',
													'</div>',
													'<div class="colon-divider">',
														'<span>:</span>',
													'</div>',
													'<div class="time-minute-holder wrapper-horizontal">',
														'<div class="upper-arrow-holder text-center">',
															'<span action="minute-increase"><i class="fa fa-caret-up"></i></span>',
														'</div>',
														'<div class="number-holder clearfix">',
															'<div class="left-number">',
																'<div class="value">',
																	'<span>-</span>',
																'</div>',
															'</div>',
															'<div class="right-number">',
																'<div class="value">',
																	'<span>-</span>',
																'</div>',
															'</div>',
														'</div>',
														'<div class="lower-arrow-holder text-center">',
															'<span action="minute-decrease"><i class="fa fa-caret-down"></i></span>',
														'</div>',
													'</div>',
													'<div class="colon-divider">',
														'<span>:</span>',
													'</div>',
													'<div class="time-second-holder wrapper-horizontal">',
														'<div class="upper-arrow-holder text-center">',
															'<span action="second-increase"><i class="fa fa-caret-up"></i></span>',
														'</div>',
														'<div class="number-holder clearfix">',
															'<div class="left-number">',
																'<div class="value">',
																	'<span>-</span>',
																'</div>',
															'</div>',
															'<div class="right-number">',
																'<div class="value">',
																	'<span>-</span>',
																'</div>',
															'</div>',
														'</div>',
														'<div class="lower-arrow-holder text-center">',
															'<span action="second-decrease"><i class="fa fa-caret-down"></i></span>',
														'</div>',
													'</div>',
													'<div class="time-period-holder wrapper-horizontal">',
														'<div class="am-holder single-period-holder" action="select-am">',
															'<div class="text"><span>AM</span></div>',
														'</div>',
														'<div class="pm-holder single-period-holder" action="select-pm">',
															'<div class="text"><span>PM</span></div>',
														'</div>',
													'</div>',
												'</div>',
											'{{else}}',
												'<input ui="input" name="{{#if fieldname}}{{fieldname}}{{else}}{{name}}{{/if}}" class="form-control" type="{{type}}" id="{{uiId}}" placeholder="{{i18n placeholder}}" value="{{value}}"> <!--1 space-->',
											'{{/is}}',
										'{{/is}}',
									'{{/is}}',
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
