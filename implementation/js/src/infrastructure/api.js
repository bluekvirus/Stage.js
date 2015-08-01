;(function(){

	/**
	 * Universal app object creation api entry point
	 * ----------------------------------------------------
	 * @deprecated Use the detailed apis instead.
	 */
	Application.create = function(type, config){
		console.warn('DEV::Application::create() method is deprecated, use methods listed in ', Application._apis, ' for alternatives');
	};

	/**
	 * Detailed api entry point
	 * ------------------------
	 * If you don't want to use .create() there you go:
	 */
	_.extend(Application, {

		model: function(data){
			return new Backbone.Model(data);
		},

		collection: function(data){
			return new Backbone.Collection(data);
		},

		//pass in [name,] options to define (named will be registered)
		//pass in [name] to get
		//pass in [name,] options, instance to create (named will be registered again)
		view: function(name /*or options*/, options /*or instance*/){
			if(_.isString(name)){
				if(_.isBoolean(options) && options) return Application.Core.Regional.create(name);
				if(_.isPlainObject(options)) return Application.Core.Regional.register(name, options);
			}

			if(_.isPlainObject(name)){
				var instance = options;
				options = name;
				var Def = options.name ? Application.Core.Regional.register(options) : Backbone.Marionette[options.type || 'Layout'].extend(options);

				if(_.isBoolean(instance) && instance) return new Def();
				return Def;
			}

			return Application.Core.Regional.get(name);
		},

		//pass in [name,] options to register (always requires a name)
		//pass in [name] to get
		context: function(name /*or options*/, options){
			if(!options) {
				if(_.isString(name) || !name)
					return Application.Core.Context.get(name);
				else
					options = name;
			}
			else
				_.extend(options, {name: name});
			return Application.Core.Context.register(options);
		},

		//pass in name, factory to register
		//pass in name, options to create
		//pass in [name] to get
		widget: function(name, options /*or factory*/){
			if(!options) return Application.Core.Widget.get(name);
			if(_.isFunction(options))
				//register
				return Application.Core.Widget.register(name, options);
			return Application.Core.Widget.create(name, options);
			//you can not register the definition when providing name, options.
		},

		//pass in name, factory to register
		//pass in name, options to create
		//pass in [name] to get
		editor: function(name, options /*or factory*/){
			if(!options) return Application.Core.Editor.get(name);
			if(_.isFunction(options))
				//register
				return Application.Core.Editor.register(name, options);
			return Application.Core.Editor.create(name, options);
			//you can not register the definition when providing name, options.
		},

		//@deprecated---------------------
		regional: function(name, options){
			options = options || {};
			if(_.isString(name))
				_.extend(options, {name: name});
			else
				_.extend(options, name);
			console.warn('DEV::Application::regional() method is deprecated, use .view() instead for', options.name);
			return Application.view(options, !options.name);
		},
		//--------------------------------

		lock: function(topic){
			return Application.Core.Lock.lock(topic);
		},

		unlock: function(topic){
			return Application.Core.Lock.unlock(topic);
		},

		available: function(topic){
			return Application.Core.Lock.available(topic);
		},

		download: function(ticket){
			return Application.Util.download(ticket);
		},

		inject: {
			js: function(){
				return Application.Util.inject.apply(null, arguments);
			},

			tpl: function(){
				return Application.Util.Tpl.remote.load.apply(Application.Util.Tpl.remote, arguments);
			},

			css: function(){
				return loadCSS.apply(null, arguments);
			}
		},

		navigate: function(options, silent){
			return Application.trigger('app:navigate', options || Application.config.defaultContext, silent);
		}	

	});

	//editor rules
	Application.editor.validator = Application.editor.rule = function(name, fn){
		if(!_.isString(name)) throw new Error('DEV::Application.editor.validator::You must specify a validator/rule name to use.');
		return Application.Core.Editor.addRule(name, fn);
	};

	//alias
	Application.page = Application.context;
	Application.area = Application.regional;

	/**
	 * Universal remote data interfacing api entry point
	 * -------------------------------------------------
	 * @returns jqXHR object (use promise pls)
	 */
	Application.remote = function(options){
		options = options || {};
		if(options.payload)
			return Application.Core.Remote.change(options);
		else
			return Application.Core.Remote.get(options);
	};

	/**
	 * API summary
	 */
	Application._apis = [
		'model', 'collection',
		'context - @alias:page', 'regional - @alias:area',
		'view',
		'widget', 'editor', 'editor.validator - @alias:editor.rule',
		'remote',
		'lock', 'unlock', 'available',
		'download',
		'create - @deprecated'
	];

})();