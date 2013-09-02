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
ncp = require('ncp').ncp;

ncp.limit = 16;

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
					active: {}, //view + interactions 
					data: {}, //data model bound (grid + form)
					readonly: {}, //view only
					special: {} //non-view-able
				},
				vendor: {}, //3rd party libs
				widgets: {
					editor: {}, //form editors
					plugin: {}, //jquery plugins (as widgets)
					standard: {} //backbone view
				},
				core: { //core lib, tpl and application js are built then put here.
					'core.js': true, //!!Hardcoded path see - loadIndexHTML() below;
				}, 
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
			'index.html': true,
			'robots.txt': 'app/robots.txt'
		}
	}
};

/*-----------Util/Steps------------*/
//0. load index.html (replace lib, tpl and application js section - compress js libs into core.js)
function loadIndexHTML(target){
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

		$('body').append('<script src="scripts/core/core.js"></script>'); //Warning::Hard Coded Core Lib Path!
		content = $.html();

		return {
			'core.js': coreJS.uglify().getContent(),
			'index.html': content
		}
	});

}

//1. create structure with pre-processed package.
function createFolderStructure(target, package) {
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
	while(targets.length > 0) {
		var currentTarget = targets.shift();
		if(_.isString(currentTarget.content)){
			//path string - copy
			var srcPath = path.join(config.clientBase, currentTarget.content);
			ncp(srcPath, currentTarget.path, function(error){
				if(!error) console.log(srcPath, '==>', currentTarget.path, '[OK]');
				else console.log(srcPath, '==>', currentTarget.path, '[ERROR:', error, ']');
			});
		}else if(_.isBoolean(currentTarget.content)){
			//true/false - dump from cached package
			if(package[currentTarget.key]){
				buildify().setContent(package[currentTarget.key]).save(currentTarget.path);
			}
		}else if(_.isObject(currentTarget.content)){
			//{} and {...} create folder and keep the bfs going
			var folderPath = path.join(currentTarget.path, currentTarget.key);
			mkdirp(folderPath, function(error){
				if(!error) console.log(folderPath, '{+}', '[OK]');
				else console.log(folderPath, '{+}', '[ERROR:', error,']');
			});

			_.each(currentTarget.content, function(subContent, subKey){
				targets.push({
					path: path.join(folderPath, subKey),
					content: subContent,
					key: subKey
				});
			});
		}
	}
}

/*-----------Build Tasks-----------*/
buildify.task({
	name: 'admin',
	task: function(){
		var pack = loadIndexHTML('admin');
		mkdirp(config.distFolder, function(error){
			createFolderStructure('admin', pack);
		});
	}
});


buildify.task({
	name: 'stage',
	task: function(){

	}
});