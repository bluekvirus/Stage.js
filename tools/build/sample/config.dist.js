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
 * The js config block below controls whether to enable this mode and where to put the combined js after processing the html.
 * You can also set the default js target to combine into if you don't specify [target="...js"] on a <script/> tag.
 * 
 * NOte: Each combined js target will have both minified and non-minified versions produced. (you can use both .js and .min.js in the structure block later)
 * (If you omit the js config block, the default combine target will be all.js and all.min.js)
 * (If js.targets is falsey, the multi-js mode processing will be disabled, regardless of the [target="...js"] attributes on <script/> tags)
 * 
 * @author Tim Lauv
 * @created 2013.09.25
 * @updated 2014.03.04 (minimum output)
 * @updated 2014.08.12 (empty file, multi-folder merge, multi-js combine targets)
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
		default: 'app.js',
		dynamic: 'js', //path relative to root, auto include dynamically loaded scripts.
	// 	after: '[region="app"]', or after: '[persist=true]:last-of-type',
	// 	min: false, //use false to indicate you want app.js instead of app.min.js in the final index.html

	// 	targets: { -- Use targets: false to turn off the multi-js-target mode.
	// 		'abc.js': {
	// 			after: ..., [default: append after previous target]
	// 			min: ... [default: true]
	// 		},
	// 		'xyz.js': {
	// 			...
	// 		},
	// 		'omitted.js': false, -- This will cause the build process to skip putting this js back after combine.
	// 								Note that you can still obtain 'omitted.js', but it won't appear in the built index.html.
	// 		...
	// 	}

	},
	
	//output
	structure : { //path are relative to the output folder and the src.root above respectively.

		js: {
			//'app.js': false,
			'app.min.js': true, //'app' is the name you set in the js config above.
		},
		static: { template: { 'all.json': 'static/template/all.json' } },
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