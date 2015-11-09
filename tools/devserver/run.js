/**
 * Local development server per client. (api-box-lite based on Expressjs4)
 *
 * 1. Serving the implementation/test/deploy folder (multi-profile, multiple root folders per profile supported)
 * 2. Monitoring all the LESS theme folders
 * 3. Registering Restful APIs through express.router()
 *
 * [Exclusive to the api-box (local dev api engine), use the full/platform version if want the following features]
 * 5. DB support
 * 6. User/Session/Group
 *
 * @author Tim Lauv
 * @created 2014.4.18
 * @updated 2015.09.12
 */

var express = require('express'),
load = require('express-load'),
path = require('path'),
_ = require('underscore'),
colors = require('colors'),
info = require('./package.json');
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
}, require(__dirname + '/profile/' + profile), {
	root: __dirname,
	///////////////////use this to resolve all the path/////////////////// 
	resolve: function(filePath){
		var relative = filePath.match(/^\//) ? '/' : this.root;
		return path.resolve(path.join(relative, filePath));
	}
}
)).get('profile');


//loading...
var options = {verbose:false, cwd: profile.root};
load('util', options)
//.then('models', options) //omitted for simplicity in the devserver (Model = ORM schema, validations, pre/post hooks)
.then('channels', options)
.then('middlewares', options) //order specified in inject.js
.then('routers', options)
.then('bot', options)
//bot.builder: build the server stack with channels, middlewares, routes
//bot.watchers.*: start the watcherz
.into(server);


//start server
profile.port = args[1] || profile.port;
server.listen(profile.port, function(){
	console.log('Server started on', profile.port.yellow);
});
