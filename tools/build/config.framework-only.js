module.exports = {
	src: {
		root: '../../implementation', //path relative to this config.js
		index: 'index.html' //path relative to root
	},
	js: {
		targets: true
	},
	structure : { //path are relative to the distFolder and src.root above
		js: {
			lib: 'js/lib',
			'stage.js': false,
			'stage.min.js': false,
			'stage-widgets.js': false,
			'stage-widgets.min.js': false			
		},
		// static: {
		// 	template: {
		// 		'all.json': ''
		// 	},
		// 	resource: {}
		// },
		// themes: {
		// 	'default': {
		// 		css: {
		// 			'main.css' : 'themes/default/css/main.css'
		// 		},
		// 		fonts: 'themes/default/fonts'
		// 	}
		// },					
		// 'index.html': false,
		'RELEASE.md': 'RELEASE.md',
		'CHANGELOG.md': '../CHANGELOG.md',
		'LICENSE': '../LICENSE'
	}
};