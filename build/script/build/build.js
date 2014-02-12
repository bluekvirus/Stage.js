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
//0. load index.html (replace lib, tpl and application js section - compress js libs into core.js [app.min.js])
function loadIndexHTML(target, cb){
	config = require('./config/'+target);
	if(!config) return console.log('Can NOT find build config for ', target);
	console.log('Processing Index...'.yellow);

	function doProcessIndexHtml() {
		buildify().load(config.clientBase + config.index).perform(function(content){

			//load html		
			var $ = cheerio.load(content);
			//patch it with autoloaded js		
			if(config._try) {
				var autoloadBase = url.parse(config.patchAutoLoad, true).query.payload;
				_.each(config._try, function(js){
					$('script[patch]').before('<script src="' + autoloadBase + '/' + js + '"></script>');
				});
			}

			//extract build sections.
			var $script;
			var coreJS = buildify().load('../shared/EMPTY.js');
			$('script').each(function(index, el){
				$script = $(el);
				if(!$script.attr('non-core')){
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
				}
				$script.remove();
			});

			$('body').append('\n\t\t<script src="scripts/app.min.js"></script>\n'); //Warning::Hard Coded Core Lib Path!
			content = $.html();

			cb({
				'app.js': coreJS.getContent(),
				'app.min.js': coreJS.uglify().getContent(),
				'index.html': content.replace(/\n\s+\n/gm, '\n')
			});
		});		
	};

	if(config.patchAutoLoad)
		request(config.patchAutoLoad, function(error, response, body){
			if (!error && response.statusCode == 200) {
				body = json.parse(body);
				config._try = [].concat(body.others, body.modules, body.extensions);
				console.log('patching in autoloaded (_try) js...'.blue);
			}else{
				console.log(('autoloaded (_try) js excluded...[' + config.patchAutoLoad + ']').red);
			}
			doProcessIndexHtml();
		});
	else
		doProcessIndexHtml();

}



/*-----------Build Tasks-----------*/
buildify.task({
	name: 'app',
	task: function(){
		var startTime = new Date().getTime();

		loadIndexHTML('app', function(cached){
			mkdirp(config.distFolder, function(error){
				hammer.createFolderStructure('app', _.extend({cachedFiles: cached}, config), function(){
					console.log('Build Task [app] Complete'.rainbow, '-', moment.utc(new Date().getTime() - startTime).format('HH:mm:ss.SSS').underline);
				});
			});
		});

	}
});
