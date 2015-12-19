//share your progress with others. 
module.exports = {
	src: {
		root: '../../implementation', //path relative to this config.js
	},
	structure : { //path are relative to the distFolder and src.root above
		// design: {
		// 	assets: 'design/assets',
		// 	docs: 'design/docs'
		// },
		implementation: {
			js: 'js',
			static: {
				template: 'static/template',
				resource: 'static/resource'
			},
			themes: {
				'project': {
					less: 'themes/project/less'
				}
			},
			'index.html': 'index.html',
			//'favicon.ico': 'favicon.ico',
			'bower.json': 'bower.json' //need to be merged with target project
		},
		tools: {
			build: {
				'config.dist.js': '../tools/build/config.dist.js',
				'config.export.js': '../tools/build/config.export.js'
			},
			devserver: {
				middlewares: '../tools/devserver/middlewares',
				routers: '../tools/devserver/routers',
				channels: '../tools/devserver/channels',
				profile: '../tools/devserver/profile',
			},
			'package.json': '../tools/package.json' //need to be merged with target project
		}
	}
};