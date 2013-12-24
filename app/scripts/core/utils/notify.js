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
 * Note that prompt doesn't have a collection.
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

	app.msg = function(type, data){
		var msgObj = {type: type, data: data};
		messages.add(msgObj);
		app.trigger('app:message', msgObj);
	}

	/**
	 * Notify the user about application error, success and info through the app:message event channel.
	 *
	 * @arguments Messages ,...,
	 */
	_.each(['error', 'success', 'info', 'warning'], function(type){
		app[type] = function(){
			arguments = _.toArray(arguments);
			app.msg(type, {
				text: arguments.join(' ')
			});
		}
	});


	/**
	 * Prompt the user if they are sure about this...
	 */
	app.prompt = function(type, data){
		var promptObj = {type: type, data: data};
		app.trigger('app:prompt', msgObj);
	};

	_.each(['confirm', 'alert', 'window'], function(type){
		app[type] = function(data){
			app.prompt(type, data);
		}
	})


})(Application);