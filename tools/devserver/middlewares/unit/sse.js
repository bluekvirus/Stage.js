/**
 * Server-sent events...
 *
 * @author Patrick Zhu
 * @created 2017.06.19
 */

var _ = require('underscore');

module.exports = function(server){

	var profile = server.get('profile');

	//1. setup something here upon middleware loading
	//e.g db/store connection, global server vars...

	//object to store all the sse response objects
	server.sse = server.sse || {};

	//get the sse setup from server
	var sseConfig = profile.sse; //an array
	
	//2.a return a factory function to further config your middleware; [suggested]
	//2.b skip this factory function and return the middleware directly; [optional, zero-configuration]
	return function(options){

		//prepare your middleware according to options

		return function(req, res, next){

			//this is the registration part, it only stores all the response handler and a broadcast function.
			//users' script will call the broadcast function to send data to every client.
			
			//fetch path
			var path = req.path;

			//only register if user registered the SSE in the server config
			if(sseConfig && _.contains(sseConfig, path)){

				//response immediately to hold the connection
				res.writeHead(200, {
					'Content-Type': 'text/event-stream', 
					'Cache-Control': 'no-cache', 
					'Connection': 'keep-alive'
				});

				//register "close" event on req to make connection close properly when browser calls EventSource.close()
				req.on('close', function(){
					//end transmission
					res.end();
					//delete handler

					console.log('connection ' + path.yellow +' closed.');
				});

				//store the response handler to the global server object
				if(server.sse[path]){

					//sse object already exists
					server.sse[path]._client.push(res);

				}else{

					//newly added path, create object and give a broadcast function
					server.sse[path] = {
						//array to store all the response handlers that calls this sse
						_client: [res],
						//function for broadcasting data to all the clients
						//options could contain id(message id), event(event name), retry(retry timeout in ms) ...
						broadcast: function(data, options){
							var str = '';
							//honor options
							_.each(options, function(opt, key){
								str += key + ': ' + opt + '\n'; //single '\n' for options
							});
							//honor data
							str += 'data: ' + (_.isString(data) ? data : JSON.stringify(data)) + '\n\n'; // two '\n's for data

							//send message
							_.each(this._client, function(response){
								response.write(str);
							});
						},
						//function for closing all the connection from the server side.
						//*NOT Recommended*. After closing from the server side, browser attempts to reconnect in about every 3 seconds(default).
						//You can specify retry timeout in the options of broadcast function.
						terminate: function(){
							_.each(this._client, function(response){
								response.end();
							});
							//log to warn
							console.log('All connection to SSE ' + path + ' has been terminated...'.red);
						},
					};
				}

				//next
				next();
			}else{
				//path has not been registered
				console.log('[middleware sse]', ('SSE.' + path + 'has not been registered').grey);
			}

		};

	};

};