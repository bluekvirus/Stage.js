/**
 * Widget/Editor registry. With a regFacotry to control the registry mech.
 *
 * Important
 * =========
 * Use create() at all times if possible, use get() definition with caution, instanciate only 1 instance per definition.
 * There is something fishy about the initialize() function, events binding only get to execute once with this.listenTo(), if multiple instances of a part
 * listens to a same object's events in their initialize(), only one copy of the group of listeners are active.
 * 
 *
 * @author Tim.Liu
 * @create 2013.11.10
 */

(function(app){

	function makeRegistry(regName){
		regName = _.string.camelize(regName);
		var manager = app.module('Core.' + regName);

		//save factory (which returns the definition object)
		manager.register = function(name, factory){
			manager[name] = factory;
		};

		//get definition object, with factory options
		manager.get = function(name, options){
			if(!manager[name]) throw new Error('DEV::' + regName + '.Registry::The part definition [' + name + '] you required is not found...');
			return manager[name](options);
		}

		//get the instance from definition object (produced by a default factory setting), options is for instantiating the definition object.
		manager.create = function(name, options){
			return new (manager.get(name))(options);
		}
	}

	makeRegistry('Widget');
	makeRegistry('Editor');

})(Application);