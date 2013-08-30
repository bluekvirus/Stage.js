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
path = require('path');

/*-----------Config/Structure-------*/
/**
 * {} - create folder
 * 'string' - copy file or folder
 * true/false - read from task memory, minify or non-minify.
 */
var config = {
	clientBase: '../../',
	'index.html': 'app/index.html',
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
					'lib.js': true, //minified, false means non-minified.
					'tpl.js': true,
					'application.js': true
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
//0. load index.html (replace lib, tpl and application js section)
function loadIndexHTML(){
	buildify().load(config.clientBase + config['index.html']).perform(function(content){
		//extract build sections.
		
		var buildSectCatcherStart = /<!-- build:(.*?)\s+(.*)-->/i, buildSectCatcherEnd = /<!-- endbuild -->/i, scriptRefCatcher=/<script.*?src="(.*?)"><\/script>/i, scriptCatcherStart = /<script .*?>/i, scriptCatcherEnd = /<\/script>/i;
		var lines = _.compact(content.split(/[\n\r]/));
		var sections = [];
		var currentSect = undefined;
		var embeddedScriptContent = '';
		_.each(lines, function(line){
			var match = buildSectCatcherStart.exec(line);
			if(match){
				if(currentSect) throw new Error('Incomplete Build Section', currentSect);
				currentSect = path.basename(match[2]);
				sections.push({src:currentSect, path:match[2]});
				console.log('src type', match[1], ',path', match[2], ',section', currentSect);
				return;
			}

			match = buildSectCatcherEnd.exec(line);
			if(match){
				console.log('section', currentSect, 'ends');
				currentSect = undefined;
				return;
			}

			//scripts in between:
			match = scriptRefCatcher.exec(line);
			if(match){
				console.log('caught script', match[1]);
			}
		});

		console.log(sections);
	});
}
//1. build lib
//2. build tpl - planed to be removed in the future.
//3. build application
//4. create structure

/*-----------Build Tasks-----------*/
buildify.task({
	name: 'admin',
	task: function(){
		loadIndexHTML();
	}
});


buildify.task({
	name: 'stage',
	task: function(){

	}
});