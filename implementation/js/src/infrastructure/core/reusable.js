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
 */

(function(app){

	function makeRegistry(regName){
		regName = _.string.classify(regName);
		var manager = app.module('Core.' + regName);
		_.extend(manager, {

			map: {},
			has: function(name){
				if(manager.map[name]) return true;
				return false;
			},
			register: function(name, factory){
				if(manager.has(name))
					console.warn('DEV::Overriden::' + regName + '.' + name);
				manager.map[name] = factory();
			},

			create: function(name, options){
				if(manager.has(name))
					return new (manager.map[name])(options);
				throw new Error('DEV::' + regName + '.Registry:: required definition [' + name + '] not found...');
			}

		});

	}

	makeRegistry('Widget');
	makeRegistry('Editor');

})(Application);