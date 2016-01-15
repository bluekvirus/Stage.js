/**
 * Use this script to prepare the version + build number of the framework before each build.
 *
 * (Warning: this script is not compatible with folder path changes on `implementation` and `libprep`)
 * 
 * @author Tim Lauv
 * @created 2014.11.11
 */

var shell = require('shelljs'),
cheerio = require('cheerio'),
fs = require('fs-extra'),
path = require('path'),
colors = require('colors'),
cli = require('commander'),
meta = require('../libprep/bower.json'); //bower.json version 
edge = shell.exec('git rev-list HEAD --count', {silent: true}); //total commit count

//provide both generate (default) and echo-only mode
cli.version('0.2.0').option('-E, --echo').parse(process.argv);
var tagJSFile = path.join(__dirname, '..', '..', 'implementation', 'js', 'tag.js');

if(cli.echo){
	//echo-only
	console.log('confirm tag' + (shell.cat(tagJSFile).split('=')[1] || '').green);
}
else {
	//generate
	var tag = meta.version + '-' + (Number(edge.output.replace(/\n*$/, '')) + 1) + ' build ' + new Date().valueOf();
	fs.outputFileSync(tagJSFile, ';app.stagejs = "'+ tag +'";');
	console.log('build tag', tag.green);
}