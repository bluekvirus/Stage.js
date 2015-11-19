module.exports = {
	src: {
		root: '../../implementation', //path relative to this config.js
	},
	structure : { //path are relative to the distFolder and src.root above
		implementation: {
			js: {},
			static: {
				template: {
					'all.json': ''
				},
				resource: {
					'en-US': 'static/resource/en-US',
					'en-ES': 'static/resource/en-ES',
					'zh-CN': 'static/resource/zh-CN',
					'zh-TW': 'static/resource/zh-TW',
				}
			},
			themes: {
				'default': {
					less: 'themes/default/less'
				}
			},
			'index.html': 'starter-kit.index.html',
			'bower.json': 'starter-kit.bower.json'
		},
		tools: {
			build: {
				'run.js': '../tools/build/run.js',
				'config.dist.js': '../tools/build/sample/config.dist.js',
				'config.export.js': '../tools/build/sample/config.export.js'
			},
			themeprep: '../tools/themeprep',
			devserver: '../tools/devserver',
			shared: '../tools/shared',
			'package.json': '../tools/package.json'
		},
		'LICENSE': '../LICENSE',
		'gitignore': 'starter-kit.gitignore'
	}
};