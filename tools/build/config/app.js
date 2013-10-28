/**
 * This is the Application Build Config.
 *
 * ================
 * Config/Structure
 * ================
 * {} - create folder
 * 'string' - copy file or folder
 * true/false - read'n'save from task memory, gzip or not.
 *
 * =====================
 * Client Deployment Seq
 * =====================
 * 1. check this config (patchAutoLoad url)
 * 2. build web client
 * 3. change server [production/test]:config to point to tools/build/dist/app
 * 
 * @author Tim.Liu
 * @created 2013.09.25
 */

module.exports = {
	distFolder: 'dist',
	clientBase: '../../',
	index: 'app/index.html',
	patchAutoLoad: 'http://localhost:4000/tryscripts?payload=scripts/_try&type=js', //WARNING:: This needs to point to your config:development app server.
	structure : {
		scripts: {
			_try: {}, //autoload scripts - usually patches after dist built
			'app.min.js': true, //!!Hardcoded path see - loadIndexHTML() below;
			//'app.js': false,
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
		'index.html': false
	}
};