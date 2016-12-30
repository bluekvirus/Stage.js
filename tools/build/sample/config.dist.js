/**
 * This is the Application Build Config.
 * The build tool simply loads in the targeted .html, process it and combine all the js (also put the combined targets back)
 * After processing, '*.js' and 'index.html' will be in buffer, 
 * output them to desired location together with a wanted folder structure using this config file.
 * 
 * format used in .structure {} -- output folder structure
 * ----------------------------
 * 		name: {} - create folder with name
 *   	name: 'string' - copy file or folder as 
 *    	name: ['folderA', 'folderB'] - copy and merge folder content into 
 *     	'*.js': true/false - cached js combine target, use 'true'/'false' to choose whether to use the gzip version.
 *      'index.html': true/false - cached index page after js combine, use 'true'/'false' to choose whether to use the gzip version.
 *
 * format used in .js {} 
 * ---------------------
 * target: true/false (default: false)
 * dynamic: ''/['', ''] (default: '')
 * min: true/false (default: true)
 * 
 * Note: you can combine into multiple .js by using the [target="abc.js"] attr on the <script/> tags.
 * 		 If certain <script/> tag has an attibute of [target="js/foo.js"], it will be combined into that file.
 *    	 The following <script/> tags until the one with a different [target="js/bar.js"] attribute will also join the same file.
 * 
 * The js config block can be used to turn this multi-target mode off (by setting js.target : false). The [target="...js"] attributes on <script/> tags
 * will be ignored.
 * 
 * Note: The default combine targets are all-head.js/all-head.min.js and all-body.js/all-body.min.js respectively.
 * Note: Each combined js target will have both minified and non-minified versions produced and cached.
 *
 * format used in .src {}
 * ----------------------
 * root: '' -- project root
 * index: '' -- the main index.html
 * templates: '' -- where to find view templates (*.html)
 * 
 * @author Tim Lauv
 * @created 2013.09.25
 * @updated 2014.03.04 (minimum output)
 * @updated 2014.08.12 (empty file, multi-folder merge, multi-js combine targets)
 * @updated 2016.12.28 (modified js config block to accommodate the new js combine mechanism) @Patrick Zhu
 */

module.exports = {
	//input
	src: {
		root: '../../implementation', //path relative to this config.js
		index: 'index.html', //path relative to root
		templates: 'static/template', //path relative to root
	},

	//combine js (single/multiple mode)
	
	js: {
		target: true, //honor target attribute on script tags
		dynamic: 'js', //dynamic loading folder
	},
	
	//output
	structure : { //path are relative to the output folder and the src.root above respectively.

		js: {
			//'app.js': false,
			'app.min.js': true, //'app' is the name you set in the js config above.
		},
		static: { 
			template: { 'all.json': 'static/template/all.json' },
			resource: 'static/resource'
		},
		themes: {
			'project': {
				css: {
					'main.css':'themes/project/css/main.css'
				},
				fonts: 'themes/project/fonts',
				//img: { texture: 'themes/project/img/texture', 'sprite.png': 'themes/project/img/sprite.png' }
			}
		},
		'index.html': true,
		//'favicon.ico': 'favicon.ico'

	}
};