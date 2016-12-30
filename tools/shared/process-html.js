/**
 * This shared util reads an web root path and an html path and combine all the js on that page.
 *
 * options: {
 * 	root: * -- web root path of the html page
 * 	html: [index.html] -- the target html page relative to the above root path
 * 	js: 'string' -- represents the path of the folder name for dynamic loading OR
 * 		['string', 'string', ... ] -- represents the paths of the folder names for dynamic loading OR
 * 		{ target: true/false, dynamic: 'string' or ['string', 'string', '...'] }
 * 			-- target defines whether this processing script will honor target attribute on <script/> tags in index.html
 * 			-- dynamic defines a single folder or an array of folders to be auto-included in the build.
 * }
 *
 * @author Tim Lauv
 * @created 2013.09.26
 * @updated 2014.03.13
 * @updated 2014.08.12 (+ exclude, include and target attr to <script/> tags)
 * @updated 2016.12.28 (modified js combining mechanism) @Patrick Zhu
 */

var buildify = require('buildify'),
_ = require('underscore'),
cheerio = require('cheerio'), //as server side jquery
colors = require('colors'),
path = require('path'),
os = require('os'),
fs = require('fs-extra'),
globule = require('globule');
_.str = require('underscore.string');

module.exports = {

	combine: function(options){

		if(!options || !options.root) throw new Error('Processing HTML::Can NOT find web root!!');
		options = _.extend({
			html: 'index.html',
			cfgName: ''
		}, options);

		var dynamicJSFolder;
		//check options.js type
		if(!options.js){
			options.js = {
				target: false, //default option does not honor the target tag in index.html
				dynamic: '',
				min: true
			};
		}else if(_.isArray(options.js)){
			dynamicJSFolder = options.js;
			options.js = {
				target: false,
				dynamic: dynamicJSFolder,
				min: true
			};
		}else if(_.isString(options.js)){
			dynamicJSFolder = options.js;
			options.js = {
				target: false,
				dynamic: dynamicJSFolder,
				min: true
			};
		}else if(_.isObject(options.js) && !_.isFunction(options.js)){ //array and functions are also objects in JS
			_.extend({
				target: false,
				dynamic: '',
			}, options.js, {min: true});
		}else{
			console.log('build error::configuration for JS is not supported.'.red);
		}

		var htmlPath = path.join(options.root, options.html);
		console.log('Processing HTML...'.yellow + path.resolve(htmlPath));

		var result;
		//helper function
		function shouldInclude($script){
			var includes = _.compact(($script.attr('include') || '').split(','));
			var excludes = _.compact(($script.attr('exclude') || '').split(','));
			if(includes.length > 0)
				return _.some(includes, function(name){return _.str.trim(name) === options.cfgName;});
			if(excludes.length > 0)
				return 	!_.some(excludes, function(name){return _.str.trim(name) === options.cfgName;});
			var specific = $script.attr(options.cfgName);
			if(specific !== undefined) return _.isString(specific)?(specific === 'true'?true:false):specific;
			return true;
		}

		//process the html with <script/> tags
		var content = fs.readFileSync(htmlPath, {encoding: 'utf8'});

		//parse html		
		var $ = cheerio.load(content);

		//inject dynamically loaded scripts into the html (before last script tag which has app.run())
		if(options.js.dynamic){
			var $i = $('body > script').last();

			//check whether options.js.dynamic is a string
			if(_.isString(options.dynamic.js)) options.dynamic.js = [options.dynamic.js];

			//dynamically loading js folders
			_.each(options.js.dynamic, function(folder){
				_.each(globule.find(path.join(folder, '**/*.js'), {cwd: options.root}), function(jsFile){
					if($('script[src="' + jsFile + '"]').length) return; //skipped
					$i.before('<script src="' + jsFile + '"></script>');
					console.log('[dynamically loaded script]'.grey, jsFile);
				});
			});
		}
		//process srcipt tags in head
		createJSTargets($('head > script'), 'all-head.js');
		//process script tags in body
		createJSTargets($('body > script'), 'all-body.js');

		//finialize and minify result JS's and index.html
		console.log('Minifying...'.yellow);
		//minify javascripts
		_.each(result, function(js, path){
			var minPath = !(new RegExp('.min.js').test(path)) && path.replace('.js', '.min.js'); //avoid infinite loop
			result[minPath] = buildify().setContent(js).uglify().getContent();
		});
		//add index.html
		result['index.html'] = $.html().replace(/\n\s+\n/gm, '\n');

		return result;

		//function that processes given array of scripts
		function createJSTargets($scripts, defaultTarget){
			result = result || {};

			if(!$scripts){
				console.log('error::process-html::createJSTargets has no argument.'.red);
				return;
			}

			var $script,
				$currentEl,
				currentTarget = '',
				cachedScript = ';';

			//check options.js.target
			if(options.js.target){//honor target attribute

				$scripts.each(function(index, el){
					$script = $(el);
					var srcPath = $script.attr('src'),
						target = $script.attr('target');

					//check whether to include this script in the build
					if(shouldInclude($script)){

						//check whether there is a target attribute in the script tag
						if(target){

							if(!currentTarget){//first element, no action needed
								currentTarget = target;
							}else{//not first element, save previously cached JS's into result

								//save cached scripts into result
								if(!result[currentTarget])
									result[currentTarget] = cachedScript;
								else
									console.log('error::process-html::target name/path has conflict.'.red);

								//modify $currentEl's attributes
								$currentEl.attr('src', currentTarget).removeAttr('target').removeAttr('include').removeAttr('exclude').removeAttr('persist'); //removeAttr can only take one attribute at a time.;
								//reset $currentEl, cachedScript and currentTarget
								$currentEl = undefined; //use the branch outside later to setup new $currentEl
								currentTarget = target;
								cachedScript = ';';
							}

						}else{//no target

							//no current target, give default target as current target.
							if(!currentTarget) currentTarget = defaultTarget;

						}

						//append javascript
						if(srcPath){//loaded from file

							cachedScript += buildify().load(srcPath).getContent().concat(os.EOL + ';');
							//output info
							console.log('[included:'.green + currentTarget +'] '.green + srcPath);

						}else{//inline style
							cachedScript += $script.html() + os.EOL + ';';
						}

						//save current object if there is no $currentEl, otherwise remove.
						if(!$currentEl)
							$currentEl = $script;
						else
							$script.remove();

					}else{
						console.log('[excluded] '.yellow + (srcPath || 'inline-styled script'));
						if(!$script.attr('persist'))
							$script.remove();
					}
				});

				//!!Trim last bulk of scipts after .each
				//!!Caveat: $scripts is an object, cannot use index to judge it is last or not.
				if(!result[currentTarget])
					result[currentTarget] = cachedScript;
				else
					console.log('error::process-html::target name/path has conflict.'.red);

				//reset $currentEl attributes
				$currentEl.attr('src', currentTarget).removeAttr('target').removeAttr('include').removeAttr('exclude').removeAttr('persist'); //removeAttr can only take one attribute at a time.;

			}else{//do not honor target attribute

				//iterate through the script tags
				$scripts.each(function(index, el){
					$script = $(el);
					var srcPath = $script.attr('src');
					//check whether to include this script in the build
					if(shouldInclude($script)){

						if(srcPath){//loaded from file

							cachedScript += buildify().load(srcPath).getContent().concat(os.EOL + ';');
							//output info
							console.log('[included:'.green + defaultTarget +'] '.green + srcPath);

						}else{//inline style
							cachedScript += $script.html() + os.EOL + ';';
						}

						//since ignoring the taget, only stores the first script tag
						if(!$currentEl)
							$currentEl = $script;
						else
							$script.remove();

					}else{
						console.log('[excluded] '.yellow + (srcPath || 'inline-styled script'));
						if(!$script.attr('persist'))
							$script.remove();
					}
				});
				//trim the first script tag
				$currentEl.attr('src', defaultTarget).removeAttr('target').removeAttr('include').removeAttr('exclude').removeAttr('persist'); //removeAttr can only take one attribute at a time.;
				//insert into result tag
				if(!result[defaultTarget])
					result[defaultTarget] = cachedScript;
				else
					console.log('error::process-html::target name/path has conflict.'.red);

			}
		}
	}

};
