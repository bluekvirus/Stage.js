/**
 * This is the css-sprite building tool that takes in an icons folder
 * and output into dist folder the following:
 * 	1. css/iconsprite.css
 * 	2. img/iconsprite.png
 * 	3. iconsprite.html (demo page of all icons)
 *
 * Usage
 * -----
 * see node cssprite -h
 *
 * @author Tim.Liu
 * @created 2014.06.13
 */

var program = require('commander'),
_ = require('underscore'),
fs = require('fs'),
filed = require('filed'),
mkdirp = require('mkdirp'),
path = require('path'),
colors = require('colors'),
nsg = require('node-sprite-generator');
_.string = require('underscore.string');

program
	.version('0.1.0')
	.usage('[options] <icon folder>')
	.option('-N --name <string>', 'default to iconsprite, in case you want to name the produced .css under a different name')	
	.option('-D --dist <path>', 'default to <icon folder>/../cssprite')
	.option('-S --sprite-path <path>', 'default to ../img/<name>.png, always relative to <dist>/css/ folder')
	.option('-r --retina', 'add support for retina display, pixel ratio x2')
	.parse(process.argv);

//check icon folder
var iconFolder = program.args[0]
if(!iconFolder) {
	console.log('empty icon folder'.red);
	return;
}

//check retina switch
if(program.retina){
	var pixelRatio = 2;
	program.retina = '-x' + pixelRatio;
}else {
	var pixelRatio = 1;
	program.retina = '';
}
//check dist folder
program.dist = program.dist || path.join(iconFolder, '../cssprite');
//check name (in case user produce both normal and retina version of css sprite on the same group of icons)
program.name = (program.name || 'iconsprite') + program.retina;
//check sprite path
program.spritePath = program.spritePath || '../img/' + program.name + '.png';


//normal css sprite
csspath = path.join(program.dist, 'css', program.name + '.css');
spritepath = path.join(path.dirname(csspath), program.spritePath);

//make sure the output dirs exist
mkdirp.sync(path.dirname(spritepath));
mkdirp.sync(path.dirname(csspath));

console.log('src:', '[', path.join(iconFolder, '*.png').yellow, ']');
console.log('css:', '[', csspath.yellow, ']');
console.log('sprite:', '[', spritepath.yellow, ']');

var iconClassPrefix = 'custom-icon-',
iconClassPostfix = program.retina,
registry = []; //remember the icons and 

nsg({
    src: [
        path.join(iconFolder, '*.png')
    ],
    spritePath: spritepath,
    stylesheetPath: csspath,
    layout: 'diagonal',
    layoutOptions: {
        padding: 30
    },
    compositor: 'gm', //we use GraphicsMagick
    stylesheet: 'css',
    stylesheetOptions: {
        prefix: iconClassPrefix,
        spritePath: program.spritePath,
        nameMapping: function(fpath){
        	name = path.basename(fpath, path.extname(fpath)) + iconClassPostfix;
        	registry.push(iconClassPrefix + name);
        	console.log('found:', '[', name.grey, ']');
        	return name;
        },
        pixelRatio: pixelRatio
    }
}, function(err){
	if (err) throw err;

	console.log('done!'.green, 'working on demo page...');
	//build a demo page with icon names sorted in ascending order.
	registry = _.sortBy(registry, function(name){ return name; });
	var demo = filed(path.join(program.dist, program.name + '.html'));
	var page = [
		'<!doctype html>',
		'<head>',
			'<link rel="stylesheet" href="'+ _.string.ltrim(csspath.replace(program.dist, ''), path.sep) +'">',
			'<style>',
				'i { display: block; }',
				'table { width: 100%; }',
				'th { text-align: left; }',
				'td, th { padding: 8px; }',
			'</style>',
		'</head>',
		'<body>',
			'<table>',
				'<thead><tr><th>icon</th><th>name</th></tr></thead>',
				'<tbody>',
					_.map(registry, function(iconClass){
						var entry = [
							'<tr>',
								'<td><i class="' + iconClass + '"></i></td>',
								'<td><span>' + iconClass + '</span></td>',
							'</tr>'
						].join('');
						return entry;

					}).join(''),
				'</tbody>',
			'</table>',
		'</body>'
	]
	demo.write(page.join(''));
	demo.end();
	console.log('done!'.green, '[', demo.path.yellow, ']');
});