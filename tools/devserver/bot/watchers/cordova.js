/**
 * This will mirror the implementation folder change to a separate folder.
 * Usually this is for Cordova development for refreshing the www folder.
 *
 * Configure
 * ---------
 * {
 * 		client: '/dev'
 * 		index: mobile.html
 * 		folders: [glob]
 * 	 	mirror: ../../www
 * }
 * 
 * Note
 * ----
 * 1. Use with Intel XDK and replace its www folder.
 * 2. bower_components folder in mirrored www will only change when index (mobile.html) changes.
 * 
 * @author Tim Liu
 * @created 2014.11.12
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
    if (!profile.cordovawatch) return;

    
};