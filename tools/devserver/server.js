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
server = express();


//dealing with different profiles 
var args = process.argv.slice(2);
server.set('profile', require(__dirname + '/profile/' + (args[0] || 'default')));


var profile = server.get('profile');
//mount different clients
profile.clients[''] = '../../implementation';
_.each(profile.clients, function(filePath, uriName){
	server.use('/' + uriName, express.static(path.join(__dirname, filePath)));
	console.log('[Web root]', uriName.yellow, '[', filePath, ']');
});

//monitor LESS themes
//TBI

//load routers
load('routers').into(server);
//mount them for each client
//TBI

//start server
server.listen(profile.port || 4000, function(){
	console.log('Server started on', profile.port.yellow);
});




