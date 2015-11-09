/**
 * This shared util reads an web root path and an html path and combine all the js on that page.
 *
 * options: {
 * 	root: * -- web root path of the html page
 * 	html: [index.html] -- the target html page relative to the above root path
 * 	js: {
 * 		default: [all.js] -- the default js target to combine into if there is no target="" attr on a <script/>
 * 		after: ...
 * 		min: ...
 * 		targets: {
 * 			'abc.js': {
 * 				after: -- the position this target will be put after after script combining;
 * 						  use 'false' to omit putting the combined target back into the html;
 * 			 	min: -- whether to use the minified version when putting back;
 * 			},
 * 			'omitted.js': false, -- This will cause the build process to skip putting this js back after combine.
 * 									Note that you can still obtain 'omitted.js', but it won't appear in the built index.html.
 * 			,
 * 			...
 * 			
 * 			-- if you don't specify a target's 'after' config, it will be appended after the previous target
 * 		
 * 		}
 * 	}
 * }
 *
 * @author Tim Lauv
 * @created 2013.09.26
 * @updated 2014.03.13
 * @updated 2014.08.12 (+ exclude, include and target attr to <script/> tags)
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
		options.js = _.extend({
			default: 'all.js',
			after: '[region="app"]',
			min: true,
			targets: { //-- by default we turn the multi-js-target mode on
				// 'abc.js': {
				// 		//append settings
				// 		after: '[region="app"]', //position after combining in html
				// 		min: true //whether to use the minified version 
				// 		//(note that both non-min and min versions will be produced by this tool regardless of the min setting above)
				// },
				//other js combine targets
			}
		}, options.js);

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

		var getTargetJS;
		//Note that no matter what target a <script/> tag has, options.js.targets must be truthy to enable multi-js mode.
		if(options.js.targets){
			options.js.targets = _.isObject(options.js.targets)?options.js.targets:{};
			getTargetJS = function(name){
				if(!targetJS[name]){
					targetJS[name] = {
						name: name,
						script: buildify().setContent(';')
					};
					//find its setting
					options.js.targets[name] = options.js.targets[name] || {min: true};
					//console.log('js target detected:'.grey, name);
				}
				return targetJS[name];
			};
		}
		else {
			options.js.targets = {};
			getTargetJS = function(){
				return targetJS[options.js.default];
			};
		}

		//process the html with <script/> tags
		var content = fs.readFileSync(htmlPath, {encoding: 'utf8'});

		//parse html		
		var $ = cheerio.load(content);

		//prepare the default js target
		var targetJS = {};
		if(!targetJS[options.js.default]) {
			targetJS[options.js.default] = {
				name: options.js.default,
				script:buildify().setDir(options.root).setContent(';')
			};
			options.js.targets[options.js.default] = {
				after: options.js.after,
				min: options.js.min
			};
		}

		//inject dynamically loaded scripts into the html (before last script tag which has app.run())
		if(options.js.dynamic){
			var $i = $('body > script').last();
			_.each(globule.find(path.join(options.js.dynamic, '**/*.js'), {cwd: options.root}), function(jsFile){
				if($('script[src="' + jsFile + '"]').length) return; //skipped
				$i.before('<script src="' + jsFile + '"></script>');
				console.log('[dynamically loaded script]'.grey, jsFile);
			});
		}

		//go through script tags in the .html file.
		var $script;
		$('body > script').each(function(index, el){
			$script = $(el);
			var srcPath = $script.attr('src');
			var target = $script.attr('target') || options.js.default;
			if(shouldInclude($script)){
				if(srcPath){
					//ref-ed js, concat (separate with ;)
					getTargetJS(target).script
						//.perform(function(js){return js + ';';})
						.concat(srcPath, os.EOL + ';');
					console.log('[included:'.green + getTargetJS(target).name.grey +'] '.green + srcPath);
				}else {
					//in-line
					getTargetJS(target).script.perform(function(js){
						return js + ';' + $script.html() + ';';
					});
				}
				$script.remove();
			}else {
				console.log('[excluded] '.yellow + srcPath);
				if(!$script.attr('persist')) $script.remove();
			}
			
		});
		
		//append combined target back according to the js config block
		var $prev;
		_.each(options.js.targets, function(setting, name){
			
			if(!setting) return;
			
			var script = '\n\t<script src="js/' + (setting.min?name.replace('.js', '.min.js'):name) + '"></script>';

			if(setting.after) {
				$prev = $(setting.after);
				$prev.after(script);
			}else {
				if($prev) $prev.after(script);
			}

			if($prev) $prev = $prev.next();

		});
	
		content = $.html();

		console.log('Minifying...'.yellow);
		result = {
			'index.html': content.replace(/\n\s+\n/gm, '\n')
		};
		_.each(options.js.targets, function(setting, name){
			if(!targetJS[name]) {
				console.warn('js target'.red, name.grey, 'not found...'.red);
				return;
			} 
			result[name] = targetJS[name].script.getContent();
			result[name.replace('.js', '.min.js')] = targetJS[name].script.uglify().getContent() + ';';
		});

		return result;
	}

};