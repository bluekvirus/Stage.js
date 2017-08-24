/**
 * Application Server-Sent Events(SSE)
 *
 * Usage
 * -----
 * app.sse(url, fn(data, e, sse)/coop event/options{eventName: fn(data, e, sse)...})
 * app.sse(false) to terminate all SSE connections.
 *
 * var sse = app.sse();
 * sse.close() to close connection.
 *	
 * 
 * @author Patrick Zhu
 * @created 2017.06.20
 */

;(function(app){

	app._sses = app._sses || {};
	var sse = function(url/*SSE's url*/, coopEvent/*or onmessage callback function or object contains all the callbacks(onopen, onmessage, onerror and <custom events>)*/){

		//check whether browser supports Sever Sent Event
		if(!app.detect('eventsource'))
			throw Error('DEV::Application::Util::sse(): Sever-Sent Events(SSE) is not supported by your browser!');

		//if url is false, clean up all the SSE handler
		if(url === false){
			return _.each(Object.keys(app._sses), function(handlerKey){
				//close the connection from server
				app._sses[handlerKey].close();
				//remove handlder from global object
				delete app._sses[handlerKey];
			});
		}

		//check whether url is valid
		if(!url || !_.isString(url))
			throw Error('DEV::Application::Util::sse(): The url for Sever-Sent Events(SSE) is not a string or is not provided.');

		var _eventSource;

		//try to create new event source
		try{
			//use url provided by user
			_eventSource = new EventSource(url);
		}catch(e){
			throw Error('DEV::Application::Util::sse(): Server-Sent Events(SSE) create error. Please check your SSE\'s url!');
		}

		//wrapper object
		var sse = {
			_eventSource: _eventSource,
		};

		//honor coopEvent or callbacks based on the type of arguments
		if(coopEvent){
			//onmessage callback function
			if(_.isFunction(coopEvent)){
				//register onmessage callback for sse
				sse._eventSource.onmessage = function(e){
					coopEvent(e.data, e, sse);
				};
			}
			//object may contain onopen, onmessage, onerror and all the other callbacks for custom events
			else if(_.isPlainObject(coopEvent)){
				//traverse through object to register all callback events
				_.each(coopEvent, function(fn, eventName){
					//system events
					if(_.contains(['onmessage', 'onerror', 'onopen'], eventName))
						sse._eventSource[eventName] = fn;
					//custom events, defined by backend server
					else
						sse._eventSource.addEventListener(eventName, fn);
				});
			}
			//app coop event
			else if(_.isString(coopEvent)){
				//trigger coop event with data from sse's onmessage callback
				sse._eventSource.onmessage = function(e){
					app.coop('sse-data-' + coopEvent, e.data, e, sse);
				};
			}
			//type is not right
			else
				console.warn('DEV::Application::Util::sse(): The coopEvent or callback function or callbacks\' options you give is not right.');
		}else{
			//trigger a global event if there is no options
			sse._eventSource.onmessage = function(e){
				app.coop('sse-data-' + url, e.data, e, sse);
			};
		}

		//function to close sse link
		sse.close = function(){
			this._eventSource.close();
		};

		//assign a unique key to the wrapper object
		sse._key = _.uniqueId('sse-');
		
		//store globally
		app._sses[sse._key] = sse;
		
		//return wrapper to user
		return sse;
	};

	//assign to app.Util.sse
	app.Util.sse = sse;

})(Application);