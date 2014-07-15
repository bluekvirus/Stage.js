/**
 * This shared util reads an web root path and an html path and combine all the js on that page.
 *
 * options: {
 * 	root: * -- web root path of the html page
 * 	html: [index.html] -- the target html page relative to the above root path
 * 	excludeAttr: [dist] -- use '[excludeAttr] = false' attr to exclude a js out of the final all.js
 * 
 * }
 *
 * @author Tim.Liu
 * @created 2013.09.26
 * @updated 2014.03.13
 */

var buildify = require('buildify'),
_ = require('underscore'),
cheerio = require('cheerio'), //as server side jquery
colors = require('colors'),
path = require('path');

module.exports = {

	combine: function(options){

		if(!options || !options.root) throw new Error('Processing HTML::Can NOT find web root!!');
		options = _.extend({
			html: 'index.html',
			excludeAttr: 'dist',
		}, options);
		options.js = _.extend({
			name: 'all',
			after: '[region="app"]' //where to append the combined js
		}, options.js);

		var htmlPath = path.join(options.root, options.html);
		console.log('Processing HTML...'.yellow + path.resolve(htmlPath));

		var result;
		buildify().load(htmlPath).perform(function(content){

			//load html		
			var $ = cheerio.load(content);

			//extract build sections.
			var $script;
			var coreJS = buildify().setContent(';');
			$('script').each(function(index, el){
				$script = $(el);
				var srcPath = $script.attr('src');
				if(!$script.attr(options.excludeAttr)){
					if(srcPath){
						//ref-ed js, concat 
						coreJS.concat(path.join(options.root, srcPath));
						console.log('[included] '.green + srcPath);
					}else {
						//in-line
						coreJS.perform(function(content){
							return content + ';' + $script.html() + ';';
						});
					}
					$script.remove();
				}else {
					console.log('[excluded] '.yellow + srcPath);
					if(!$script.attr('persist')) $script.remove();
				}
				
			});

			$(options.js.after).after('\n\t\t<script src="js/' + options.js.name + '.min.js"></script>\n'); //Warning::Hard Coded Core Lib Path!
			content = $.html();

			console.log('Minifying...'.yellow);
			result = {
				'index.html': content.replace(/\n\s+\n/gm, '\n')
			};
			result[options.js.name + '.js'] = coreJS.getContent();
			result[options.js.name + '.min.js'] = coreJS.uglify().getContent() + ';';

		});		

		return result;
	}

};