/**
 * **Widget** Definition Manager.
 *
 * This is the general application widgets manager.
 * 
 * A module is an entity that has multiple view definitions and a default view to show in a layout.
 * A widget is a view that has actions that support application logics. Used within a module.
 *
 * Important
 * =========
 * Use create() at all times if possible, use get() definition with caution, instanciate only 1 instance per definition.
 * There is something fishy about the initialize() function, events binding only get to execute once with this.listenTo(), if multiple instances of a widget
 * listens to a same object's events in their initialize(), only one copy of the group of listeners are active.
 * 
 *
 * @author Tim.Liu (zhiyuanliu@fortinet.com)
 * @update 2013.03.22
 */

(function(app){

	var manager = app.module('Widget');

	manager.register = function(name, factory){

		manager[name] = factory; //register factory instead of factory() to protect our widget definition.
	};

	manager.get = function(name, options){
		if(!manager[name]) throw new Error('DEV::Widget.Registry::The widget ' + name + ' you required is not found...');
		return manager[name](options); //more options to pass into the widget factory.
	}

	//could be name, id, group, options to remember the instances
	//[Under consideration]
	manager.create = function(name, options){
		if(manager[name])
			return new (manager.get(name))(options);
		throw new Error('DEV::Widget.Registry::The widget ' + name + ' you required is not found...');
	}

})(Application);