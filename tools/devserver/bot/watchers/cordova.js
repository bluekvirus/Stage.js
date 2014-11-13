/**
 * This will mirror the implementation folder change to a separate folder.
 * Usually this is for Cordova development for refreshing the www folder.
 *
 * Configure
 * ---------
 * {
 * 		client: '/dev'
 * 		index: mobile.html
 * 		files: [glob patterns] 
 * 	 	mirror: ../../www
 * }
 * 
 * Note
 * ----
 * 1. Use with Intel XDK and replace its www folder.
 * 2. bower_components folder in mirrored www will only change when index (mobile.html) changes.
 * 3. mirror folder will be init-ed using files and index settings if doesn't exist during server boot-up.
 * 
 * @author Tim Liu
 * @created 2014.11.12 (Unix-like only)
 */

var path = require('path'),
    os = require('os'),
    globule = require('globule'),
    globwatcher = require('globwatcher').globwatcher,
    watch = require('watch'),
    fs = require('fs-extra'),
    cheerio = require('cheerio'),
    _ = require('underscore');
_.str = require('underscore.string');

module.exports = function(server) {

    var profile = server.get('profile');
    if (!profile.cordovawatch || profile.cordovawatch.enabled === false) return;

    //1. figure out client src root and add index into watch list
   	var root = profile.clients[profile.cordovawatch.client];
   	var mirror = profile.resolve(profile.cordovawatch.mirror);
   	if(!_.isArray(profile.cordovawatch.files))
   		profile.cordovawatch.files = [profile.cordovawatch.files];

   	//2. ensure the mirror folder exists with ref-ed bower libs
   	console.log('[Cordova mirror init...]');
   	if(!fs.existsSync(mirror)) {
   		var files = globule.find(profile.cordovawatch.files, {
	   			filter: 'isFile',
	   			srcBase: root
	   	});
	   	_.each(files, function(f){
	   		fs.copySync(path.join(root, f), path.join(mirror, f));
	   	});
   		mirrorChange('init', path.join(root, profile.cordovawatch.index));
   	}

   	function copyBowerLibs(indexFile){
   		var $ = cheerio.load(fs.readFileSync(indexFile));
   		$('script[src^="bower_components/"]').each(function(){
   			var jsFile = $(this).attr('src');
   			fs.copySync(path.join(root, jsFile), path.join(mirror, jsFile));
   		});
   	}

   	function mirrorChange(e, f){
   		var src = f;
   		f = _.str.ltrim(f.replace(root, ''), path.sep);
   		console.log('[Cordova mirror file'.yellow, e, ':', f, ']'.yellow);

   		if(f === profile.cordovawatch.index){
   			//process the bower_components related libs
   			copyBowerLibs(src);
   			//rename it to index.html
   			f = 'index.html';
   		}
   		//mirror the file change by copy the original over to mirrored path.
   		var dest = path.join(mirror, f);
   		if(e !== 'deleted')
   			fs.copySync(src, dest);
   		else
   			fs.deleteSync(dest);
   		console.log('[', dest.grey, 'synced ]');
   	}

   	//3. Start watching and mirror changes
   	profile.cordovawatch.files.push(profile.cordovawatch.index);
    if (os.type() === 'Windows_NT') {
    	console.log('Cordova mirror not supported on Windows_NT'.grey);

    	//TBI use globule and watch to filter out files with glob pattern array in profile.cordovawatch.files
    	
    }else {
    	//Unix-like - we use globwatcher
    	var watcher = globwatcher(profile.cordovawatch.files, {
    		cwd: root
    	});

		_.each(['added', 'changed', 'deleted'], function(e) {
		    watcher.on(e, function(f) {
		        mirrorChange(e, f);
		    });
		});

    	watcher.ready.then(function(){
    		console.log('[watcher]', 'Cordova www mirror'.yellow, profile.cordovawatch.client.grey, '-->' , mirror.grey);
    	});
    	
    }

};