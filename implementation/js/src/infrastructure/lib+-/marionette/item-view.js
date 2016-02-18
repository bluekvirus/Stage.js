/**
 * Marionette.ItemView Enhancements (can be used in Layout as well) - Note that you can NOT use these in a CompositeView.
 *
 * 1. svg (view:fit-paper, view:paper-resized, view:paper-ready)
 * 2. basic Editors (view as form piece)
 * 3. data <-> render handling 
 *
 * @author Tim Lauv
 * @created 2014.02.26
 * @updated 2015.08.03
 * @updated 2016.02.17
 */

;(function(app){

	//Original M.ItemView render, close (as a Reference here, to be overriden later)
	_.extend(Backbone.Marionette.ItemView.prototype, {

		// Override the default close event to add a few
		// more events that are triggered.
		close: function(_cb) {
		    if (this.isClosed) {
		    	_cb && _cb();
		        return;
		    }

		    this.triggerMethod('item:before:close');
		    Marionette.View.prototype.close.apply(this, arguments);
		    this.triggerMethod('item:closed');
		    _cb && _cb();
		},

		//Editors don't render according to the underlying backbone model.
		_renderTplOrResetEditors: function(){
			if(this._editors){
				this.setValues(this.model.toJSON());
				//note that as a form view, updating data does NOT refresh sub-regional views...
				this.trigger('view:editors-updated');
			}
			else {
				this.render();
				//note that this will re-render the sub-regional views.
				this.trigger('view:data-rendered');
			}
		},
		
		//Set & change the underlying data of the view.
		set: function(){

			if(!this.model){
				this.model = app.model();
			}

			var self = this;

			//check one-way binding
			if(!this._oneWayBound){
				this.listenTo(this.model, 'change', function(){
					self._renderTplOrResetEditors();
				});
				this._oneWayBound = true;			
			}

			//bypassing Model/Collection setup in Backbone.
			if(arguments.length === 1){
				var data = arguments[0];
				if(_.isString(data)){
					this.data = data;
					//to prevent from calling refresh() in initialize()
					return this.isInDOM() && this.refresh();
				}
				else if(_.isArray(data))
					return this.model.set('items', data); 
					//conform to original Backbone/Marionette settings
			}
			return this.model.set.apply(this.model, arguments);
		},

		//Use this instead of this.model.attributes to get the underlying data of the view.
		get: function(){
			if(this._editors){
				if(arguments.length) {
					var editor = this.getEditor.apply(this, arguments);
					if(editor)
						return editor.getVal();
					return;
				}
				return this.getValues();
			}

			if(!this.model) {
				console.warn('DEV::ItemView+::get() You have not yet setup data in view ' + this.name);
				return;
			}
			
			if(arguments.length)
				return this.model.get.apply(this.model, arguments);
			return this.model.toJSON();
		},

		//Reload (if data: url) and re-render the view, or resetting the editors.
		refresh: function(options){
			if(!this.data) return console.warn('DEV::ItemView+::refresh() You must set view.data to use this method.');
			
			this.model && this.model.clear({silent: true});
			if(_.isString(this.data)){
				var self = this;
				return app.remote(this.data, null, options).done(function(d){
					self.set(d);
				});
			}
			else
				return this.model && this.set(this.model.toJSON());
		},

		//Meta-event view:render-data
		onRenderData: function(data){
			this.set(data);
		},

		/**
		 * Inject a svg canvas within view. - note that 'this' in cb means paper.
		 * Do this in onShow() instead of initialize.
		 */
		_enableSVG: function(){
			if(!Raphael) throw new Error('DEV::ItemView+::_enableSVG() You did NOT have Raphael.js included...');
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
			};
		},

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
		 * 		getVal: ...,
		 * 		setVal: ...,
		 * 		validate: ...,
		 * 		status: ...,
		 * 		[editors: ...,]
		 * 		[disable: ...,]
		 * 		[isEnabled: ...,]
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
		_activateEditors: function(options){
			this._editors = this._editors || {};
			if(this._editors.attachView) throw new Error('DEV::ItemView+::_activateEditors() will need this._editors object, it is now a Region!');

			var global = options._global || {};
			_.each(options, function(config, name){
				if(name.match(/^_./)) return; //skip _config items like _global

				var Editor, editor;
				if(!_.isFunction(config)){
					//0. apply global config
					config = _.extend({name: name, parentCt: this}, global, config);
					//if no label, we remove the standard (twt-bootstrap) 'form-group' class from editor template for easier css styling.
					if(!config.label) config.className = config.className || ' ';

					//1. instantiate
					config.type = config.type || 'text'; 
					Editor = (app.Core.Editor.map.Basic.supported[config.type] && app.Core.Editor.map.Basic) || app.get(config.type, 'Editor');
					
					//Tempo Fix: remove type so it won't confuse View init with Item/Collection/CompositeView types.
					if(Editor !== app.Core.Editor.map.Basic)
						delete config.type;
					////////////////////////////////////////////////////////////////////////////////////////////////

					editor = new Editor(config);					
				}else {
					//if config is a view definition use it directly 
					//(compound editor, e.g: app.view({template: ..., editors: ..., getVal: ..., setVal: ...}))
					Editor = config;
					config = _.extend({name: name, parentCt: this}, global);
					editor = new Editor(config); //you need to implement event forwarding to parentCt like Basic.
					editor.isCompound = true;
				}
				
				this._editors[name] = editor.render();
				//2. add it into view (specific, appendTo(editor cfg), appendTo(general cfg), append)
				var $position = this.$('[editor="' + name + '"]');
				if($position.length === 0 && config.appendTo)
					$position = this.$(config.appendTo);
				if($position.length === 0)
					$position = this.$el;
				$position.append(editor.el);
				
				//3. patch in default value
				if(config.value)
					editor.setVal(config.value);

			}, this);

			this.listenTo(this, 'before:close', function(){
				_.each(this._editors, function(editorview){
					editorview.close();
				});
			});

			//0. getEditor(name)
			this.getEditor = function(name){
				return this._editors[name];
			};

			//1. getValues (O(n) - n is the total number of editors on this form)
			this.getValues = function(){
				var vals = {};
				_.each(this._editors, function(editor, name){
					var v = editor.getVal();
					if(v !== undefined && v !== null) vals[name] = v;
				});
				//Warning: Possible performance impact...
				return app.model(vals).toJSON(); //construct a deep model for editor 'a.b.c' getVal();
				/////////////////////////////////////////
			};

			//2. setValues (O(n) - n is the total number of editors on this form)
			this.setValues = function(vals, loud){
				if(!vals) return;
				_.each(this._editors, function(editor, name){
					var v = vals[name] || app.extract(name, vals);
					if(v !== null && v !== undefined){
						editor.setVal(v, loud);
					}
				});
			};

			//3. validate
			this.validate = function(show){
				var errors = {};

				_.each(this._editors, function(editor, name){
					var e;
					if(!this.isCompound)
						e = editor.validate(show);
					else
						e = editor.validate(); //just collect errors
					if(e) errors[name] = e;
				}, this);

				if(this.isCompound && show) this.status(errors); //let the compound editor view decide where to show the errors
				if(_.size(errors) === 0) return;

				return errors; 
			};

			//4. highlight status msg - linking to individual editor's status method
			this.status = function(options){
				if(_.isString(options)) {
					throw new Error('DEV::ItemView+::_activateEditors() You need to pass in messages object instead of ' + options);
				}

				//clear status
				if(!options || _.isEmpty(options)) {
					_.each(this._editors, function(editor, name){
						editor.status();
					});
					return;
				}
				//set status to each editor
				_.each(options, function(opt, name){
					if(this._editors[name]) this._editors[name].status(opt);
				}, this);
			};

			//auto setValues according to this.model?
			
		}

	});


})(Application);