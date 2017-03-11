/**
 * Sample websocket channel handler(s)
 *
 * 1. a websocket can have many channel(s)
 * 2. a channel handler can be registered to multiple websockets (by socketPath/profile.websockets)
 *
 * 
 * Payload
 * -------
 * Client/Server will always send json string {"channel": "...", "payload": "..."}, only matching handler
 * can receive payload.
 *
 * ###Possible Payload Usage Senario A (this sample.js)
 * a payload can have 1 action and 1 data field, so that we can use action based messaging.
 *
 * ###Possible Payload Usage Senario B
 * a payload ...
 *
 * 
 * Client Socket
 * -------------
 * clientSock events: 'open', 'error', 'close', 'message'
 * clientSock apis: close(), send(), *json(), pause()/resume(), terminate()
 *
 *
 * Server Socket
 * -------------
 * serverSock events: 'listening', 'error', 'connection', 'headers'
 * serverSock apis: close(), handleUpgrade(), *broadcast()
 * 
 *
 * @author Tim Lauv
 * @created 2015.10.08
 */

module.exports = function(server){

	//channel, socketPath, handler
	server.tuneTo('room:public', '*', function(channel, payload, clientSock, serverSock){
		
		console.log('[realtime]', channel, payload);

		//example: switch on payload.action (client use ws.channel('room:public').json({action: ..., ...});)
		switch(payload.action){
			case 'join':
				clientSock.json({channel: channel, payload: {msg: 'welcome'}});
				serverSock.broadcast({channel: channel, payload:{msg: 'new client joined!', count: serverSock.clients.length}});
				break;
			case 'shout':
				serverSock.broadcast({channel: channel, payload: {data: payload.data}});
				break;
			default:
				break;
		}

	});

};