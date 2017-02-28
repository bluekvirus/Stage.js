/**
 * Widget/Editor registry. With a regFacotry to control the registry mech.
 *
 * Important
 * =========
 * Use create() at all times if possible, use get()[deprecated...] definition with caution, instantiate only 1 instance per definition.
 * There is something fishy about the initialize() function (Backbone introduced), events binding only get to execute once with this.listenTo(), if multiple instances of a part
 * listens to a same object's events in their initialize(), only one copy of the group of listeners are active.
 * 
 *
 * @author Tim Lauv
 * @create 2013.11.10
 * @update 2014.03.03
 * @update 2015.07.29 (merged Regional, Context)
 */

(function(_, app, Marionette){

	function makeRegistry(regName){
		regName = _.string.classify(regName);
		var manager = app.module('Core.' + regName);
		_.extend(manager, {

			map: {},
			has: function(name /*or path*/){
				if(!_.isString(name) || !name) throw new Error('DEV::Reusable::has() You must specify the name of the ' + regName + ' to look for.');
				if(this.map[name]) return name;
				name = app.pathToName(name);
				if(this.map[name]) return name;
				return undefined;
			},

			//no auto pathToName conversion
			register: function(name /*or options*/, factory /*or options or none*/){

				//type 1: options only
				var options;
				if(_.isPlainObject(name)){
					options = name;
					name = options.name;
					factory = function(){
						return Marionette[options.type || 'Layout'].extend(options);
					};
				}

				//type 2: name and options
				else if(_.isPlainObject(factory)){
					options = _.extend(factory, {
						name: name,
					});
					factory = function(){
						return Marionette[options.type || 'Layout'].extend(options);
					};
				}

				if(!_.isFunction(factory)) throw new Error('DEV::Reusable::register() You must specify a ' + regName + ' factory function for ' + (name || 'Anonymous') + ' !');
				var Reusable = factory();

				//only named def gets registered.
				if(name){
					//type 3: name and a factory func (won't have preset className)
					if(!_.isString(name)) throw new Error('DEV::Reusable::register() You must specify a string name to register view in ' + regName + '.');

					if(this.has(name))
						console.warn('DEV::Overriden::Reusable ' + regName + '.' + name);
					
					//+metadata to instances
					Reusable.prototype.name = name;
					Reusable.prototype.category = regName;

					//fire the coop event (e.g for auto menu entry injection)
					this.map[name] = Reusable;
					app.trigger('app:reusable-registered', Reusable, regName);
					app.coop('reusable-registered', Reusable, regName);
				}

				//patch it with a chaining method: (e.g for app.get('ViewName').create(options).overlay())
				Reusable.create = function(options){
					return new Reusable(options);
				};

				//both named and anonymous def gets returned.
				return Reusable;

			},

			create: function(name /*or path*/, options){
				if(!_.isString(name) || !name) throw new Error('DEV::Reusable::create() You must specify the name of the ' + regName + ' to create.');
				var Reusable = this.get(name);
				if(Reusable)
					return Reusable.create(options || {});
				throw new Error('DEV::Reusable::create() Required definition [' + name + '] in ' + regName + ' not found...');
			},

			get: function(name /*or path*/){
				if(!name) return _.keys(this.map);
				name = this.has(name);
				if(name)
					return this.map[name];
			},

			alter: function(name /*or path*/, options){
				var Reusable = this.get(name);
				if(Reusable){
					Reusable = Reusable.extend(options);
					return Reusable;
				}
				throw new Error('DEV::Reusable::alter() Required definition [' + name + '] in ' + regName + ' not found...');
			},

			remove: function(name /*or path*/){
				if(name)
					delete this.map[name];
			},

		});

		return manager;

	}

	makeRegistry('Context'); //top level views (see infrastructure: navigation worker)
	makeRegistry('Regional'); //general named views (e.g a form, a chart, a list, a customized detail)
	app.Core.View = app.Core.Regional; //alias
	makeRegistry('Widget'); //specialized named views (e.g a datagrid, a menu, ..., see reusable/widgets)
	makeRegistry('Editor'); //specialized small views used in form views (see reusable/editors, lib+-/marionette/item-view,layout)

})(_, Application, Marionette);