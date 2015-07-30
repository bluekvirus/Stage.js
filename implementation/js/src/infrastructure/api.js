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

		view: function(options /*or name*/, instant){
			if(_.isBoolean(options)) throw new Error('DEV::Application.view::pass in {options} or a name string...');
			if(_.isString(options) || !options) return Application.Core.Regional.get(options);

			var Def;
			if(!options.name){
				Def = Backbone.Marionette[options.type || 'Layout'].extend(options);
				if(instant) return new Def();
			}
			else //named views should be regionals in concept
				Def = Application.Core.Regional.register(options);
			
			return Def;
		},

		regional: function(name, options){
			options = options || {};
			
			if(_.isString(name))
				_.extend(options, {name: name});
			else
				_.extend(options, name);

			console.warn('DEV::Application::regional() method is deprecated, use .view() instead for', options.name);
			return Application.view(options, !options.name);
		},

		context: function(name, options){
			if(!_.isString(name)) {
				if(!name) return Application.Core.Context.get();
				options = name;
				name = '';
			}else {
				if(!options) return Application.Core.Context.get(name);
			}
			options = options || {};
			_.extend(options, {name: name});
			return Application.Core.Context.register(options);
		},

		widget: function(name, options){
			if(!options) return Application.Core.Widget.get(name);
			if(_.isFunction(options)){
				//register
				Application.Core.Widget.register(name, options);
				return;
			}
			return Application.Core.Widget.create(name, options);
			//you can not get the definition returned.
		},

		editor: function(name, options){
			if(!options) return Application.Core.Editor.get(name);
			if(_.isFunction(options)){
				//register
				Application.Core.Editor.register(name, options);
				return;
			}
			return Application.Core.Editor.create(name, options);
			//you can not get the definition returned.
		},

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