/**
 * This tool reads in .svg path xml files exported from Adobe Illustrator and store them in svglib.json file.
 * The tool can optionally take in a -G (--group) option to store the path under certain group block.
 *
 * =====
 * Usage
 * =====
 * See node [filename] -h
 *
 * @author Tim.Liu
 * @created 2013.10.24
 */

var program = require('commander'),
_ = require('underscore'),
fs = require('fs'),
path = require('path'),
colors = require('colors'),
buildify = require('buildify'),
cheerio = require('cheerio'),
json = require('json3');
_.str = require('underscore.string');

program.version('0.1.0')
		.usage('[options] <svg folder/file>')
		.option('-G --group <group name>', 'set the group under which these svg paths are going to be stored');

program.command('*').description('load and store svg paths from given folder/file').action(function(svgTarget){
	if(!svgTarget) throw new Error('Invalid SVG File/Folder...');

	var info = fs.statSync(svgTarget),
	svglib = require('./svglib.json');
	if(info.isFile()){
		processSVGXML(path.dirname(svgTarget), path.basename(svgTarget), svglib, program.group);
		dumpSVGLib(svglib);
	}else{
		//readdirSync never works here...weird...:() 
		fs.readdir(svgTarget, function(err, svgs){
			if(err) throw err;
			_.each(svgs, function(name){
				processSVGXML(path.resolve(svgTarget), name, svglib, program.group);
			});
			dumpSVGLib(svglib);
		});
	}
});

program.parse(process.argv);

//util function for processing single svg xml file.
function processSVGXML(dir, svgxml, svglib, groupName){
	groupName = groupName || '_default';
	if(path.extname(svgxml) !== '.svg') return;

	console.log('processing'.yellow, svgxml);
	var name = _.str.dasherize('svg-' + path.basename(svgxml, '.svg'));
	var svgxml = buildify(dir).load(svgxml).getContent();
	//use cheerio to pick up and concat the d= attributes of <path> tags.
	var $ = cheerio.load(svgxml);
	var svgPath = '';
	$('svg').first().find('path').each(function(){
		var pStr = $(this).attr('d');
		svgPath += pStr;
	});
	svgPath = svgPath.replace(/\s/ig, '');
	console.log(name.green, '=>'.yellow , svgPath);

	var group = svglib[groupName] || {};
	group[name] = svgPath;
	svglib[groupName] = group;

	return svglib;
}

function dumpSVGLib(svglib) {
	svglib = json.stringify(svglib);
	buildify().setContent(svglib).save('./svglib.json');
}