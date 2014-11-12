/**
 * Watching template (e.g static/template/***.html)
 *
 * @author Tim.Liu
 * @created 2014.07.26
 * @updated 2014.07.31 (Yan.Zhu + Windows support)
 */

var path = require('path'),
    os = require('os'),
    globwatcher = require("globwatcher").globwatcher,
    watch = require('watch'),
    fs = require('fs-extra'),
    _ = require('underscore');
_.str = require('underscore.string');

module.exports = function(server) {

    var profile = server.get('profile');
    if (!profile.tplwatch) return;

    var tplRoot = profile.resolve(_.isString(profile.tplwatch)?profile.tplwatch:path.join(profile.clients[profile.tplwatch.client], 'static', 'template'));

    function mergeIntoAllTplJson(e, f) {
        console.log('[Tpl file'.yellow, e, ':'.yellow, f, ']'.yellow);
        //currently we just clean the all.json file
        fs.outputJSONSync(path.join(tplRoot, 'all.json'), {});
        console.log('['.yellow, 'all.json templates cleared'.cyan, ']'.yellow);
    }

    if (os.type() === 'Windows_NT') {
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
    } else {
        var watcher = globwatcher(path.join(tplRoot, '**/*.html'));
        console.log('[watcher]', 'Templates'.yellow, tplRoot.grey);

        _.each(['added', 'changed', 'deleted'], function(e) {
            watcher.on(e, function(f) {
                mergeIntoAllTplJson(e, f);
            });
        });
    }
};
