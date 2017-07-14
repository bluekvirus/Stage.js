module.exports = {
	src: {
		root: '../../implementation', //path relative to this config.js
		index: 'index.html' //path relative to root
	},
	js: {
		targets: true
	},
	structure : { //path are relative to the distFolder and src.root above
		css: {
			'default.css':'themes/default/css/main.css'
		},
		fonts: 'themes/default/fonts',
		js: {
			'modernizr.js': false,
			'modernizr.min.js': false,
			'stage.js': false,
			'stage.min.js': false,
			'stage-editors.js': false,
			'stage-editors.min.js': false,
			'stage-widgets.js': false,
			'stage-widgets.min.js': false
		},					
		'index.html': 'starter-kit.index.html',
		'RELEASE.md': 'RELEASE.md',
		'CHANGELOG.md': '../CHANGELOG.md',
		'LICENSE': '../LICENSE'
	}
};