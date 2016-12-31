/**
 * This is the LESS to CSS compile util
 *
 * Option
 * ------
 * root: path to the theme folder which contains /less
 *
 * @author Tim Lauv
 * @created 2014.04.18
 * @updated 2016.12.18 (Patrick.Zhu)
 */

var _ = require('underscore'),
path = require('path'),
fs = require('fs-extra'),
less = require('less'),
colors = require('colors'),
autoprefixer = require('autoprefixer'),
cleancss = new (require('clean-css'))({keepSpecialComments: 0});

module.exports = function(root, main, collaborate){
	main = main || 'main.less';
	var mainLess = path.join(root, 'less', main);

	//less.parser has been decrepted. use less.render instead for less.js 2.5.1
	fs.readFile(mainLess, {encoding: 'utf-8'}, function(err, data){
		//if error, throw err
		if(err) throw err;

		//get main.less folder path and setup collaborate lesses path
		var mainFolder = path.dirname(mainLess);
		
		//less.parser has been decrepted, use less.render for less.js 2.x.x
		less.render(data.toString(), {
			//give base paths for compling (./ > local > themes > bower)
			paths: [path.join(root, 'less'), path.join(root), path.join(root, '..'), path.join(root, '..', '..', 'bower_components')],
			plugins: [require('less-plugin-glob')]
		}, function(error, output){
			//if error, print error and return
			if(error){
				console.log('LESS compile error\n', error);
				return;
			}

			//path for main.css
			var mainCss = path.resolve(path.join(mainLess, '..', '..', 'css', 'main.css'));
			//use autoprefixer(options).compile if needs be in the future.
			var css = autoprefixer(/*options*/).process(output.css).css;
			//fix the google-font issue (remove them)
			css = css.replace(/@import url\(.*?fonts.*?\)/, '');
			css = cleancss.minify(css);
			fs.outputFileSync(mainCss, css);
			console.log('[Theme'.yellow, path.basename(root).cyan, 'recompiled:'.yellow, mainCss.cyan, ']'.yellow);	
		});
	});



};