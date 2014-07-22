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
fs = require('fs-extra'),
less = require('less'),
colors = require('colors'),
gaze = require('gaze'),
compiler = require('../../shared/less-css.js');

_.str = require('underscore.string');

module.exports = function(server){

	var profile = server.get('profile');
	if(!profile.lesswatch) return;

	var selectedClient = "/";
	if(!_.isArray(profile.lesswatch)){
		if(!_.isString(profile.lesswatch)){
			//config object
			selectedClient = profile.lesswatch.client;
			profile.lesswatch = profile.lesswatch.themes;
		}
		//single theme name string
		if(_.isString(profile.lesswatch))
			profile.lesswatch = [profile.lesswatch];
	}

	//convert name array into name map
	var watchlist = _.object(profile.lesswatch, profile.lesswatch);

	// watch the client themes folder
	var themesFolder = path.join(profile.clients[selectedClient], 'themes');
	fs.readdir(themesFolder, function(err, list){
		if(err) throw err;
		var themeFolders = [];
		_.each(list, function(theme){
			//monitor only the selected theme(s) in config.
			if(theme in watchlist){
				var root = path.join(themesFolder, theme);
				themeFolders.push({ name: theme, glob: path.join(root, '**/*.less') });
			}
		});

		gaze(_.map(themeFolders, function(t){return t.glob;}), function(err, watcher){
			this.on('all', function(e, f){
				console.log('['.yellow, e, ':'.yellow, f, ']'.yellow);
				var name = _.compact((f.replace(themesFolder, '')).split('/')).shift();
				compiler(path.join(themesFolder, name));
			});
			if(!err)
				console.log(('[Themes ' + _.map(themeFolders, function(t){return t.name}) + ': .less files monitored]').yellow, '-', ('lessjs v' + less.version.join('.')).grey);					
		});		
	});
};