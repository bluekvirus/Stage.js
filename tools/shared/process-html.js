/**
 * This shared util reads an web root path and an html path and combine all the js on that page.
 *
 * options: {
 * 	root: * -- web root path of the html page
 * 	html: [index.html] -- the target html page relative to the above root path
 * 	js: 'string' -- represents the path of the folder name for dynamic loading OR
 * 		['string', 'string', ... ] -- represents the paths of the folder names for dynamic loading
 * 		
 * 		or
 * 		{ 
 * 			targets: true/false, 
 * 			dynamic: 'string' or ['string', 'string', '...'],
 * 			min: true/false
 * 		}
 * 			
 * 		targets -- whether this processing script will honor target attribute on <script/> tags in index.html
 * 		dynamic -- a single folder or an array of folders to be auto-included in the build.
 * 		min 	-- whether or not to produce (in cache) and use (in index) the minified version of same js target.
 * }
 *
 * @author Tim Lauv
 * @created 2013.09.26
 * @updated 2014.03.13
 * @updated 2014.08.12 (+ exclude, include and target attr to <script/> tags)
 * @updated 2016.12.30 (modified js combining mechanism) Patrick, Tim 
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
				targets: false, //default option does not honor the targets tag in index.html
				dynamic: '',
				min: true
			};
		}else if(_.isArray(options.js)){
			dynamicJSFolder = options.js;
			options.js = {
				targets: false,
				dynamic: dynamicJSFolder,
				min: true
			};
		}else if(_.isString(options.js)){
			dynamicJSFolder = options.js;
			options.js = {
				targets: false,
				dynamic: dynamicJSFolder,
				min: true
			};
		}else if(_.isObject(options.js) && !_.isFunction(options.js)){ //array and functions are also objects in JS
			options.js = _.extend({
				targets: false,
				dynamic: '',
				min: true
			}, options.js);
		}else{
			console.log('build error::configuration for JS is not supported.'.red);
		}

		var htmlPath = path.join(options.root, options.html);
		console.log('Processing HTML...'.yellow + path.resolve(htmlPath));

		//process the html with <script/> tags
		var content = fs.readFileSync(htmlPath, {encoding: 'utf8'});

		//parse html		
		var $ = cheerio.load(content);

		//inject dynamically loaded scripts into the html (before last script tag which has app.run())
		if(options.js.dynamic){
			var $i = $('#_entrypoint');
			if(!$i.length) 
				$i = $('body > script').last();

			//check whether options.js.dynamic is a string
			if(_.isString(options.js.dynamic)) options.js.dynamic = [options.js.dynamic];

			//dynamically loading js folders
			_.each(options.js.dynamic, function(folder){
				_.each(globule.find(path.join(folder, '**/*.js'), {cwd: options.root}), function(jsFile){
					if($('script[src="' + jsFile + '"]').length) return; //skipped
					$i.before('<script src="' + jsFile + '"></script>');
					console.log('[dynamically loaded script]'.grey, jsFile);
				});
			});
		}

		var result;
		//process srcipt tags in head
		result = createJSTargets(result, $, 'head > script', 'js/all-head.js', options);
		//process script tags in body
		result = createJSTargets(result, $, 'body > script', 'js/all-body.js', options);

		//finialize and minify result JS's and index.html
		console.log('Minifying...'.yellow);
		//minify javascripts
		if(options.js.min)
			_.each(result, function(js, path){
				var minPath = !(new RegExp('.min.js').test(path)) && path.replace('.js', '.min.js'); //avoid infinite loop
				result[minPath] = buildify().setContent(js).uglify().getContent();
			});
		//add index.html
		result['index.html'] = $.html().replace(/\n\s+\n/gm, '\n');

		return result;
	}

};

//helper function to see if a script should be in/excluded (include="foo,bar,build,..." exclude="bar,build")
function shouldInclude($script, cfgName){
	var includes = _.compact(($script.attr('include') || '').split(','));
	var excludes = _.compact(($script.attr('exclude') || '').split(','));
	if(includes.length > 0)
		return _.some(includes, function(name){return _.str.trim(name) === cfgName;});
	if(excludes.length > 0)
		return 	!_.some(excludes, function(name){return _.str.trim(name) === cfgName;});
	return true;
}

//helper function that combines js scripts into cached string targets.
function createJSTargets(cache, $, selector, defaultTarget, options){
	cache = cache || {};
	defaultTarget = defaultTarget || 'js/all.js';

	var $scripts = $(selector);

	if(!$scripts){
		console.log('error::process-html::createJSTargets has no argument.'.red);
		return cache;
	}else
		$scripts.length = _.size($scripts);

	var $script,
		$currentTargetLeadEl,
		currentTarget = '',
		usedTargetNames = {};

	$scripts.each(function(index, el){
		$script = $(el);
		var srcPath = $script.attr('src'),
			target = $script.attr('target');

		//check whether to include this script in the build
		if(shouldInclude($script, options.cfgName)){

			//no current target, give default target as current target.
			if(!currentTarget) 
				currentTarget = defaultTarget;
			//different target, swap.
			if(target && options.js.targets && currentTarget !== target){
				if(usedTargetNames[target])
					throw new Error('error::process-html::target name/path has conflict.'.red);
				usedTargetNames[currentTarget] = true;
				currentTarget = target;
				$currentTargetLeadEl = undefined;
			}
			//ensure leading script el
			if(!$currentTargetLeadEl){
				$currentTargetLeadEl = $script;
				$currentTargetLeadEl.attr('src', options.js.min ? currentTarget.replace('.js', '.min.js') : currentTarget)
					.removeAttr('target')
					.removeAttr('include')
					.removeAttr('exclude')
					.removeAttr('persist');
			}

			//ensure cache spot
			if(!cache[currentTarget])
				cache[currentTarget] = ';';
			//append javascript
			if(srcPath){//loaded from file
				cache[currentTarget] += buildify().setDir(options.root).load(srcPath).getContent().concat(os.EOL + ';');
				//output info
				console.log('[included:'.green + currentTarget +'] '.green + srcPath);
			}else{//inline style
				cache[currentTarget] += $script.html() + os.EOL + ';';
			}

			//remove non-leading script tags
			if($currentTargetLeadEl !== $script)
				$script.remove();

		}else{
			console.log('[excluded] '.yellow + (srcPath || 'inline-styled script'));
			if(!$script.attr('persist'))
				$script.remove();
		}
	});

	return cache;
}