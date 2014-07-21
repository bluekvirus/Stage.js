/**
 * This tool utilizes the GraphicsMagick to resize given png/jpg/jpeg images to wanted sizes.
 * Note that the generated images will be grouped under each 'size folder' inside the src image (or your dist) folder.
 *
 * =====
 * Usage
 * =====
 * See node [filename] -h
 *
 * ==========
 * CSS Sprite
 * ==========
 * You can use csssprite.js or other tools to combine prepared icons into a big css sprite for faster brower UI exp.
 *
 *
 * [Todo:]
 * Need to include func like mobile-icon-resizer to resize for mobile devices according to a config file.
 * (see https://github.com/muzzley/mobile-icon-resizer)
 *
 * @author Tim.Liu
 * @created 2013.10.23
 * @updated 2014.06.26
 */

var program = require('commander'),
_ = require('underscore'),
fs = require('fs'),
mkdirp = require('mkdirp'),
path = require('path'),
colors = require('colors'),
gm = require('gm');
_.string = require('underscore.string');

program
	.version('0.1.1')
	.usage('[options] <icon folder>')
	.option('-S --sizes <16,32,64,.., array of sizes>', 'default to 16,32 (16x16 and 32x32)')
	.option('-K --keep', 'keep the original ones as unchanged copies [TBI]') //TBI
	.option('-D --dist <path>', 'default to be <icon folder>/resized/')
	.parse(process.argv);

//check icon folder
var iconFolder = program.args[0];
if(!iconFolder) {
	console.log('empty icon folder'.red);
	return;
}
console.log('src:', '[', path.resolve(iconFolder).yellow, ']');

//check on sizes
if(program.sizes) {
	program.sizes = program.sizes.split(',');
}else {
	program.sizes = [16, 32];
}
console.log('sizing:', program.sizes.join(',').yellow);

//start resizing
fs.readdir(iconFolder, function(err, files){
	if(err) throw err;

	//create the resized icon dist folder
	var distFolder = program.dist || path.join(iconFolder, 'resized');
	if(!fs.existsSync(distFolder)) mkdirp.sync(distFolder);
	console.log('dist:', '[', path.resolve(distFolder).yellow, ']');

	//scan and convert the files
	_.each(files, function(name){
		var ext = path.extname(name);
		if(!_.contains(['.png', '.jpg', '.jpeg'], ext)) return console.log(name, 'skipped...'.yellow);
		_.each(program.sizes, function(size){
			var rname = _.string.slugify(path.basename(name, ext)) + '-' + String(size) + ext;
			//resize only the width while maintaining aspect ratio
			gm(path.join(iconFolder, name))
				.resize(size)
				.write(path.join(distFolder, rname), function (err) {
					if(err) return console.log('ERROR'.red, err.message);
					console.log('converted'.green, name, '==>'.green, size, 'x', size, rname);
				});
			
		});
	});

});
