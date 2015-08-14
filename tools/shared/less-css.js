/**
 * This is the LESS to CSS compile util
 *
 * Option
 * ------
 * root: path to the theme folder which contains /less
 *
 * @author Tim.Liu
 * @created 2014.04.18
 */

var _ = require('underscore'),
path = require('path'),
fs = require('fs-extra'),
less = require('less'),
colors = require('colors'),
autoprefixer = require('autoprefixer'),
cleancss = new (require('clean-css'))({keepSpecialComments: 0});

module.exports = function(root, main){
	main = main || 'main.less';
	var mainLess = path.join(root, 'less', main);
	var parser = new(less.Parser)({
		paths: [
			path.join(root, 'less'), 
			path.join(root, '..', '..', 'bower_components')
		]
	});
	fs.readFile(mainLess, {encoding: 'utf-8'}, function (err, data) {
		if (err) throw err;
		parser.parse(String(data), function(e, tree){
			if(e) return console.log('LESS Parser Error'.red, e);
			var mainCss = path.resolve(path.join(mainLess, '..', '..', 'css', 'main.css'));
			fs.ensureFileSync(mainCss);
			//use autoprefixer(options).compile if needs be in the future.
			var css = autoprefixer(/*options*/).process(tree.toCSS()).css;
			//fix the google-font issue (remove them)
			css = css.replace(/@import url\("\/\/fonts.*?"\)/, '');
			css = cleancss.minify(css);
			fs.outputFileSync(mainCss, css);
			console.log('[Theme'.yellow, path.basename(root).cyan, 'recompiled:'.yellow, mainCss.cyan, ']'.yellow);				
		});
	});

};