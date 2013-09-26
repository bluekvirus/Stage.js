/**
 * This is the development kit spawning tool. 
 * 1. It combines core scripts into dev dependency js files; (libs, infrustructure, core-modules, widgets)
 * 2. It creates proper front-end development project structure; (based on the client framework dev project and a config file)
 * 3. It gives the spawned project a build tool, but NOT another spawning tool.
 *
 * Do NOT spawn from a spawned project...
 *
 * =======
 * Config
 * =======
 * 1. a index.html indicating libs and lib groups used/tailored based on client framework's index.html.
 * 2. a config.js indicating spawned project structures, same as config in the build tool.
 *
 * =======
 * Design
 * =======
 * The config folder should contain as many types of application development projects config as there is.
 * So far the ones that we are interested are free (base-lib, infrustructure, core-modules) and admin (+form, grid and admin factory...)
 * Note that although we want to put the index.html together with the config.js in spawn config, it is hard to test and development for the client framework project.
 * Thus we put the different kinds of dev project index.html under client/app (client root) with naming convention:[type].index.html applied.
 *
 * Note that <script ... lib="N/A"></script> means the following scripts are not merged and replaced in the index.html.
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

		var srcCache = buildify().load('../shared/EMPTY.js');
		var currentJS = null;
		var srcMap = {};
		$('script').each(function(index, el){
			$script = $(el);
			var jsName = $script.attr('lib') || currentJS || 'core';

			if(currentJS && (currentJS !== jsName)){
				srcMap[currentJS + '.js'] = srcCache.getContent();
				currentJS = jsName;
				if(!srcMap[currentJS])
					srcCache.clear();
				else
					srcCache.setContent(srcMap[currentJS]);
			}else if (!currentJS)
				currentJS = jsName;

			if( jsName === 'N/A') return;

			var srcPath = $script.attr('src');
			if(srcPath){
				//ref-ed js, concat 
				srcCache.concat(config.clientBase + 'app/' + srcPath);
			}else {
				//in-line
				srcCache.perform(function(content){
					return content + ';' + $script.html() + ';';
				});
			}
			$script.remove();
		});
		srcMap[currentJS + '.js'] = srcCache.getContent();
		delete srcMap['N/A.js'];

		_.each(_.keys(srcMap).reverse(), function(libName){
			$('body .application-container').after('\n\t\t<script src="scripts/' + libName + '"></script>'); //Warning::We default the dev libs path to be under /scripts root.
		});
		content = $.html();

		//console.log(_.keys(srcMap));
		return _.extend({
			'index.html': content.replace(/\n\s+\n/gm, '\n')
		}, srcMap);
	}).getContent();

}



/*-----------Build Tasks-----------*/
buildify.task({
	name: 'admin',
	task: function(){
		var startTime = new Date().getTime();
		var type = 'admin';
		var cached = loadIndexHTML(type);
		mkdirp(config.distFolder, function(error){
			hammer.createFolderStructure(type, _.extend({cachedFiles: cached}, config), function(){
				console.log(('Spawn Task ['+ type +'] Complete').green, '-', moment.utc(new Date().getTime() - startTime).format('HH:mm:ss.SSS').underline);
			});
		});
	}
});