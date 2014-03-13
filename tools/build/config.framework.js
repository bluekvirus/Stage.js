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
		index: 'index.html' //path relative to root
	},
	structure : { //path are relative to the distFolder and src.root above
		design: {
			assets: {},
			docs: {}
		},
		implementation: {
			js: {
				libs: {
					tracked: {
						'bower.json': 'js/libs/tracked/bower.json',
						'selected.json': 'js/libs/tracked/dist/selected.json'
					}
				},				
				'all.min.js': true, //'all' is a hard coded name - see loadIndexHTML() in build.js
				'all.js': false,
			},
			themes: {
				'default': 'themes/_dev'
			},
			'web+': 'static/web+',
			'index.html': false,
			'README.md': 'HOWTO.md'
		},
		tools: {
			build: {
				'build.js': '../tools/build/build.js',
				'config.dist.js': '../tools/build/config.sample.js'
			},
			iconprep: '../tools/iconprep',
			shared: '../tools/shared',
			'package.json': '../tools/package.json'
		}

	}
};