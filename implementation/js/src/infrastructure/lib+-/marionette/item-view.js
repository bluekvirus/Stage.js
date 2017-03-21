/**
 * Marionette.ItemView Enhancements (can be used in Layout as well) - Note that you can NOT use these in a CompositeView.
 *
 * 1. svg (+this.paper, *this.paper.clear())
 * 2. basic Editors (view as form piece)
 * 3. data <-> render handling 
 *
 * @author Tim Lauv
 * @created 2014.02.26
 * @updated 2015.08.03
 * @updated 2016.02.17
 * @updated 2017.02.05
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

		// Render the view, defaulting to underscore.js templates.
		// You can override this in your view definition to provide
		// a very specific rendering for your view. In general, though,
		// you should override the `Marionette.Renderer` object to
		// change how Marionette renders views.
		// + honoring empty template (before-render modification on $el will no longer be replaced)
		render: function() {
		    this.isClosed = false;

		    this.triggerMethod("before:render", this);
		    this.triggerMethod("item:before:render", this);

		    var data = this.serializeData();
		    data = this.mixinTemplateHelpers(data);

		    var template = this.getTemplate();
		    //app.debug('Getting template for', this._name, template);
		    var html = Marionette.Renderer.render(template, data);

		    //+ skip empty template
		    if(_.string.ltrim(html))
		    	this.$el.html(html);
		    this.bindUIElements();

		    this.triggerMethod("render", this);
		    this.triggerMethod("item:rendered", this);

		    return this;
		},

		//Editors reset in addition to template re-render upon data change in the underlying backbone model.
		_renderTplAndResetEditors: function(){

			//always re-render template
			this.render();

			if(this._editors){
				this.setValues(this.model.toJSON());
				this.trigger('view:editors-updated');
			}

			//re-render the sub-regional views.
			this.trigger('view:data-rendered');

		},
		
		//set & change the underlying data of the view.
		set: function(){

			if(!this.model){
				this.model = app.model(this.useFlatModel);
			}

			var self = this;

			//check one-way binding
			if(!this._oneWayBound){				
				this.listenTo(this.model, 'change', function(){
					self._renderTplAndResetEditors();
				});
				this._oneWayBound = true;
			}

			//check if we are setting another remote data url.
			var data = arguments[0];
			if(_.isString(data)){
				this.data = data;
				//to prevent from calling refresh() in initialize()
				return this.isInDOM() && this.refresh();
			}

			//array data are treated as sub-key 'items' in the model and your template.
			if(_.isArray(data))
				this.model.set('items', _.clone(data)); 
				//conform to original Backbone/Marionette settings
				//Caveat: Only shallow copy provided for data array here... 
				//		  Individual changes to any item data still affects all instances of this View if 'data' is specified in def.
			else
				//apply whole data object to model
				this.model.set.apply(this.model, arguments);
			
			//data view, including those that have form and svg all have 'ready' e now... (static view ready see view.js:--bottom--)
			_.defer(_.bind(function(){
				this.triggerMethodInversed('ready');
			}, this));

			return this;
		},

		//Use this to get the underlying data of the view.
		//DON'T use this.model.attributes!
		get: function(keypath){

			var vals = {};

			//check editors
			if(this._editors)
				vals = this.getValues();

			//check data
			if(!this.model){
				console.warn('DEV::ItemView+::get() You have not yet setup data in view ' + this._name);
			} else {
				vals = _.extend(this.model.toJSON(), vals);
			}
			
			//return merged state
			if(keypath)
				return app.extract(keypath, vals);
			return vals;
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

		//Inject a svg canvas within view. (fully extended to parent region size)
		_enableSVG: function(selector, paperName){

			//1. locate and clean up $el
			var $el = selector? this.$el.find(selector) : this.$el;
			$el.css({
				'width': '100%',
				'height': '100%',
			});
			$el.find('svg').remove();

			//2. inject svg canvas, save paper, and optional d3.js selection entrypoint.
			var SVG = window.Raphael || window.Snap, paper;
			if(SVG)
				paper = SVG($el[0]);
			else {
				console.warn('DEV::ItemView+::_enableSVG() You did NOT have Raphaël.js/Snap.svg included...');
				$el.append('<svg/>');
				paper = {
					canvas: $el.find('svg')[0],
					setSize: function(w, h){
						$(paper.canvas)
							.attr('width', w)
							.attr('height', h);
						paper.width = w;
						paper.height = h;
					},
					setViewBox: function(x, y, w, h, align, meetOrSlice){
						$(paper.canvas)
							.attr('viewBox', [x, y, w, h].join(' '))
							.attr('preserveAspectRatio', [align || 'xMidYMid', meetOrSlice || 'meet'].join(' '));
						//ref https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/preserveAspectRatio
					},
					clear: function(){
						$(paper.canvas).empty();
					}
				};
			}
			if(window.d3)
				paper.d3 = d3.select(paper.canvas);

			if(!paperName)
				//single
				this.paper = paper;
			else {
				//multiple
				this.paper = this.paper || {};
				this.paper[paperName] = paper;
			}
			$el.find('svg').attr({
				'width': '100%',
				'height': '100%',
			});


			//3. give paper a proper .clear() method to call before each drawing
			//+._fit() to paper.clear() (since paper.height/width won't change with the above w/h:100% settings)
			paper._fit = function(w /*or $anchor*/, h){
				var $anchor = $el;
				if(_.isjQueryObject(w)){
					$anchor = w;
					w = h = 0;
				}
				//there is no 0x0 so don't worry...
				paper.setSize(w || $anchor.width(), h || $anchor.height());
				//read back through paper.height/width in px;
			};
			var tmp = paper.clear, that = this;
			paper.clear = function(w, h){
				tmp.apply(paper, arguments);
				paper._fit(w, h);
				that.trigger('view:paper-cleared', paper, {name: paperName, w: w, h: h});
			};

			//Note: Manually call paper.clear() upon window resize or data change before re-draw. Paper.width/height will be corrected.
			return paper;
		},

		/**
		 * Editor Activation - do it once upon render()
		 * 
		 * Turn per field config into real editors.
		 * You can activate editors in any Layout/ItemView object.
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

					editor = Editor.create(config);					
				}else {
					//if config is a view definition use it directly 
					//(compound editor, e.g: app.view({template: ..., editors: ..., getVal: ..., setVal: ...}))
					Editor = config;
					config = _.extend({name: name, parentCt: this}, global);
					editor = Editor.create(config); //you need to implement event forwarding to parentCt like Basic.
					editor.isCompound = true;
					editor.category = 'Editor';
				}
				//fix editor with default methods (required)
				editor.getVal = editor.getVal || editor.get /*fall back to view's data*/ || _.noop;
				editor.setVal = editor.setVal || editor.set /*fall back to view's data*/ || _.noop;
				editor.validate = editor.validate || _.noop;
				editor.status = editor.status || _.noop;
				editor.disable = editor.disable || _.noop;
				//render it in cache
				this._editors[name] = editor.render();

				//2. add it into view (specific, appendTo(editor cfg), appendTo(general cfg), append)
				//2. case A: specified by editor=""
				var $position = this.$('[editor="' + name + '"]');
				if($position.length === 0 && config.appendTo === false)
					return; //e.g use appendTo = false in _global to skip editors without $el in template.
				//2. case B: specified by cfg.appendTo
				if($position.length === 0 && config.appendTo)
					$position = this.$(config.appendTo);
				//2. case C: append to bottom of view
				if($position.length === 0)
					$position = this.$el;

				$position.append(editor.$el);
				//+'show' (internal, for editor writer only)
				editor.triggerMethod('show');
				
				//3. patch in default value (Note: Always provide a default value to trigger onReady()!)
				if(config.value !== undefined){
					editor.setVal(config.value);
					//+'ready' (internal, for editor writer only)
					_.defer(_.bind(function(){
						editor.triggerMethodInversed('ready');
					}, editor));
				}

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
				return app.model(vals).toJSON(); //construct a deep model for editor 'a.b.c' getVal() to merge into correct level;
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