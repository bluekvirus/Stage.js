/**
 * Watching template (e.g static/template/***.html)
 *
 * @author Tim.Liu
 * @created 2014.07.26
 */

var path = require('path'),
globwatcher = require("globwatcher").globwatcher,
fs = require('fs-extra'),
_ = require('underscore');
_.str = require('underscore.string');

module.exports = function(server){

	var profile = server.get('profile');
	if(!profile.tplwatch) return;

	var watcher = globwatcher(path.join(profile.tplwatch, '**/*.html'));
	console.log('[Templates monitored]'.yellow, profile.tplwatch);
	function mergeIntoAllTplJson(e, f){
		console.log('[Tpl file'.yellow, e, ':'.yellow, f, ']'.yellow);
		//currently we just clean the all.json file
		fs.outputJSONSync(path.join(profile.tplwatch, 'all.json'), {});
		console.log('['.yellow, 'all.json templates cleared'.cyan, ']'.yellow);
	}

	_.each(['added', 'changed', 'deleted'], function(e){
		watcher.on(e, function(f){
			mergeIntoAllTplJson(e, f);
		});
	});
};