/**
 * This is the Application Build Config.
 *
 * ================
 * Config/Structure
 * ================
 * {} - create folder
 * 'string' - copy file or folder
 * true/false - read from task memory, minify or non-minify. 
 *
 * 
 * @author Tim.Liu
 * @created 2013.09.25
 */

module.exports = {
	clientBase: '../../',
	index: 'app/index.html',
	structure : {
		scripts: {
			_try: {}, //autoload scripts - usually patches after dist built
			// modules: { //layouts/page wrapper
			// 	context: {
			// 		login: {}, //UI modules for the login (pre-login) context
			// 		admin: {}	//UI modules for context after the login goes through				
			// 	},
			// 	special: {} //Non-UI worker modules.
			// },
			// vendor: {}, //3rd party libs
			// widgets: {
			// 	editor: {}, //form editors
			// 	plugin: {}, //jquery plugins (as widgets)
			// 	standard: {} //backbone view
			// },
			'app.min.js': true, //!!Hardcoded path see - loadIndexHTML() below;
			'config.js': 'app/scripts/config.js' //-non minified or copied
		},
		static: {
			menu: {
				'menu.json': 'app/static/menu/menu.json'
			},
			resources: 'app/static/resources'
		},
		themes: {
			_default: 'app/themes/_default'
		},
		'404.html': 'app/404.html',
		'index.html': true
	}
};