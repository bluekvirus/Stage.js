/**
 * All paths are relative to the devserver folder. (except below)
 * All paths that start with '/' will be treated as is, otherwise they will be resolved with __dirname (as the above dictates)
 *
 * @author Tim Lauv
 * @created 2014.4.18
 * @updated 2015.12.31
 * @updated 2016.12.14
 * @updated 2016.12.18 (Patrick.Zhu)
 */

module.exports = {

	port: '5000',

	//standard express-session middleware config
	session: {
		name: 'stagejs',
		secret: 'stagejs dev server session',
		cookie: {maxAge: null}, //or 24 * 60 * 60 * 1000 (ms)
		resave: true,
		saveUninitialized: true
		//store: [your customized session store (on top of db, k-v, file or memory) here]
	},

	//authentication & authorization 
	//(note that permissions are subject to interpretation in routers)
	auth: {
		enabled: false, //whether or not server.secure(router) will take effect
		users: {
			admin: {
				password: 'admin',
				permissions: 'all' //'all', 'none', [ ...specific... ]
			},

			user: {
				password: 'user',
				permissions: [
					'read',
					'update:self'
				]
			},

			guest: {
				password: '',
				permissions: 'none'
			}
		}
	},

	//optional file upload path and size limit configz
	upload: {
		path: '../tmp/file-uploads',
		size: 250 //MB (1024 * 1024 Bytes) & will truncate the file if >
	},

	//mount the client webroot folders
	//format - uri : webroot
	clients: {
		'/': ['../build/dist/site', '../../dist'], 
		'/dev': '../../implementation', //this will be available under uri /dev
		//'/devmobile': '../build/dist/mobile'
	},

	//websockets for soft real-time coms, each can have multiple channels
	websockets: [
		'/ws',
		'/dev/ws'
	],

	//use enabled: false to turn off LESS monitor.
	//only 1 webroot can be monitored
	lesswatch: {
		//enabled: false,
		client: '/dev',
		//multiple themes can be monitored under the watched webroot.
		themes: ['default', 'site', 'project'],
		//default collaborate folder path
		collaborate: 'specifics',
		//default main less file path
		main: 'main.less'
	},

	//use enabled: false to disable empty-ing all.json upon templates change.
	//only 1 webroot can be monitored
	tplwatch: {
		//enabled: false,
		client: '/dev'
	},

	//use enabled: false to disable this special change mirroring service
	//only 1 webroot can be monitored 
	cordovawatch: {
		enabled: false,
		client: '/dev',
		index: 'mobile.html',
		files: [ //in glob format
			'!bower_components/**',
			'js/**',
			'static/**/*.html',
			'themes/mobile/**',
			'!themes/**/less/**'
		],
		mirror: '../../../www'
	},

	//cors (front-end crossdomain ajax support)
	crossdomain: true,

	//proxied (back-end request pass-through/foward) -- (through http-proxy)
	proxied: {
		'/api': {
			//enabled: true,
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
	},

	//whether to use the express/connect errorhandler in general
	errorpage: true 

};