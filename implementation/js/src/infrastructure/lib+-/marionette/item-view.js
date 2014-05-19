/**
 * Marionette.ItemView Enhancements (can be used in Layout as well) - Note that you can NOT use these in a CompositeView.
 *
 * 1. SVG (view:fit-paper, view:paper-resized, view:paper-ready)
 * 2. Basic Editors (view as form piece)
 * 3. Render with data (view:render-data, view:data-rendered)
 *
 * @author Tim.Liu
 * @create 2014.02.26
 */

;(function(app){

	/**
	 * Inject a svg canvas within view. - note that 'this' in cb means paper.
	 * Do this in onShow() instead of initialize.
	 */
	_.extend(Backbone.Marionette.ItemView.prototype, {
		enableSVG: function(){
			if(!Raphael) throw new Error('DEV::View::You did NOT have Raphael.js included in the libs.');
			var that = this;

			Raphael(this.el, this.$el.width(), this.$el.height(), function(){
				that.paper = this;
				that.trigger('view:paper-ready', this); // - use this instead of onShow() in the 1st time
				/**
				 * e.g 
				 * onShow(){
				 * 	if(this.paper) draw...;
				 * 	else
				 * 		this.onPaperReady(){ draw... };
				 * }
				 */
			});

			//resize paper (e.g upon window resize event).
			this.onFitPaper = function(){
				if(!this.paper) return;
				this.paper.setSize(this.$el.width(), this.$el.height());
				this.trigger('view:paper-resized');
			}
		}
	});

	/**
	 * Editor Activation - do it in onShow() or onRender()
	 * Turn per field config into real editors.
	 * You can activate editors in any Layout/ItemView object, it doesn't have to be a turnIntoForm() instrumented view.
	 * You can also send a view with activated editors to a form by using addFormPart()[in onShow() or onRender()] it is turn(ed)IntoForm()
	 *
	 * options
	 * -------
	 * _global: general config as a base for all editors, (overriden by individual editor config)
	 * editors: {
	 *  //simple 
	 * 	name: {
	 * 		type: ..., (*required) - basic or registered customized ones
	 * 		label: ...,
	 * 		help: ...,
	 * 		tooltip: ...,
	 * 		placeholder: ...,
	 * 		options: ...,
	 * 		validate: ...,
	 * 		fieldname: ..., optional for collecting values through $.serializeForm()
	 * 		
	 * 		... (see specific editor options in pre-defined/parts/editors/index.js)
	 * 		
	 * 		appendTo: ... - per editor appendTo cfg
	 * 	},
	 * 	...,
	 * 	//compound (use another view as wrapper)
	 * 	name: app.view({
	 * 		template: ...,
	 * 		editors: ...,
	 * 		getVal: ...,
	 * 		setVal: ...,
	 * 		disable: ...,
	 * 		isEnabled: ...,
	 * 		status: ...
	 * 		//you don't need to implement validate() though.
	 * 	}),
	 * }
	 *
	 * This will add *this._editors* to the view object. Do NOT use a region name with region='editors'...
	 * 
	 * Add new: You can repeatedly invoke this method to add new editors to the view.
	 * Remove current: Close this view to automatically clean up all the editors used.
	 *
	 * optionally you can implement setValues()/getValues()/validate() in your view, and that will get invoked by the outter form view if there is one.
	 *
	 * Warning:
	 * activateEditors will not call on editor's onShow method, so don't put anything in it! Use onRender if needs be instead!!
	 * 
	 */
	_.extend(Backbone.Marionette.ItemView.prototype, {

		activateEditors: function(options){
			this._editors = this._editors || {};
			if(this._editors.attachView) throw new Error('DEV::ItemView::activateEditors enhancements will need this._editors object, it is now a Region!');

			var global = options._global || {};
			_.each(options, function(config, name){
				if(name.match(/^_./)) return; //skip _config items like _global

				if(!_.isFunction(config)){
					//0. apply global config
					config = _.extend({name: name, parentCt: this}, global, config);
					//1. instantiate
					config.type = config.type || 'text'; 
					var Editor = app.Core.Editor.map[config.type] || app.Core.Editor.map['Basic'];
					var editor = new Editor(config);					
				}else {
					//if config is a view definition use it directly 
					//(compound editor, e.g: app.view({template: ..., editors: ..., getVal: ..., setVal: ...}))
					var Editor = config;
					config = _.extend({}, global);
					var editor = new Editor();
				}
				
				this._editors[name] = editor.render();
				//2. add it into view (specific, appendTo(editor cfg), appendTo(general cfg), append)
				var $position = this.$('[editor="' + name + '"]');
				if($position.length === 0 && config.appendTo)
					$position = this.$(config.appendTo);
				if($position.length === 0)
					$position = this.$el;
				$position.append(editor.el);
			}, this);

			this.listenTo(this, 'before:close', function(){
				_.each(this._editors, function(editorview){
					editorview.close();
				});
			});

			//If layout enables editors as well, we need to save the layout version of the form fns and invoke them as well.
			var savedLayoutFns = _.pick(this, 'getEditor', 'getValues', 'setValues', 'validate'/*, 'status'*/);
			//0. getEditor(name)
			this.getEditor = function(name){
				return this._editors[name] || (savedLayoutFns.getEditor && savedLayoutFns.getEditor.call(this, name));
			}

			//1. getValues (O(n) - n is the total number of editors on this form)
			this.getValues = function(){
				var vals = (savedLayoutFns.getValues && savedLayoutFns.getValues.call(this)) || {};
				_.each(this._editors, function(editor, name){
					var v = editor.getVal();
					if(v !== undefined && v !== null) vals[name] = v;
				});
				return vals;
			};

			//2. setValues (O(n) - n is the total number of editors on this form)
			this.setValues = function(vals, loud){
				if(!vals) return;
				_.each(this._editors, function(editor, name){
					if(vals[name])
						editor.setVal(vals[name], loud);
				});
				if(savedLayoutFns.setValues) savedLayoutFns.setValues.call(this, vals, loud);
			};

			//3. validate
			this.validate = function(show){
				var errors = (savedLayoutFns.validate && savedLayoutFns.validate.call(this, show)) || {};
				_.each(this._editors, function(editor, name){
					var e = editor.validate(show);
					if(e) errors[name] = e;
				});
				if(_.size(errors) === 0) return;
				return errors; 
			};

			/**
			 * 4. highlight status
			 * status(messages) - indicates that global status is 'error'
			 * or 
			 * status(status, messages) - allow individual editor status overriden
				messages: {
					editor1: 'string 1',
					or
					editor2: {
						status: '...',
						message: '...'
					}
				}
			 */
			this.status = function(status, msgs){
				if(!msgs){
					msgs = status;
					status = 'error';
				}
				if(!msgs) {
					//clear status
					_.each(this._editors, function(editor, name){
						editor.status(' ');
					});
					return;
				}
				if(_.isString(msgs)) throw new Error('DEV::ItemView::activateEditors - You need to pass in messages object');
				_.each(msgs, function(msg, name){

					if(this._editors[name]) {
						if(_.isString(msg)) this._editors[name].status(status, msg);
						else {
							this._editors[name].status(msg.status || status, msg.message);
						}
					} 
				}, this);
			}
			//auto setValues according to this.model?
		}

	});

	/**
	 * Meta-event Listeners (pre-defined)
	 * view:render-data
	 */
	_.extend(Backbone.Marionette.ItemView.prototype, {

		onRenderData: function(data){
			if(!this.model){
				this.model = new Backbone.Model;
				this.listenTo(this.model, 'change', this.render);
			}
			this.model.set(data);

			this.trigger('view:data-rendered');
		}
	})

})(Application);