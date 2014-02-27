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
	distFolder: 'dist',
	src: {
		root: '../../implementation',
		index: 'index.html',
	},
	structure : {
		js: {
			'all.min.js': true, //'all' is a hard coded name - see loadIndexHTML() in build.js
			'all.js': false,
		},
		static: {},
		themes: {
			_dev: {
				css: {
					'main.css':'themes/_dev/css/main.css'
				},
				fonts: 'themes/_dev/fonts'
			}
		},
		'index.html': false
	}
};