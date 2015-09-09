/**
 * Resize your icon/image files
 *
 * node resize.js <src folder> <dist folder> [--size 64] [--targets png,jpg,jpeg]
 *
 * @author Tim Lauv
 * @created 2015.09.04
 */

var fs = require('fs-extra'),
gm = require('gm'),
cli = require('commander');

cli.version('0.1.0')
	.usage('[options] <src folder> <dist folder>')
	.option('-S, --size <number>', 'size of image (widest)', function(v){
		return parseInt(v, 10);
	}, 64)
	.option('-T, --targets <png,jpg,...>', 'filename extensions', function(v){
		return v.split(',').map(function(suffix){
			return '.' + suffix;
		});
	}, ['.png','.jpg', '.jpeg'])
	.parse(process.argv);

var srcFolder = cli.args[0],
distFolder = cli.args[1];

//console.log(srcFolder, distFolder, cli.size, cli.targets);

//WIP (globule + gm)

