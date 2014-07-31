/**
 * All paths are relative to the devserver folder. (except below)
 * All paths that start with '/' will be treated as is, otherwise they will be resolved with __dirname (as the above dictates)
 *
 * simplest setting:
 * -----------------
 * {
 * 	lesswatch: 'default'
 * }
 * which will serve '../../implementation' on 'localhost:4000/' with theme 'default' monitored
 *
 * @author Tim.Liu
 * @created 2014.4.18
 */

module.exports = {

	port: '5000',

	//mount the client webroot folders
	clients: {
		//format - uri:webroot path
		//normally if you don't put '/' path here, '/': '../../implementation' will be added for you.
		'/': '../build/dist/site', 
		'/dev': '../../implementation', //this will be available under uri /dev
		'/devmobile': '../build/dist/mobile'
	},

	//use lesswatch:false to turn off LESS monitor.
	lesswatch: {
		//default client: '/'.
		//use client: '[path]' set in the clients config section above to change the monitored webroot.
		//only 1 webroot can be monitored with its theme changes, which will, most likely always, be your development one.
		client: '/dev',

		//multiple themes can be monitored under the watched webroot.
		//use -name in themes array to exclude.
		themes: ['default', 'site']
	},

	//use :false or '' to disable empty-ing all.json upon templates change.
	tplwatch: '../../implementation/static/template',

	//cors (front-end crossdomain ajax support)
	crossdomain: true,

	//proxied (back-end request pass-through/foward) -- (through http-proxy)
	proxied: {
		'/api': {
			enabled: true,
			path: '', //can change /api to /abc on targeted host
			https: false, //default on http requests
			host: '172.22.16.100',
			port: '8080',
			username: '',
			password: '',
			headers: {
				//'Authorization': 'API token',
				'Origin': 'abc.com',
				//...
			}
		},
		//can be multiple
		//'/other': {}, '/special': {}, '/3rd-party': {} ...
	}

};