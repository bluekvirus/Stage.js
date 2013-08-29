/**
 * This is the build script for both building 
 *
 * Part I: Admin - the administrator panel
 * Part II: Stage - the front pages
 *
 * of our web application/site.
 */

var buildify = require('buildify'),
_ = require('underscore');

/*-----------Config/Structure-------*/
/**
 * {} - create folder
 * 'string' - copy file or folder
 * true/false - read from task memory, minify or non-minify.
 */
var config = {
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
//1. build lib
//2. build tpl
//3. build application
//4. create structure

/*-----------Build Tasks-----------*/
buildify.task({
	name: 'admin',
	task: function(){

	}
});


buildify.task({
	name: 'stage',
	task: function(){

	}
});