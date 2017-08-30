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
	var sse = function(
			url/*SSE's url*/, 
			topics/*array for topics to subscribe*/, 
			coopEvent/*or onmessage callback function or object contains all the callbacks(onopen, onmessage, onerror and <custom events>)*/
		){

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
		}else{
			url = url || app.config.defaultSse || '/sse'; //make sure that url exits
		}

		//check whether topics is given
		if(!_.isArray(topics)){
			//if not array topics is coopEvent
			coopEvent = topics;
			topics = []; //make topics an empty array. there will be no query after url, and it will subscribe to all topics.
		}

		//check whether the url+ ':' + [topics] combination has already been subscribed
		//sort topics first. since when store topics, it is always sorted.
		topics = _.sortBy(topics);
		
		//There are two situations if app._sses[url + ':' + topics.toString()] exists
		//1). the path is still "OPEN", then just return the handle object
		//2). the path has already been "CLOSED", then re-register and override the stored object.
		//NOTE: SSE.readyState can be used to check the state of the SSE connection.
		//0: connecting, 1: open, 2: closed.
		if(
			app._sses[url + ':' + topics.toString()] && 
			(app._sses[url + ':' + topics.toString()].readyState === 0 || app._sses[url + ':' + topics.toString()].readyState === 1)
		){//exist and "OPEN"

			//return SSE handler object
			return app._sses[url + ':' + topics.toString()];
				
		}else {//exists and "CLOSED" or does not exist

			var _eventSource;

			//try to create new event source
			try{
				//use url provided by user
				_eventSource = new EventSource(app.uri(url).addQuery('topic', topics).toString()); //one event source for multiple topics
			}catch(e){
				throw Error('DEV::Application::Util::sse(): Server-Sent Events(SSE) create error. Please check your SSE\'s url!');
			}

			//default onmessage callback, can be overriden by user
			_eventSource.onmessage = function(e){
				//trigger a "sse-data" global event
				app.trigger('app:sse-data', {sse: sse, raw: e.data});
				//global coop event 'sse-data-[topic]'
				try {
					var data = JSON.parse(e.data);
					app.coop('sse-data-' + data.topic, data.payload, e, sse); //assume return data has a topic property
				}catch(error){
					console.warn('DEV::Application::sse() Server-Sent Event cannot parse string to JSON...');
				}
			};

			//honor coopEvent or callbacks based on the type of arguments
			if(coopEvent){
				//onmessage callback function
				if(_.isFunction(coopEvent)){
					//register onmessage callback for sse
					_eventSource.onmessage = function(e){
						coopEvent(e.data, e, sse);
					};
				}
				//object may contain onopen, onmessage, onerror and all the other callbacks for custom events
				else if(_.isPlainObject(coopEvent)){
					//traverse through object to register all callback events
					_.each(coopEvent, function(fn, eventName){
						//system events
						if(_.contains(['onmessage', 'onerror', 'onopen'], eventName))
							_eventSource[eventName] = fn;
						//custom events, defined by backend server
						else
							_eventSource.addEventListener(eventName, fn);
					});
				}
				//app coop event
				else if(_.isString(coopEvent)){
					//trigger coop event with data from sse's onmessage callback
					_eventSource.onmessage = function(e){
						app.coop('sse-data-' + coopEvent, e.data, e, sse);
					};
				}
				//type is not right
				else
					console.warn('DEV::Application::Util::sse(): The coopEvent or callback function or callbacks\' options you give is not right.');
			}

			//assign a unique key to the wrapper object
			_eventSource._key = _.uniqueId('sse-');
			
			//store globally, use url:topics as key
			app._sses[url + ':' + topics.toString()] = _eventSource;
			
			//return event source object to user
			return _eventSource;
		}
	};

	//assign to app.Util.sse
	app.Util.sse = sse;

})(Application);