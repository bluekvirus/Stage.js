/**
 * This is the LESS themes watch-n-recompile bot
 *
 * Only the main.less @ themes/[theme-name]/less/main.less will be recompiled.
 * Any file change under themes/[theme-name]/ will trigger the recompile.
 * Produced main.css will always be @ themes/[theme-name]/css/main.css
 *
 * Only themes specified in the leswatch list will be monitored
 * server.get('profile').lesswatch 
 *
 * @author Tim Liu
 * @created 2013.10.27
 * @updated 2014.04.18
 */

var _ = require('underscore'),
path = require('path'),
fs = require('fs'),
filed = require('filed'),
watch = require('watch'),
less = require('less'),
colors = require('colors'),
autoprefixer = require('autoprefixer'),
cleancss = new (require('clean-css'))({keepSpecialComments: 0});

_.str = require('underscore.string');

module.exports = function(server){

	var profile = server.get('profile');
	if(!profile.lesswatch) return;

	if(!_.isArray(profile.lesswatch)){
		if(!_.isString(profile.lesswatch)){
			//config object
			var selectedClient = profile.lesswatch.client;
			profile.lesswatch = profile.lesswatch.themes;
		}
		//single theme name string
		if(_.isString(profile.lesswatch))
			profile.lesswatch = [profile.lesswatch];
	}

	//convert name array into name map
	var watchlist = _.object(profile.lesswatch, profile.lesswatch);

	// watch the client themes folder
	var themesFolder = path.join(profile.clients[selectedClient?selectedClient:'/'], 'themes');
	fs.readdir(themesFolder, function(err, list){
		if(err) throw err;
		_.each(list, function(theme){
			//monitor only the selected theme(s) in config.
			if(theme in watchlist){
				var root = path.join(themesFolder, theme);
				watch.createMonitor(root, {
					ignoreDotFiles: true
				}, function(monitor){
					// monitor.on("created", function (f, stat) {
						//monitor .less file creation
					// });
					monitor.on("changed", function (f, curr, prev) {
						//monitor .less file change and icons/resized folder change
						recompileTheme(f, root);
					});
					// monitor.on("removed", function (f, stat) {
					// });
					console.log(('[Theme ' + theme + ': .less files monitored]').yellow, '-', ('lessjs v' + less.version.join('.')).grey);
					return monitor;
				});
			}
		});
	});

	//recompile main.less worker method:
	function recompileTheme(f, root){
		if(path.extname(f) !== '.less') return;

		var lessDir = path.join(root, 'less');
		var mainLess = path.join(lessDir, 'main.less');
		var parser = new(less.Parser)({
			paths: ['.', lessDir]
		});
		console.log('[Changed:'.yellow, f, ']'.yellow);
		fs.readFile(mainLess, {encoding: 'utf-8'}, function (err, data) {
			if (err) throw err;
			parser.parse(String(data), function(e, tree){
				if(e) return console.log('LESS Parser Error'.red, e);
				var mainCss = path.resolve(path.join(mainLess, '../../', 'css', 'main.css'));
				var mainCssFile = filed(mainCss);
				//use autoprefixer(options).compile if needs be in the future.
				var css = autoprefixer(/*options*/).process(tree.toCSS()).css;
				css = cleancss.minify(css);
				mainCssFile.write(css);
				mainCssFile.end();
				console.log('[Theme'.yellow, path.basename(root).cyan, 'recompiled:'.yellow, mainCss.cyan, ']'.yellow);				
			});
		});

	};	

}