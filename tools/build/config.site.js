module.exports = {
	src: {
		root: '../../implementation', //path relative to this config.js
		index: 'index.html', //path relative to root
		templates: 'static/template', //path relative to root
	},
	js: {
		dynamic: 'js/site',
		targets: false
	},
	structure : { //path are relative to the distFolder and src.root above
		'worker-json.js': 'bower_components/ace-builds/src-noconflict/worker-json.js',
		'worker-javascript.js': 'bower_components/ace-builds/src-noconflict/worker-javascript.js',
		js: {
			'all-head.min.js': true,
			'all-body.min.js': true,
		},
		themes: {
			'site': {
				css: {
					'main.css':'themes/site/css/main.css'
				},
				img: { 
					texture: 'themes/site/img/texture', 
					'sprite.png': 'themes/site/img/sprite.png'
				},
				fonts: 'themes/site/fonts'
			}
		},
		static: {
			template: { 'all.json': 'static/template/all.json' },
			resource: {
				default: {
					diagram: 'static/resource/default/diagram',
					download: 'static/resource/default/download'
				},
				'en-US': 'static/resource/en-US'
			},
			docs: '../docs'
		},		
		'index.html': true,
		'HOWTO.md': 'HOWTO.md',
		'CHANGELOG.md': '../CHANGELOG.md'
		
	}
};