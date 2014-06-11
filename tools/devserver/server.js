/**
 * Local development server per client. (api-box-lite based on Expressjs4)
 *
 * 1. Serving the implementation/test/deploy folder (multi-profile, multiple root folders per profile supported)
 * 2. Monitoring all the LESS theme folders
 * 3. Registering Restful APIs through express.router()
 *
 * [Exclusive to the api-box (local dev api engine), use the full/platform version if want the following features]
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
console.log('========================================');
console.log(info.name.blue, '[', 'profile:'.grey, profile.yellow,']');
console.log('@version'.grey, info.version.blue);
console.log('@author'.grey, info.author.blue);
console.log(new Date().toString().grey);
console.log('========================================');
profile = server.set('profile', _.extend({
	//profile default settings:
	port: 4000,
	clients: {},
}, require(__dirname + '/profile/' + profile))).get('profile');
	//fix web root(s)' path(s)
if(!profile.clients['/']) profile.clients['/'] = '../../implementation';
_.each(profile.clients, function(filePath, uriName){
	var relative = filePath.match(/^\//) ? '/' : __dirname;
	profile.clients[uriName] = path.resolve(path.join(relative, filePath));
});

//loading...
var options = {verbose:true, cwd: __dirname};
load('util', options)
.then('middlewares', options) //not yet injected
.then('routers', options) //not yet injected
.then('bot', options) //inject middlewares and routers into server
.into(server);


//start server
server.listen(profile.port, function(){
	console.log('Server started on', profile.port.yellow);
});




