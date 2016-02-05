/**
 * Watching template (e.g static/template/***.html)
 *
 * @author Tim Lauv
 * @created 2014.07.26
 * @updated 2014.07.31 (Yan.Zhu + Windows support)
 * @updated 2015.12.31
 */

var path = require('path'),
    os = require('os'),
    watch = require('watch'),
    fs = require('fs-extra'),
    _ = require('underscore');
_.str = require('underscore.string');

module.exports = function(server) {

    var profile = server.get('profile');
    if (!profile.clients || !profile.tplwatch || profile.tplwatch.enabled === false || !profile.clients[profile.tplwatch.client]) return;

    var tplRoot = path.join(profile.clients[profile.tplwatch.client], 'static', 'template');

    //**Caveat: we just clear all.json upon template change, see real merge in build/run.js;
    function mergeIntoAllTplJson(e, f) {
        console.log('[Template file'.yellow, e, ':'.yellow, f, ']'.yellow);
        //currently we just clean the all.json file
        fs.outputJSONSync(path.join(tplRoot, 'all.json'), {});
        console.log('['.yellow, 'all.json templates cleared'.cyan, ']'.yellow);
    }

    watch.createMonitor(tplRoot, {
        //.html filters not working...
    }, function(monitor) {
        console.log('[watcher]', 'Templates'.yellow, tplRoot.grey);
        _.each(['created', 'changed', 'removed'], function(e) {
            monitor.on(e, function(f) {
                if (!_.str.endsWith(f, '.html')) return;
                mergeIntoAllTplJson(e, f);
            });
        });
    });

};
