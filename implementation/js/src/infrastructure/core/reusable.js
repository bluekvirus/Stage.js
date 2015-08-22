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
 * @author Tim.Liu
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
				if(!_.isString(name) || !name) throw new Error('DEV::Reusable:: You must specify the name of the ' + regName + ' to look for.');
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
					_.extend(/*{
						...
					},*/ options, {
						className: regName.toLowerCase() + ' ' + _.string.slugify(regName + '-' + options.name) + ' ' + (options.className || ''),
						category: regName
					});
					factory = function(){
						return Marionette[options.type || 'Layout'].extend(options);
					};
				}

				//type 2: name and options
				else if(_.isPlainObject(factory)){
					options = _.extend({name: name}, factory);
					factory = function(){
						return Marionette[options.type || 'Layout'].extend(options);
					};
				}

				//type 3: name and a factory func (won't have preset className & category)
				if(!_.isString(name) || !name) throw new Error('DEV::Reusable:: You must specify a ' + regName + ' name to register.');
				if(!_.isFunction(factory)) throw new Error('DEV::Reusable:: You must specify a ' + regName + ' factory function to register ' + name + ' !');

				if(this.has(name))
					console.warn('DEV::Overriden::Reusable ' + regName + '.' + name);
				this.map[name] = factory();
				this.map[name].prototype.name = name;

				//fire the coop event (e.g for auto menu entry injection)
				app.trigger('app:reusable-registered', this.map[name], regName);
				app.coop('reusable-registered', this.map[name], regName);
				return this.map[name];

			},

			create: function(name /*or path*/, options){
				if(!_.isString(name) || !name) throw new Error('DEV::Reusable:: You must specify the name of the ' + regName + ' to create.');
				var Reusable = this.get(name);
				if(Reusable)
					return new Reusable(options || {});
				throw new Error('DEV::Reusable:: Required definition [' + name + '] in ' + regName + ' not found...');
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
				throw new Error('DEV::Reusable:: Required definition [' + name + '] in ' + regName + ' not found...');
			}

		});

		return manager;

	}

	makeRegistry('Context'); //top level views (see infrastructure: navigation worker)
	makeRegistry('Regional'); //general named views (e.g a form, a chart, a list, a customized detail)
	app.Core.View = app.Core.Regional; //alias
	makeRegistry('Widget'); //specialized named views (e.g a datagrid, a menu, ..., see reusable/widgets)
	makeRegistry('Editor'); //specialized small views used in form views (see reusable/editors, lib+-/marionette/item-view,layout)

})(_, Application, Marionette);