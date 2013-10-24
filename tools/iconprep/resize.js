/**
 * This tool resizes given png/jpg/jpeg images to wanted sizes.
 * Note that the generated images will be grouped under each 'size folder' inside the src image folder.
 *
 * =====
 * Usage
 * =====
 * See node [filename] -h
 *
 * ====
 * GLUE
 * ====
 * You can use glue to produce css sprites from generated image files later:
 * e.g. glue icons/ iconsprites -r --html (--less)
 *
 * @author Tim.Liu
 * @created 2013.10.23
 */

var program = require('commander'),
_ = require('underscore'),
fs = require('fs'),
path = require('path'),
colors = require('colors'),
im = require('imagemagick');

program.version('0.1.0')
		.usage('[options] <icon folder>')
		.option('-S --sizes <16,32,64,.., array of sizes>', 'set the array of sizes other than defaults (16x16 and 32x32)');

program.command('*').description('resizing the given png/jpg/jpeg icons to given sizes').action(function(iconFolder){
	if(!iconFolder)
		throw new Error('Invalid icon folder...');

	if(program.sizes) {
		program.sizes = program.sizes.split(',');
	}else {
		program.sizes = [16, 32];
	}

	fs.readdir(iconFolder, function(err, files){
		if(err) throw err;
		//create the size specific folders
		_.each(program.sizes, function(size){
			var sizeSpecFolder = path.join(iconFolder, String(size));
			if(!fs.existsSync(sizeSpecFolder)) fs.mkdirSync(sizeSpecFolder);
		});
		//scan and convert the files
		_.each(files, function(name){
			var ext = path.extname(name);
			if(!_.contains(['.png', '.jpg', '.jpeg'], ext)) return console.log(name, 'skipped...'.yellow);
			_.each(program.sizes, function(size){
				im.resize({
					srcPath: path.join(iconFolder, name),
					dstPath: path.join(iconFolder, String(size), path.basename(name, ext) + '-' + String(size) + ext),
					width: size,
				}, function(err){
					if(err) return console.log('ERROR'.red, err.message);
					console.log('converted'.green, name, '==>'.green, size, 'x', size);
				});
				
			})
		});
	});
});

program.parse(process.argv);