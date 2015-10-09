/**
 * For registering channel handlers under /channels to websockets by socket paths.
 *
 * @author Tim Lauv
 * @created 2015.10.08
 */

var _ = require('underscore');

module.exports = function(server){

	var reg = server.set('channels', {}).get('channels'),
	profile = server.get('profile');
	_.each(profile.websockets, function(socketPath){
		reg[socketPath] = {};
	});

	server.tuneTo = function(channel, socketPath, handler){
		if(!handler){
			handler = socketPath;
			socketPath = '*';
		}

		if(socketPath == '*')
			socketPath = profile.websockets;

		if(_.isString(socketPath))
			socketPath = [socketPath];

		_.each(socketPath, function(sp){
			reg[sp][channel] = handler; // = fn(channel, payload, clientSock, serverSock)
		});
	};

};