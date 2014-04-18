/**
 * Local development server per client. (ajax-box-lite based on Expressjs4)
 *
 * 1. Serving the implementation/test/deploy folder (multi-profile, multiple root folders per profile supported)
 * 2. Monitoring all the LESS theme folders
 * 3. Registering mock Restful APIs through express.router()
 *
 * [Exclusive to the ajax-box (local dev cloud), use the platform version if want the following features]
 * 5. DB support
 * 6. Users/Session/Roles
 *
 * @author Tim.Liu
 * @created 2014.4.18
 */

var express = require('express'),
load = require('express-load'),
path = require('path'),
_ = require('underscore'),
colors = require('colors'),
info = require('./package.json')
server = express();


//dealing with different profiles 
var args = process.argv.slice(2),
profile = args[0] || 'default';
server.set('profile', require(__dirname + '/profile/' + profile));
console.log('========================================');
console.log(info.name.blue, '[', profile.yellow,']');
console.log('@version'.grey, info.version.blue);
console.log('@author'.grey, info.author.blue);
console.log(new Date().toString().grey);
console.log('========================================');

profile = server.get('profile');
_.extend({
	//profile default settings:
	port: 4000,
	clients: {},
}, profile);
//mount different clients
if(!profile.clients['/']) profile.clients['/'] = '../../implementation';
_.each(profile.clients, function(filePath, uriName){
	profile.clients[uriName] = path.resolve(path.join(__dirname, filePath));
	server.use(uriName, express.static(profile.clients[uriName]));
	console.log('[Web root]', uriName.yellow, '[', profile.clients[uriName], ']');
});

//mount routers for each client
server.mount = function(routerFile, uri){
	var router = express.Router();
	if(uri) server.use(uri, router);
	else {
		_.each(profile.clients, function(uri){
			server.use([uri, routerFile.name].join('/'), router);
		});
	}
	return router;
}

//activate bots(utils)
var options = {verbose:true, cwd: __dirname};
load('bots', options)
//load routers
.then('routers', options)
.into(server);

//start server
server.listen(profile.port, function(){
	console.log('Server started on', profile.port.yellow);
});




