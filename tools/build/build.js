/**
 * This is the build script for building your web application front-end.
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
hammer = require('../shared/hammer');

var config = {};

/*-----------Util/Steps------------*/
//0. load index.html (replace lib, tpl and application js section - compress js libs into core.js [app.min.js])
function loadIndexHTML(target){
	config = require('./config/'+target);
	if(!config) return console.log('Can NOT find build config for ', target);
	console.log('Processing Index...'.yellow);

	return buildify().load(config.clientBase + config.index).perform(function(content){
		//extract build sections.
		var $ = cheerio.load(content);
		var $script;
		var coreJS = buildify().load('../shared/EMPTY.js');
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

		$('body').append('\n\t\t<script src="scripts/app.min.js"></script>\n'); //Warning::Hard Coded Core Lib Path!
		content = $.html();

		return {
			'app.js': coreJS.getContent(),
			'app.min.js': coreJS.uglify().getContent(),
			'index.html': content.replace(/\n\s+\n/gm, '\n')
		}
	}).getContent();

}



/*-----------Build Tasks-----------*/
buildify.task({
	name: 'app',
	task: function(){
		var startTime = new Date().getTime();

		var cached = loadIndexHTML('app');
		mkdirp(config.distFolder, function(error){
			hammer.createFolderStructure('app', _.extend({cachedFiles: cached}, config), function(){
				console.log('Build Task [app] Complete'.rainbow, '-', moment.utc(new Date().getTime() - startTime).format('HH:mm:ss.SSS').underline);
			});
		});
	}
});
