/**
 * This is the build script for building your web application front-end.
 *
 * 1. read build config;
 * 2. load target html and process libs on it; (we also support patching in the autoloaded scripts)
 * 3. output all-in-one.js and index.html and web client structure (resources, themes, config and statics...)
 *
 * @author Tim.Liu
 * @created 2013.09.26
 */

var buildify = require('buildify'),
_ = require('underscore'),
cheerio = require('cheerio'), //as server side jquery
path = require('path'),
mkdirp = require('mkdirp'),
colors = require('colors'),
moment = require('moment'),
hammer = require('../shared/hammer'),
request = require('request'),
url = require('url'),
json = require('json3');

var config = {};

/*-----------Util/Steps------------*/
//0. load index.html (replace lib, tpl and application js section - compress js libs into all.js
function loadIndexHTML(cb){
	config = require('./config.js');
	if(!config) return console.log('Can NOT find build config.js');
	console.log('Processing Index...'.yellow);

	function doProcessIndexHtml() {
		buildify().load(path.join(config.src.root, config.src.index)).perform(function(content){

			//load html		
			var $ = cheerio.load(content);

			//extract build sections.
			var $script;
			var coreJS = buildify().load('../shared/EMPTY.js');
			$('script').each(function(index, el){
				$script = $(el);
				if(!$script.attr('exclude')){
					var srcPath = $script.attr('src');
					if(srcPath){
						//ref-ed js, concat 
						coreJS.concat(path.join(config.src.root, srcPath));
					}else {
						//in-line
						coreJS.perform(function(content){
							return content + ';' + $script.html() + ';';
						});
					}
				}
				$script.remove();
			});

			$('#main').after('\n\t\t<script src="js/all.min.js"></script>\n'); //Warning::Hard Coded Core Lib Path!
			content = $.html();

			cb({
				'all.js': coreJS.getContent(),
				'all.min.js': coreJS.uglify().getContent(),
				'index.html': content.replace(/\n\s+\n/gm, '\n')
			});
		});		
	};

	doProcessIndexHtml();

}



/*-----------Build Tasks-----------*/
buildify.task({
	name: 'app',
	task: function(){
		var startTime = new Date().getTime();

		loadIndexHTML(function(cached){
			mkdirp(config.distFolder, function(error){
				hammer.createFolderStructure(_.extend({cachedFiles: cached}, config), function(){
					console.log('Build Task [app] Complete'.rainbow, '-', moment.utc(new Date().getTime() - startTime).format('HH:mm:ss.SSS').underline);
				});
			});
		});

	}
});
