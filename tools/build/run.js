/**
 * This is the build script for building your web application front-end.
 *
 * 1. read build config;
 * 2. load target html and process libs on it; (we also support patching in the autoloaded scripts)
 * 3. output all-in-one.js and index.html and web client structure (resources, themes, config and statics...)
 *
 * @author Tim.Liu
 * @created 2013.09.26
 * @updated 2014.03.13
 */

var program = require('commander'), 
_ = require('underscore'),
path = require('path'),
colors = require('colors'),
moment = require('moment'),
hammer = require('../shared/hammer'),
processor = require('../shared/process-html'),
rimraf = require('rimraf'),
AdmZip = require('adm-zip'),
targz = new (require('tar.gz'))(9, 9),
fs = require('fs-extra'),
wrench = require('wrench');

program.version('1.0.0')
		.usage('[options] <output folder>')
		.option('-C --config [dist]', 'config name used for the build, \'abc\' means to use \'config.abc.js\'')
		.option('-G --targz <path>', 'put the output path into a compressed .tar.gz file')
		.option('-Z --zip <path>', 'put the output path into a compressed .zip file [use only on non-Unix env]');

program.command('*').description('build your web front-end project using customized configure').action(function(outputFolder){
	var startTime = new Date().getTime();
	program.config = program.config || path.basename(outputFolder);

	if(!program.config) throw new Error('You must choose a config.[profile].js for this build...');

	//0. load build config according to --config
	var configName = './config.' + program.config + '.js';
	var config = require(configName);
	console.log('Start building using config ['.yellow, configName, '] >> ['.yellow, outputFolder, ']'.yellow);

	//1. start processing index page
	var result = config.src.index ? processor.combine({
		root: config.src.root,
		html: config.src.index,
		js: config.js,
		cfgName: program.config
	}): {};

	//2. combine view templates into all.json
	if(config.src.templates){
		var tplBase = path.join(__dirname, config.src.root, config.src.templates);
		if(fs.existsSync(tplBase)){
			var tpls = wrench.readdirSyncRecursive(tplBase);
			tpls = _.reject(tpls, function(name){
				return !name.match(/\.html$/);
			});
			var all = {};
			_.each(tpls, function(name){
				var tpl = fs.readFileSync(path.join(tplBase, name), {encoding: 'utf8'});
				name = name.split(path.sep).join('/');//normalize file path from different OS
				console.log('[template]'.green, name, '+'.green);
				all[name] = tpl.replace(/[\n\t]/g, '');
			});
			var allJSON = path.join(tplBase, 'all.json');
			fs.outputJSONSync(allJSON, all);
			console.log(tplBase, '=>', allJSON);	
		}
		else console.log('Templates not found...'.grey, tplBase);


	}

	//3. hammer the output folder structure out
	hammer.createFolderStructure(_.extend({cachedFiles: result, output: outputFolder}, config), function(){
		//check if --G
		if(program.targz) {
			//tar.gz
			var tarball = path.normalize(program.targz);
			targz.compress(outputFolder, tarball, function(err){
				if(err) console.log('ERROR'.red, err.message);
				else console.log('Gzipped into ', tarball.yellow);
			});
		}
		//check if --Z
		if(program.zip) {
			//zip (problem on Unix based machine)
			var zip = new AdmZip();
			zip.addLocalFolder(outputFolder);
			var name = path.normalize(program.zip);
			zip.writeZip(name);
			console.log('Zipped into ', name.yellow);
		}
		console.log('Build Task [app] Complete'.rainbow, '-', moment.utc(new Date().getTime() - startTime).format('HH:mm:ss.SSS').underline);
	});

});

program.parse(process.argv);

