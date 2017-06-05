/**
 * Resize your icon/image files for your theme to pick-up as css classes.
 *
 * node resize.js <src folder> <dist folder> [--size 64] [--targets png,jpg,jpeg]
 *
 * @author Tim Lauv
 * @created 2015.09.04
 */
require('colors');

var fs = require('fs-extra'),
path = require('path'),
globule = require('globule'),
gm = require('gm'),
cli = require('commander'),
_ = require('underscore');

//cli prep
cli.version('0.1.0')
	.usage('[options] <src folder> <dist folder>')
	.option('-S, --size [number]', 'size of new images (widest), default: 64', function(v){
		return parseInt(v, 10);
	}, 64)
	.option('-T, --targets [png,jpg,...]', 'filename extensions, default: png,jpg,jpeg', function(v){
		return v.split(',').map(function(suffix){
			return '.' + suffix;
		});
	}, ['.png','.jpg', '.jpeg'])
	.parse(process.argv);

var srcFolder = cli.args[0] || '.',
distFolder = cli.args[1] || './resized';

//console.log(srcFolder, distFolder, cli.size, cli.targets);

//1. find everything from srcFolder (globlue):
var images = globule.find(cli.targets.map(function(t){
	return '**/*' + t;
}), {
	srcBase: srcFolder
})

//2. resize (gm):
_.each(images, function(img){

	//insert size into img name
	var extension = path.extname(img);
	var resized = img.split('.');
	resized.pop();
	resized = resized.join('.') + '-' + cli.size + extension;

	//ensure directory
	var output = path.join(distFolder, resized);
	fs.ensureDirSync(path.dirname(output));

	//resize and output
	gm(path.join(srcFolder, img)).resize(cli.size).write(output, function(err){
		if(!err) console.log('[resized]'.green, img, '==>', resized);
		else console.log('[error]'.red, img, err);
	});

});
