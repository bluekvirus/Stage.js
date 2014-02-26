/**
 * Marionette.ItemView Enhancements (can be used in Layout as well) - Note that you can NOT use these in a CompositeView yet.
 *
 * Optional
 * --------
 * 1. SVG
 * 2. Basic Editors (view as form piece)
 * 3. Form (view used as a form)
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
	 * Turn tags in the template into real editors.
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
	 * This will add *this.editors* to the view object. Do NOT use a region name with region='editors'...
	 * 
	 * Add new: You can repeatedly invoke this method to add new editors to the view.
	 * Remove current: You can find the editor by name and use editor.close to remove it.
	 *
	 * optionally you can implement setValues()/getValues()/validate() in your view, and that will get invoked by the outter form view if there is one.
	 * 
	 */

	_.extend(Backbone.Marionette.ItemView.prototype, {

		activateEditors: function(options){
			this.editors = this.editors || {};
			if(this.editors.attachView) throw new Error('DEV::View::activateEditors enhancements will need this.editors object, it is now a Region!');

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
				this.editors[name] = editor.render();
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
				_.each(this.editors, function(editorview){
					editorview.close();
				});
			});
		}

	});


	/**
	 * Turn into Form - do it in initialize(); (though addformPart should be in onShow or onRender)
	 * Note that a form part will not be registered with a name, so do NOT try to co-op between form parts.
	 * This will turn a view into a form by giving it the following methods:
	 * required:
	 * 0. addFormPart(view, [{region: '' or appendTo: '' + cb: ''}]) * add an isolated form piece (an activateEditors instrumented view) into a region or tag selector or append to this.$el; 
	 * 1. getValues() * - default implementation will be to collect values by this.editors{} and merge with this.parts[]'s editors (the form parts will also have a chance to override getValues)
	 * 2. setValues(vals) * - default implementation will be to set values by this.editors{} and this.parts[]'s editors (the form parts will have a chance to override setValues)
	 * 3. validate(show) * - default implementation will be to validate by this.editors{} and this.parts[]'s editors (can be voerriden by the form part view)
	 * Note that after validation(show:true) got errors, those editors will become eagerly validated, it will turn off as soon as the user has input-ed the correct value.
	 * 
	 * optional: button action implementations, you still have to code your button's html into the template.
	 * 4. submit
	 * 5. reset
	 * 6. refresh
	 * 7. cancel
	 *
	 * No setVal getVal
	 * ----------------
	 * This is because we don't permit co-op between form parts, so there is no short-cut for getting/setting single editor/field value.
	 *
	 * Pass in activateEditors options
	 * -------------------------------
	 * You can mix enableForm's options with activateEditors' options, so the view will be rendered with a starting set of editors and the ability to add more as form parts.
	 */

	_.extend(Backbone.Marionette.View.prototype, {

		turnIntoForm: function(options){
			options = options || {};
			//this.tagName = 'form'; - this has no effect, do it in init.options.
			this.template = options.template || this.template || '#_blank';
			//0. addFormPart
			this.parts = this.parts || options.parts || [];
			this.listenTo(this, 'render', function(){
				this.activateEditors(options);
			});
			this.addFormPart = function(view, opt){
				this.parts.push(view);
				opt = opt || {};
				if(opt.region) this[opt.region].show(view);
				else {
					var $position = opt.appendTo && this.$(opt.appendTo);
					if(!$position || $position.length === 0) $position = this.$el;
					$position.append(view.render().el);
					opt.cb && opt.cb(view);
				}
			};
			//a little clean-up setups
			this.listenTo(this, 'before:close', function(){
				_.each(this.parts, function(partview){
					partview.close();
				});
			});

			//1. getValues (O(n) - n is the total number of editors on this form)
			this.getValues = function(){
				var vals = {};
				_.each(this.editors, function(editor, name){
					vals[name] = editor.getVal();
				});
				_.each(this.parts, function(part){
					if(part.getValues)
						_.extend(vals, part.getValues());
					else {
						_.each(part.editors, function(editor, name){
							vals[name] = editor.getVal();
						});
					}
				});
				return vals;
			};

			//2. setValues (O(n) - n is the total number of editors on this form)
			this.setValues = function(vals, loud){
				_.each(this.editors, function(editor, name){
					if(vals[name])
						editor.setVal(vals[name], loud);
				});
				_.each(this.parts, function(part){
					if(part.setValues)
						part.setValues(vals, loud);
					else {
						_.each(part.editors, function(editor, name){
							if(vals[name])
								editor.setVal(vals[name], loud);
						});
					}
				});
			}

			//3. validate
			this.validate = function(show){
				var errors = {};
				_.each(this.editors, function(editor, name){
					var e = editor.validate(show);
					if(e) errors[name] = e;
				});
				_.each(this.parts, function(part){
					if(part.validate) _.extend(errors, part.validate(show));
					else {
						_.each(part.editors, function(editor, name){
							var e = editor.validate(show);
							if(e) errors[name] = e;
						});
					}
				});
				if(_.size(errors) === 0) return;
				return errors; 
			}
			
		}

	});


})(Application);