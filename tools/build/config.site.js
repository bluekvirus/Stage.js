/**
 * This is the Application Build Config.
 * The build tool simply loads in an index.html file (or any .html file) process it and combine all the js.
 * After processing, 'all.js', 'all.min.js' and 'index.html' will be in buffer, 
 * output them to desired location together with a wanted folder structure using this config file.
 * 
 * Config/Structure
 * ----------------
 * {} - create folder
 * 'string' - copy file or folder
 * 'all.js', 'all.min.js' and 'index.html' are predefined file placeholder, use 'true'/'false' to choose whether to gzip them.
 * 
 * @author Tim.Liu
 * @created 2013.09.25
 * @updated 2014.03.04 (minimum output)
 */

module.exports = {
	src: {
		root: '../../implementation', //path relative to this config.js
		index: 'index.html', //path relative to root
		templates: 'static/template', //path relative to root
	},
	structure : { //path are relative to the distFolder and src.root above

		js: {
			'all.min.js': true, //'all' is a hard coded name - see loadIndexHTML() in build.js
			lib: {
				'dependencies.json': 'js/lib/dependencies.json'
			}
		},
		themes: {
			'default': {
				css: {
					'main.css':'themes/site/css/main.css'
				},
				img: 'themes/site/img',
				fonts: ['themes/default/fonts','themes/site/fonts'], //merge multiple folders
				'index.html': 'themes/site/index.html'
			}
		},
		static: {
			template: { 'all.json': 'static/template/all.json' },
			resource: {
				default: {
					diagram: 'static/resource/default/diagram',
					download: 'static/resource/default/download'
				}
			}
		},		
		'index.html': true,
		'HOWTO.md': 'HOWTO.md',
		'CHANGELOG.md': '../CHANGELOG.md'
		
	}
};