/**
 * Custom middleware script for Server-sent events(SSE).
 *
 * Usage:
 * 	1). register SSE url in the configuration of server (/devserver/profile/<profile>)
 * 	2). use server.sse[<url-name>].broadcast(<data>, {options<retry, event, id>}) to send message to all the listeners.
 * 	2).	in the deveserver/routers, just use router.get('<url>') to send message to the client.
 * 	3).	connection will be automatically closed once a close call initiated from client.
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

				//give it an uniqe id for later reference
				_.extend(res, {__sseuid: _.uniqueId('stagejs-sse-')});

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
					server.sse[path]._clients = _.without(server.sse[path]._clients, function(client){ return client.__sseuid === res.__sseuid; });

					console.log('SSE connection ' + path.yellow +' closed.');
				});

				//store the response handler to the global server object
				if(server.sse[path]){

					//sse object already exists, give it an uniqe id for later reference
					server.sse[path]._clients.push(res);

				}else{

					//newly added path, create object and give a broadcast function
					server.sse[path] = {
						//array to store all the response handlers that calls this sse
						_clients: [res],
						//function for broadcasting data to all the clients
						//options could contain id(message id), event(event name), retry(retry timeout in ms) ...
						broadcast: function(data, options){
							//no _clients stored, return
							if(!this._clients.length) return;

							var str = '';
							//honor options
							_.each(options, function(opt, key){
								str += key + ': ' + opt + '\n'; //single '\n' for options
							});
							//honor data
							str += 'data: ' + (_.isString(data) ? data : JSON.stringify(data)) + '\n\n'; // two '\n's for data

							//send message
							_.each(this._clients, function(response){
								response.write(str);
							});
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