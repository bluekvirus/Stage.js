/**
 * This is the Client Dev Project Spawn Config.
 *
 * ================
 * Config/Structure
 * ================
 * {} - create folder
 * 'string' - copy file or folder
 * true/false - read from task memory, Gzip or not.
 *
 * 
 * @author Tim.Liu
 * @created 2013.09.25
 */

module.exports = {
	distFolder: 'dist',
	clientBase: '../../',
	index: 'tools/spawn/indices/scada.html',
	structure : {
		//web client
		app: {
			libs: {
				'bower.json': 'app/libs/bower.json',
				'buildify.js': 'app/libs/buildify.js',
				'EMPTY.js': 'app/libs/EMPTY.js',
				'map-fix.json': 'app/libs/map-fix.json',
				'map.json': 'app/libs/map.json',
				'README.md': 'app/libs/README.md',
				'package.json': 'app/libs/package.json'
			},
			scripts: {
				_try: {}, //autoload scripts - usually patches after dist built
				contexts: 'app/scripts/contexts',
				parts: { //let developer build project specific parts.
					editors: {
						_examples: 'app/scripts/core/parts/editors/_examples',
						'README.md': 'app/scripts/core/parts/editors/README.md',
						enhanced: {}
					},
					widgets: {
						_examples: 'app/scripts/core/parts/widgets/_examples',
						'README.md': 'app/scripts/core/parts/widgets/README.md',
						plugin: {}, //jquery plugins (as widgets)
						standard: {} //backbone view
					},
				},
				vendor: {}, //3rd party libs
				'libs.js': true, //cached srcs see - loadIndexHTML() in spawn.js;
				'core.js': false,
				'config.js': 'app/scripts/config.js' //-non minified or copied
			},
			static: {
				resources: 'app/static/resources',
				md: {},
			},
			themes: {
				_default: 'app/themes/_default',
				'README.md': 'app/themes/README.md'
			},
			'404.html': 'app/404.html',
			'index.html': false			
		},

		//web dev tools
		tools: {
			build: { //excluding the dist folder.
				config: 'tools/build/config',
				'build.js': 'tools/build/build.js',
			},
			shared: 'tools/shared',
			iconprep: 'tools/iconprep',
			codesnippets: 'tools/codesnippets',
			'package.json': 'tools/package.json'
		}
	}
};