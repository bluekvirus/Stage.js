/**
 * This tool utilizes the GraphicsMagick to resize given png/jpg/jpeg images to wanted sizes.
 * Note that the generated images will be grouped under each 'size folder' inside the src image (or your dist) folder.
 *
 * =====
 * Usage
 * =====
 * See node [filename] -h
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
fs = require('fs-extra'),
path = require('path'),
colors = require('colors'),
glob = require('glob'),
gm = require('gm');
_.string = require('underscore.string');

program
	.version('0.1.1')
	.usage('[options] <image folder (icon, pic, logo...)>')
	.option('-B --base <path>', 'themes base folder, default to ../../../implementation/themes/', '../../../implementation/themes/')
	.option('-T --theme <name>', 'default on theme default', 'default')
	.option('-S --sizes <16,32,64,.., array of sizes>', 'default to 16,32 (16x16 and 32x32)')
	.option('-D --dist <path>', 'default to be <image folder>/resized/')	
	.parse(process.argv);

//check image folder
var imageFolder = program.args[0];
if(!imageFolder) {
	imageFolder = 'icons';
}
var themeFolder = path.join(__dirname, program.base, program.theme);
imageFolder = path.join(themeFolder, imageFolder);
console.log('src:', '[', path.resolve(imageFolder).yellow, ']');


//check on sizes
if(program.sizes) {
	program.sizes = program.sizes.split(',');
}else {
	program.sizes = [16, 32];
}
console.log('sizing:', program.sizes.join(',').yellow);

//start resizing
fs.readdir(imageFolder, function(err, files){
	if(err) throw err;

	//create dist folder for the resized images
	var distFolder = program.dist || imageFolder;
	if(!fs.existsSync(distFolder)) fs.ensureDirSync(distFolder);
	console.log('dist:', '[', path.resolve(distFolder).yellow, ']');

	//scan and convert the files
	_.each(files, function(name){
		var ext = path.extname(name);
		if(!_.contains(['.png', '.jpg', '.jpeg'], ext)) return console.log(name, 'skipped...'.yellow);
		_.each(program.sizes, function(size){
			var rname = _.string.slugify(path.basename(name, ext)) + '-' + String(size) + ext;
			//resize only the width while maintaining aspect ratio
			gm(path.join(imageFolder, name))
				.resize(size)
				.write(path.join(distFolder, rname), function (err) {
					if(err) return console.log('ERROR'.red, err.message);
					console.log('converted'.green, name, '==>'.green, size, 'x', size, rname);
				});
			
		});
	});

});
