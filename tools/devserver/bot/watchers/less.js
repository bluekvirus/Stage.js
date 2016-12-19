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
 * @author Tim Lauv
 * @created 2013.10.27
 * @updated 2014.04.18
 * @updated 2014.07.31 (Yan.Zhu + Windows support)
 * @updated 2015.12.31
 */

var _ = require('underscore'),
    path = require('path'),
    os = require('os'),
    fs = require('fs-extra'),
    less = require('less'),
    colors = require('colors'),
    watch = require('watch'),
    globule = require('globule'),
    compiler = require('../../../shared/less-css.js'),
    gaze = require('gaze');

_.str = require('underscore.string');

module.exports = function(server) {

    var profile = server.get('profile');
    if (!profile.clients || !profile.lesswatch || profile.lesswatch.enabled === false || !profile.clients[profile.lesswatch.client]) return;

    var themesFolder = path.join(profile.clients[profile.lesswatch.client], 'themes'),
        collaborateFoler = path.join(themesFolder, profile.lesswatch.collaborate);

    function doCompile(e, f) {
        console.log('[Theme file'.yellow, e, ':'.yellow, f, ']'.yellow);
        var name = _.compact((f.replace(themesFolder, '')).split(path.sep)).shift();
        compiler(path.join(themesFolder, name), profile.lesswatch.main, collaborateFoler);
    }

    // watch the selected client themes folders that exist.
    var validThemes = [];
    var globs = _.map(profile.lesswatch.themes, function(tname){
        if(fs.existsSync(path.join(themesFolder, tname))){
            validThemes.push(tname);
            return path.join(themesFolder, tname, '**', '*.less');
        }
        return;
    });
    globs = _.compact(globs);

    //use gaze libaray to create watcher on *.less
    gaze(globs, function(err, watcher){

        //if error, return
        if(err){
            console.log('gaze watcher error.\n', err);
        }

        //echo watcher 
        console.log('[watcher]', ('Themes ' + validThemes).yellow, '-', ('lessjs v' + less.version.join('.')).grey);

        //register file events. use throttle to prevent double triggering event, a fs.watch() bug might happen on some versions of Node.js.
        this.on('all', _.throttle(function(e, f){
            doCompile(e, f);
        }, 200));
    });

};