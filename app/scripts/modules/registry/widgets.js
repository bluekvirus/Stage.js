/**
 * **Widget** Definition Manager.
 *
 * This is the general application widgets manager.
 * 
 * A module is an entity that has corresponding menu item with default view (layout)
 * A widget is a view that has actions that support application logics. Used within a module.
 *
 * @author Tim.Liu (zhiyuanliu@fortinet.com)
 * @update 2013.03.22
 */

(function(app){

	var manager = app.module('Widget');

	manager.register = function(name, factory){
		manager[name] = factory();
	};

	//could be name, id, group, options to remember the instances
	//[Under consideration]
	manager.create = function(name, options){
		if(manager[name])
			return new manager[name](options);
		app.error('Widget Registry Error', 'widget ', name, ' not found...');
	}

})(Application);