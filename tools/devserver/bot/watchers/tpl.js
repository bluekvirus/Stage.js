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

    /**
     * Add watch to monitor file change for compiling the tempalte.
     *
     * !!Caveat: The recursicve:true option for 'fs.watch' is not supported in Linux environment. Therefore we recursively add watch on every folder ourself.
     */
    
    //object to store currently actived watchers
    var watchers = {};
    //function for adding watcher on a given folder
    function addWatch(folderPath/*absolute path*/){

        //read through the folder. if it contains subfolder, add watcher on those too
        _.each(fs.readdirSync(folderPath), function(filename, index){
            var abs = path.join(folderPath, filename);
            //check whether the file is a folder
            if(fs.lstatSync(abs).isDirectory()){
                addWatch(abs);
            }
                
        });

        var watcher = fs.watch(folderPath, _.debounce(function(event, filename){
            //absolute path for the file
            var abs = path.join(folderPath, filename);

            //return, if a file is not folder and not .html
            if(!watchers[abs] && !(fs.existsSync(abs) && fs.lstatSync(abs).isDirectory()) && path.extname(filename) !== '.html') return;

            //events
            if(fs.existsSync(abs)){//add or change

                //check whether the newly added file is a folder
                if(fs.lstatSync(abs).isDirectory() && !watchers[abs]){
                    addWatch(abs);
                }
                mergeIntoAllTplJson((event === "rename") ? 'added' : 'changed', abs);
            }else{//delete

                //check whether the file is previously in the watchers obj
                if(watchers[abs]){
                    watchers[abs].close();
                    delete watchers[abs];
                }

                mergeIntoAllTplJson('deleted', abs);
            }
        }, 200));

        watchers[folderPath] = watcher;
    }

    //start watcher
    addWatch(tplRoot);
    console.log('[watcher]', 'Templates'.yellow, tplRoot.grey);
};