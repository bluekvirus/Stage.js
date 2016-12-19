/**
 * Watching template (e.g static/template/***.html)
 *
 * @author Tim Lauv
 * @created 2014.07.26
 * @updated 2014.07.31 (Yan.Zhu + Windows support)
 * @updated 2015.12.31
 * @updated 2016.12.18 (Patrick.Zhu)
 */

var path = require('path'),
    os = require('os'),
    fs = require('fs-extra'),
    gaze = require('gaze'),
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

    var glob = path.join(tplRoot, '**', '*.html');
    //use gaze libaray to create watcher on *.html
    gaze(glob, function(err, watcher){

        //if error, log error message and return.
        if(err){
            console.log('gaze watcher error.\n', err);
        }

        //echo watcher 
        console.log('[watcher]', 'Templates'.yellow, tplRoot.grey);

        //register file events. use debounce to prevent double triggering event, a fs.watch() bug might happen on some versions of Node.js.
        this.on('all', _.debounce(function(e, f){
            mergeIntoAllTplJson(e, f);
        }, 200));
        
    });

};