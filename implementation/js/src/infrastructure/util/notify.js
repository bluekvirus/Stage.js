/**
 * ======================================
 * Notifycations: (Message & Prompt)
 * 
 * A. Message (through the app:message channel)
 * app.error, success, info, warning...
 *
 * Usage
 * -----
 * Use one of the short-cut call app.error,success,info,warning or use app.msg directly
 * app.msg(type, data) - which will trigger event app:message with {type, data} on app object.
 *
 * Note that this is to delay/separate the rendering of the messages collection. (see default impl in context/Shared.Message)
 * Programmers can choose to implement their own rendering mech by listening to the app:message event.
 *
 * B. Prompt (through the app:prompt channel)
 *
 * Usage
 * -----
 * short-cut call app.confirm(no-mask, with anchor selector), app.alert(focus, masked overlay), app.window(can move around, no-mask)
 * app.prompt(type, data)
 *
 * Note that prompt doesn't have a collection. (see default impl in context/Shared.Prompt)
 * 
 * @author Tim.Liu
 * @created 2013.04.01
 * @updated 2013.11.08
 * @updated 2013.12.24
 * ======================================
 */
;(function(app){

	var messages = new Backbone.Collection();

	app.getMessages = function(){
		return messages;
	};

	app.Util.Notify = {}; 
	function notify(type, data, q){
		if(_.isArray(q))
			q.add(data);
		app.trigger('app:notify:' + type, data);
	}

	/**
	 * Notify the user about application error, success and info through the app:message event channel.
	 *
	 * @arguments Messages ,...,
	 */
	_.each(['error', 'success', 'info', 'warning'], function(type){
		app.Util.Notify[type] = function(){
			arguments = _.toArray(arguments);
			notify('message', {
				type: type,
				text: arguments.join(' ')
			}, app.getMessages());
		}
	});


	/**
	 * Prompt the user with a dialog box (modal/window)
	 *
	 * @arguments Object {}
	 */
	_.each(['confirm', 'alert', 'window'], function(type){
		app.Util.Notify[type] = function(data){
			notify('prompt', _.extend({type: type}, data));
		}
	})


})(Application);