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
			has: function(name){
				if(!_.isString(name) || !name) throw new Error('DEV::Reusable:: You must specify the name of the ' + regName + ' to look for.');
				if(this.map[name]) return true;
				return false;
			},

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
				return this.map[name];

			},

			create: function(name, options){
				if(!_.isString(name) || !name) throw new Error('DEV::Reusable:: You must specify the name of the ' + regName + ' to create.');
				var Reusable = this.get(name);
				if(Reusable)
					return new Reusable(options || {});
				throw new Error('DEV::Reusable:: Required definition [' + name + '] in ' + regName + ' not found...');
			},

			get: function(name){
				if(!name) return _.keys(this.map);
				if(this.has(name))
					return this.map[name];
			},

			alter: function(name, options){
				if(this.has(name)){
					this.map[name] = this.map[name].extend(options);
					return this.map[name];
				}
				throw new Error('DEV::Reusable:: Required definition [' + name + '] in ' + regName + ' not found...');
			}

		});

		return manager;

	}

	makeRegistry('Context'); //top level views (see infrastructure: navigation worker)
	makeRegistry('Regional'); //general named views (e.g a form, a chart, a list, a customized detail)
	makeRegistry('Widget'); //specialized named views (e.g a datagrid, a menu, ..., see reusable/widgets)
	makeRegistry('Editor'); //specialized small views used in form views (see reusable/editors, lib+-/marionette/item-view,layout)

})(_, Application, Marionette);