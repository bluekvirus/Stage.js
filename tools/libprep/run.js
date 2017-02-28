/**
 * This is the web project resource management script.
 * It performs one of the following types of build:
 * 
 * 1. per lib customized build, since some of the libs comes in scattered src
 * 2. produce project bower.json, dist bower.json and starter-kit bower.json
 *
 * Usage
 * -----
 * node run.js <task name>
 * node run.js -- will run all of the defined tasks
 *
 * @author Tim Lauv
 * @updated 2016.12.30
 * 
 */

var buildify = require('buildify'),
path = require('path'),
fs = require('fs-extra'),
os = require('os'),
ncp = require('ncp').ncp,
colors = require('colors'),
_ = require('underscore');
_.str = require('underscore.string');

ncp.limit = 16;

/*!!!!!Change this if .bowerrc changes!!!!!*/
var implFolder = '../../implementation',
distFolder = path.join(implFolder, 'js', 'lib'),
libBase = path.join(implFolder, 'bower_components'),
themeBase = path.join(implFolder, 'themes');


buildify.task({
	name: 'fix-libs',
	depends: ['uri-js', 'jquery-color', 'jquery-file-upload', 'jquery-ui', /*'fake', 'min'*/],
	task: function(){}
});

/**
 * =======================================
 * Per Bower/Custom Lib Specifics (combine, minify)
 * =======================================
 */

buildify.task({
	name: 'uri-js',
	task: function(){
		buildify()
			.setDir(libBase + '/uri.js/src')
			.concat(['URI.js', 'IPv6.js', 'SecondLevelDomains.js', 'punycode.js', 'URITemplate.js', 'jquery.URI.js', 'URI.fragmentURI.js'], os.EOL + ';')
			.save('../dist/uri-all.js');
			// .uglify()
			// .save('../dist/uri.min.js');
	}
});

buildify.task({
	name: 'jquery-color',
	task: function(){
		buildify()
			.setDir(libBase + '/jquery-color')
			.concat(['jquery.color.js', 'jquery.color.svg-names.js'], os.EOL + ';')
			.save('dist/jquery-color-all.js');
			// .uglify()
			// .save('dist/jquery-color.js');
	}
});

buildify.task({
	name: 'jquery-file-upload',
	task: function(){
		buildify()
			.setDir(libBase + '/jquery-file-upload/js')
			.concat(['jquery.iframe-transport.js', 'jquery.fileupload.js'], os.EOL + ';')
			.save('../dist/jquery-file-upload-with-iframe.js');
			// .uglify()
			// .save('../dist/jquery-file-upload-with-iframe.min.js');
	}
});

buildify.task({
	name: 'jquery-ui',
	task: function(){
		buildify()
			.setDir(libBase + '/jquery-ui/ui')
			.concat(['jquery.ui.core.js', 'jquery.ui.widget.js', 'jquery.ui.mouse.js', 'jquery.ui.position.js', 'jquery.ui.draggable.js', 'jquery.ui.droppable.js', 'jquery.ui.resizable.js', 'jquery.ui.selectable.js', 'jquery.ui.sortable.js', 'jquery.ui.effect.js', 'jquery.ui.effect-blind.js', 'jquery.ui.effect-bounce.js', 'jquery.ui.effect-clip.js', 'jquery.ui.effect-drop.js', 'jquery.ui.effect-explode.js', 'jquery.ui.effect-fade.js', 'jquery.ui.effect-fold.js', 'jquery.ui.effect-highlight.js', 'jquery.ui.effect-pulsate.js', 'jquery.ui.effect-scale.js', 'jquery.ui.effect-shake.js', 'jquery.ui.effect-slide.js', 'jquery.ui.effect-transfer.js'], os.EOL + ';')
			.save('../dist/jquery-no-widget-ui.js')
			.setDir(libBase + '/jquery-ui/themes/base')
			.setContent('')
			.concat(['jquery.ui.core.css', 'jquery.ui.resizable.css', 'jquery.ui.selectable.css'])
			.save('../../dist/jquery-no-widget-ui.css');
	}

});

buildify.task({
	name: 'fake',
	task: function(){
		var config = ['fontawesome'];
		_.each(config, function(lib){
			buildify().setDir(path.join(libBase, lib)).setContent(';').save(lib + '.js');
		});
	}
});

buildify.task({
	name: 'min',
	task: function(){
		var config = {
			'modernizr': 'modernizr.js'
		};

		_.each(config, function(js, pack){
			buildify().setDir(path.join(libBase, pack)).load(js).uglify().save([path.basename(js, '.js'), 'min', 'js'].join('.'));
		});
	}
});

/**
 * ========================================
 * Collect default css for some of the libs
 * (into themes/default/css/addon-defaults.css)
 * ========================================
 */
buildify.task({
	name: 'collect-css', //.setContent('')
	task: function(){
		buildify()
			.setDir(libBase + '/jquery-ui')
			.concat(['dist/jquery-no-widget-ui.css'])
			.setDir(libBase + '/animate.css')
			.concat(['animate.css'])
			.setDir(libBase + '/amaranjs')
			.concat(['dist/css/amaran.min.css'])
			.setDir(themeBase + '/default/css')
			.save('addon-defaults.css');
	}
});

/**
 * =================================================
 * Produce needed bower.json x2 from meta-bower.json
 * =================================================
 */

buildify.task({
	name: 'prep-bower',
	task: function(){
		var indents = '\t', bowerInfo = require('./bower.json');

		//produce dist package bower.json
		buildify().setContent(JSON.stringify(
			_.extend(_.omit(bowerInfo, 
				'devDependencies', 'kitDevDependencies', 'siteDependencies',
				'monitored', 'resolutions')),
			null, indents
		)).setDir(implFolder + '/../').save('bower.json');

		//produce starter-kit bower.json
		buildify().setContent(JSON.stringify(_.extend({
			name: 'my.project',
			private: true,
			devDependencies: _.extend(bowerInfo.kitDevDependencies, {
				stage: '^' + bowerInfo.version
			}),
			dependencies: {},
			'open-source-libs': bowerInfo.monitored
		}), null, indents)).setDir(implFolder).save('starter-kit.bower.json');
	}
});