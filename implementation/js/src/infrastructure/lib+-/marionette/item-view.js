/**
 * Marionette.ItemView Enhancements (can be used in Layout as well) - Note that you can NOT use these in a CompositeView yet.
 *
 * Optional
 * --------
 * 1. SVG
 * 2. Basic Editors (view as form piece)
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
		enableSVGCanvas: function(cb){
			if(!Raphael) throw new Error('DEV::View::You did NOT have Raphael.js included in the libs.');
			if(cb){
				var that = this;
				Raphael(this.el, this.$el.width(), this.$el.height(), function(){
					that.paper = this;
					cb.apply(this, arguments);
				});
			}else {
				this.paper = Raphael(this.el, this.$el.width(), this.$el.height());
			}
			//resize paper upon window resize event.
			this.listenTo(app, 'view:resized', function(e){
				this.paper.setSize(this.$el.width(), this.$el.height());
			});
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
	 * global: general config as a base for all editors, (overriden by individual editor config)
	 * appendTo: [selector] - general appendTo css selector
	 * triggerOnShow: true|false[default],
	 * editors: {
	 * 	name: {
	 * 		type: ..., (*required)
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
	 * }
	 *
	 * This will add *this._editors* to the view object. Do NOT use a region name with region='editors'...
	 * 
	 * Add new: You can repeatedly invoke this method to add new editors to the view.
	 * Remove current: You can find the editor by name and use editor.close to remove it.
	 *
	 * optionally you can implement setValues()/getValues()/validate() in your view, and that will get invoked by the outter form view if there is one.
	 * 
	 */

	_.extend(Backbone.Marionette.ItemView.prototype, {

		activateEditors: function(options){
			this._editors = this._editors || {};
			if(this._editors.attachView) throw new Error('DEV::View::activateEditors enhancements will need this._editors object, it is now a Region!');

			var global = options.global || {};
			_.each(options.editors, function(config, name){
				//0. apply global config
				config = _.extend({}, global, config);
				//1. instantiate
				config.type = config.type || 'text'; 
				try{
					var editorDef = app.Core.Editor.get(config.type);
				}catch(e){
					var editorDef = app.Core.Editor.get('Basic');
				}
				var editor = new editorDef(_.extend(config, {name: name, parentCt: this}));
				this._editors[name] = editor.render();
				//2. add it into view (specific, appendTo(editor cfg), appendTo(general cfg), append)
				var $position = this.$('[editor="' + name + '"]');
				if($position.length === 0 && config.appendTo)
					$position = this.$(config.appendTo);
				if($position.length === 0 && options.appendTo)
					$position = this.$(options.appendTo);
				if($position.length === 0)
					$position = this.$el;
				$position.append(editor.el);
				if(options.triggerOnShow) editor.trigger('show');
			}, this);

			this.listenTo(this, 'before:close', function(){
				_.each(this._editors, function(editorview){
					editorview.close();
				});
			});

			//1. getValues (O(n) - n is the total number of editors on this form)
			this.getValues = function(){
				var vals = {};
				_.each(this._editors, function(editor, name){
					vals[name] = editor.getVal();
				});
				return vals;
			};
			this.getVal = function(name){
				return this._editors[name] && this._editors[name].getVal();
			};

			//2. setValues (O(n) - n is the total number of editors on this form)
			this.setValues = function(vals, loud){
				_.each(this._editors, function(editor, name){
					if(vals[name])
						editor.setVal(vals[name], loud);
				});
			};
			this.setVal = function(name, value, loud){
				this._editors[name] && this._editors[name].setVal(value, loud);
			}

			//3. validate
			this.validate = function(show){
				var errors = {};
				_.each(this._editors, function(editor, name){
					var e = editor.validate(show);
					if(e) errors[name] = e;
				});
				if(_.size(errors) === 0) return;
				return errors; 
			}
			
		}

	});


})(Application);