/**
 * This is the build script for both building 
 *
 * Part I: Admin - the administrator panel
 * Part II: Stage - the front pages
 *
 * of our web application/site.
 */

var buildify = require('buildify'),
_ = require('underscore'),
cheerio = require('cheerio'), //as server side jquery
path = require('path'),
mkdirp = require('mkdirp'),
ncp = require('ncp').ncp,
colors = require('colors'),
moment = require('moment');

ncp.limit = 16; //ncp concurrency limit

/*-----------Config/Structure-------*/
/**
 * {} - create folder
 * 'string' - copy file or folder
 * true/false - read from task memory, minify or non-minify.
 */
var config = {
	distFolder: '../dist',
	clientBase: '../../',
	index: {
		admin : 'app/index.html'
	},
	structure : {
		admin: {
			scripts: {
				_try: {}, //autoload scripts
				modules: { //layouts/page wrapper
					context: {
						login: {}, //UI modules for the login context
						admin: {}	//UI modules for when the login go through				
					},
					special: {} //Non-UI worker modules.
				},
				vendor: {}, //3rd party libs
				widgets: {
					editor: {}, //form editors
					plugin: {}, //jquery plugins (as widgets)
					standard: {} //backbone view
				},
				'core.js': true, //!!Hardcoded path see - loadIndexHTML() below;
				'config.js': 'app/scripts/config.js' //-non minified or copied
			},
			static: {
				menu: {
					'menu.json': 'app/static/menu/menu.json'
				},
				resources: 'app/static/resources'
			},
			themes: {
				_default: 'app/themes/_default'
			},
			'404.html': 'app/404.html',
			'index.html': true
		}
	}
};

/*-----------Util/Steps------------*/
//0. load index.html (replace lib, tpl and application js section - compress js libs into core.js)
function loadIndexHTML(target){
	console.log('Processing Index...'.yellow);

	return buildify().load(config.clientBase + config.index[target]).perform(function(content){
		//extract build sections.
		var $ = cheerio.load(content);
		var $script;
		var coreJS = buildify().load('EMPTY.js');
		$('script').each(function(index, el){
			$script = $(el);
			if($script.attr('non-core')) return;
			var srcPath = $script.attr('src');
			if(srcPath){
				//ref-ed js, concat 
				coreJS.concat(config.clientBase + 'app/' + srcPath);
			}else {
				//in-line
				coreJS.perform(function(content){
					return content + ';' + $script.html() + ';';
				});
			}
			$script.remove();
		});

		$('body').append('\n\t\t\t<script src="scripts/core/core.js"></script>\n'); //Warning::Hard Coded Core Lib Path!
		content = $.html();

		return {
			'core.js': coreJS.uglify().getContent(),
			'index.html': content.replace(/\n\s+\n/gm, '\n')
		}
	}).getContent();

}

//1. create structure with pre-processed package.
function createFolderStructure(target, package, done) {
	console.log('Creating Folders & Files...'.yellow);

	var structure = config.structure[target];
	var targets = [];
	var baseDir = path.join(config.distFolder, target);
	_.each(structure, function(content, key){
		targets.push({
			path: path.join(baseDir, key),
			content: content,
			key: key
		});
	});
	//use iteration - bfs to create/copy/dump the files/folders
	//
	function iterator(done){
		if(targets.length > 0) {
			var currentTarget = targets.shift();
			if(_.isString(currentTarget.content)){
				//path string - copy
				var srcPath = path.join(config.clientBase, currentTarget.content);
				ncp(srcPath, currentTarget.path, function(error){
					if(!error) console.log(srcPath, '==>'.grey, currentTarget.path, '[OK]'.green);
					else console.log(srcPath, '==>'.grey, currentTarget.path, '[ERROR:'.red, error, ']'.red);
					iterator(done);
				});
			}else if(_.isBoolean(currentTarget.content)){
				//true/false - dump from cached package
				if(package[currentTarget.key]){
					buildify().setContent(package[currentTarget.key]).save(currentTarget.path);
				}else {
					console.log(currentTarget.key, 'not found in cache'.red);
				}
				iterator(done);
			}else if(_.isObject(currentTarget.content)){
				//{} and {...} create folder and keep the bfs going
				mkdirp(currentTarget.path, function(error){
					if(!error) {
						console.log(currentTarget.path, '{+}'.grey, '[OK]'.green);
						_.each(currentTarget.content, function(subContent, subKey){
							targets.push({
								path: path.join(currentTarget.path, subKey),
								content: subContent,
								key: subKey
							});
						});						
					}
					else console.log(currentTarget.path, '{+}'.grey, '[ERROR:'.red, error,']'.red);
					iterator(done);
				});
			}
		}else 
			done();
	};
	iterator(done);
}

/*-----------Build Tasks-----------*/
buildify.task({
	name: 'admin',
	task: function(){
		var startTime = new Date().getTime();

		var pack = loadIndexHTML('admin');
		mkdirp(config.distFolder, function(error){
			createFolderStructure('admin', pack, function(){
				console.log('Build Task [admin] Complete'.rainbow, '-', moment.utc(new Date().getTime() - startTime).format('HH:mm:ss.SSS').underline);
			});
		});
	}
});


buildify.task({
	name: 'stage',
	task: function(){

	}
});