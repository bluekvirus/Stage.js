/**
 * Move built app to specified destination.
 *
 * @author Yan.Zhu
 * @created 2013.12.13
 */
var args = process.argv.slice(2);
if (args.length < 2) {
	return console.log('Usage: node move [app] [destination]');
}
var app = args[0],
	destination = args[1];

var config = require('./config/'+app);
if (!config) {
	return console.log('Can NOT find build config for', app);
}

var _ = require('underscore'),
path = require('path'),
rimraf = require('rimraf'), //rm -rf;
mkdirp = require('mkdirp'),
ncp = require('ncp').ncp,
colors = require('colors');

ncp.limit = 16; //ncp concurrency limit

rimraf(destination, function(error) {
	if (error) {
		return console.log('ERROR:'.red, error);
	}
	console.log('Destination Dir Cleared'.green, destination);
	mkdirp(destination, function(error) {
		if (error) {
			return console.log('ERROR:'.red, error);
		}
		_.each(config.structure, function(content, key) {
			var src = path.join(config.distFolder, 'app', key);
			var dst = path.join(destination, key);
			ncp(src, dst, function(error) {
				if (error) {
					console.log(src, '==>'.grey, dst, '[ERROR:'.red, error, ']'.red);
				} else {
					console.log(src, '==>'.grey, dst, '[OK]'.green);
				}
			});
		});
	});
});