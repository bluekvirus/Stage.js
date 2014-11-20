/**
 * This is the LESS themes watch-n-recompile bot
 *
 * Only the main.less @ themes/[theme-name]/less/main.less will be recompiled.
 * Any file change under themes/[theme-name]/ will trigger the recompile.
 * Produced main.css will always be @ themes/[theme-name]/css/main.css
 *
 * Only themes specified in the lesswatch list will be monitored
 * server.get('profile').lesswatch
 *
 * @author Tim Liu
 * @created 2013.10.27
 * @updated 2014.04.18
 * @updated 2014.07.31 (Yan.Zhu + Windows support)
 */

var _ = require('underscore'),
    path = require('path'),
    os = require('os'),
    fs = require('fs-extra'),
    less = require('less'),
    colors = require('colors'),
    watch = require('watch'),
    globule = require('globule'),
    compiler = require('../../../shared/less-css.js');

_.str = require('underscore.string');

module.exports = function(server) {

    var profile = server.get('profile');
    if (!profile.lesswatch || profile.lesswatch.enabled === false) return;

    var selectedClient = "/";
    if (!_.isArray(profile.lesswatch)) {
        if (!_.isString(profile.lesswatch)) {
            //config object
            selectedClient = profile.lesswatch.client;
            profile.lesswatch = profile.lesswatch.themes;
        }
        //single theme name string
        if (_.isString(profile.lesswatch))
            profile.lesswatch = [profile.lesswatch];
    }

    var themesFolder = path.join(profile.clients[selectedClient], 'themes');

    function doCompile(e, f) {
        console.log('[Theme file'.yellow, e, ':'.yellow, f, ']'.yellow);
        var name = _.compact((f.replace(themesFolder, '')).split(path.sep)).shift();
        compiler(path.join(themesFolder, name));
    }

    // watch the selected client themes folders that exist.
    var validThemes = []
    var globs = _.map(profile.lesswatch, function(tname){
        if(fs.existsSync(path.join(themesFolder, tname))){
            validThemes.push(tname);
            return path.join(themesFolder, tname, '**', '*.less');
        }
        return;
    });
    globs = _.compact(globs);

    watch.createMonitor(themesFolder, {
        //filter isn't working...
    }, function(monitor) {
        console.log('[watcher]', ('Themes ' + validThemes).yellow, '-', ('lessjs v' + less.version.join('.')).grey);
        _.each(['created', 'changed', 'removed'], function(e) {
            monitor.on(e, function(f) {
                if(globule.isMatch(globs, f))
                    doCompile(e, f);
            });
        });
    });    
};
