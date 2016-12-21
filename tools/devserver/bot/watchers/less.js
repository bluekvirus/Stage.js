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
 * @updated 2016.12.18 (Patrick.Zhu)
 */

var _ = require('underscore'),
    path = require('path'),
    os = require('os'),
    fs = require('fs-extra'),
    less = require('less'),
    colors = require('colors'),
    globule = require('globule'),
    compiler = require('../../../shared/less-css.js');

_.str = require('underscore.string');

module.exports = function(server) {

    var profile = server.get('profile');
    if (!profile.clients || !profile.lesswatch || profile.lesswatch.enabled === false || !profile.clients[profile.lesswatch.client]) return;

    var themesFolder = path.join(profile.clients[profile.lesswatch.client], 'themes');

    function doCompile(e, f) {
        console.log('[Theme file'.yellow, e, ':'.yellow, f, ']'.yellow);
        var name = _.compact((f.replace(themesFolder, '')).split(path.sep)).shift();
        compiler(path.join(themesFolder, name), profile.lesswatch.main, profile.lesswatch.collaborate);
    }

    var validThemes = [];
    _.each(profile.lesswatch.themes, function(tname){
        if(fs.existsSync(path.join(themesFolder, tname))){
            validThemes.push(tname);
            //return path.join(themesFolder, tname, '**', '*.less');
        }
        return;
    });

   /**
     * Add watch to monitor file change for compiling the tempalte.
     *
     * !!Caveat: The recursicve:ture option for 'fs.watch' is not supported in Linux environment. Therefore we recursively add watch on every folder ourself.
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
            if(!watchers[abs] && !(fs.existsSync(abs) && fs.lstatSync(abs).isDirectory()) && path.extname(filename) !== '.less') return;

            //events
            if(fs.existsSync(abs)){//add or change

                //check whether the newly added file is a folder
                if(fs.lstatSync(abs).isDirectory() && !watchers[abs]){
                    addWatch(abs);
                }
                doCompile((event === "rename") ? 'added' : 'changed', abs);
            }else{//delete

                //check whether the file is previously in the watchers obj
                if(watchers[abs]){
                    watchers[abs].close();
                    delete watchers[abs];
                }

                doCompile('deleted', abs);
            }
        }, 200));

        watchers[folderPath] = watcher;
    }

    //start watcher
    _.each(validThemes, function(t){
        addWatch(path.join(themesFolder, t, 'less')); // <theme>/less/ folder only
    });
    console.log('[watcher]', ('Themes ' + validThemes).yellow, '-', ('lessjs v' + less.version.join('.')).grey);

};