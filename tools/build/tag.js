/**
 * Use this script to prepare the version + build number of the framework before each build.
 *
 * (Warning: this script is not compatible with folder path changes on `implementation` and `libprep`)
 * 
 * @author Tim Liu
 * @created 2014.11.11
 */

var shell = require('shelljs'),
cheerio = require('cheerio'),
fs = require('fs-extra'),
path = require('path'),
colors = require('colors'),
meta = require('../libprep/bower.json'); //bower.json version 
edge = shell.exec('git rev-list HEAD --count', {silent: true}); //total commit count

var tag = meta.version + '-' + edge.output.replace(/\n*$/, '') + ' build ' + new Date().valueOf();
fs.outputFileSync(path.join(__dirname, '..', '..', 'implementation', 'js', 'tag.js'), ';app.stagejs = "'+tag+'";');

console.log('build tag', tag.green);