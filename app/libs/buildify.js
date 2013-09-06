var buildify = require('buildify'),
path = require('path'),
fs = require('fs'),
ncp = require('ncp').ncp,
_ = require('underscore');

ncp.limit = 16;

buildify.task({
	name: 'all',
	depends: ['uri-js', 'noty', 'min'],
	task: function(){
		
	}
});

buildify.task({
	name: 'uri-js',
	task: function(){
		buildify()
			.setDir('bower_components/uri.js/src')
			.concat(['URI.js', 'IPv6.js', 'SecondLevelDomains.js', 'punycode.js', 'URITemplate.js', 'jquery.URI.js', 'URI.fragmentURI.js'])
			.save('../dist/uri.js')
			.uglify()
			.save('../dist/uri.min.js');
	}
});

buildify.task({
	name: 'noty',
	task: function(){
		var notyBase = 'bower_components/noty/';
		var list = fs.readdirSync(notyBase + 'js/noty/layouts');
		buildify()
			.setDir(notyBase + 'js/noty')
			.load('jquery.noty.js')
			.setDir(notyBase + 'js/noty/layouts')
			.concat(list)
			.setDir(notyBase)
			.save('dist/jquery.noty-with-layouts.js')
			.uglify()
			.save('dist/jquery.noty-with-layouts.min.js');

		ncp(notyBase + 'js/noty/themes', notyBase + 'dist/themes', function(err){
			if(err) console.log(err);
		})
	}
});

buildify.task({
	name: 'min',
	task: function(){
		var config = {
			'modernizr': 'modernizr.js'
		};

		_.each(config, function(js, pack){
			buildify().setDir(['bower_components', pack].join('/')).load(js).uglify().save([path.basename(js, '.js'), 'min', 'js'].join('.'));
		})
	}
});