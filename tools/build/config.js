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
 * 3. change server [production/test]:config to point to tools/build/dist/
 * 
 * @author Tim.Liu
 * @created 2013.09.25
 */

module.exports = {
	distFolder: '../../implementation/static/resource/default/data/framework', //path relative to this config.js
	src: {
		root: '../../implementation', //path relative to this config.js
		index: 'index.html', //path relative to root
	},
	structure : { //path are relative to the distFolder and src.root above
		js: {
			'bower.json': 'js/libs/tracked/bower.json',
			'all.min.js': true, //'all' is a hard coded name - see loadIndexHTML() in build.js
			'all.js': false,
		},
		static: {
			'web+': 'static/web+',
			'resource': {
				'default': {
					'data': {},
					'md': {}
				},
				'zh_CN':{
					'data': {},
					'md': {},
					'i18n.json': 'static/resource/zh_CN/i18n.json'
				}
			}
		},
		themes: {
			_dev: {
				css: {
					src: 'themes/_dev/css/include',
					'main.css':'themes/_dev/css/main.css'
				},
				fonts: 'themes/_dev/fonts'
			}
		},
		'index.html': false,
		'README.md': 'static/resource/default/md/framework.md'
	}
};