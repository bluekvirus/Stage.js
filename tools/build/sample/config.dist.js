/**
 * This is the Application Build Config.
 * The build tool simply loads in the targeted .html, process it and combine all the js (also put the combined targets back)
 * After processing, '*.js' and 'index.html' will be in buffer, 
 * output them to desired location together with a wanted folder structure using this config file.
 * 
 * +Structure
 * ----------------
 * name: {} - create folder with name
 * name: 'string' - copy file or folder as 
 * name: ['folderA', 'folderB'] - copy and merge folder content into 
 * '*.js': true/false - cached js combine target, use 'true'/'false' to choose whether to use the gzip version.
 * 'index.html': true/false - cached index page after js combine, use 'true'/'false' to choose whether to use the gzip version.
 * 
 * Note: you can combine into multiple .js by using the [target="abc.js"] attr on the <script/> tags.
 * If certain <script/> tag has an attibute of [target="xxx/xxx.js"], then itself will be redirected into that file path.
 * Also the following <script/> tags until the next <script/> tag with [target="xxx/xxx.js"] attribute will be combined and redirected into that file path.
 * The js config block below controls whether to enable this mode and where to put the combined js after processing the html.
 * 
 * Note: Each combined js target will have both minified and non-minified versions produced. (you can use both .js and .min.js in the structure block later)
 * (If you omit the js config block, the default combine target will be all-head.js/all-head.min.js and all-body.js/all-body.min.js)
 * (If js.targets is falsey, the multi-js mode processing will be disabled, regardless of the [target="...js"] attributes on <script/> tags)
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