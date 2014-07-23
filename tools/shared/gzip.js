/**
 * The gzip util using zlib in nodejs.
 *
 * @author Tim.Liu
 * @created 2013.09.25
 */

var fs = require('fs'),
path = require('path'), 
zlib = require('zlib'),
colors = require('colors');

/*--A way to check if this script is called directly in command-line or require() in another script--*/
function isCLI () {
	var script = path.extname(process.argv[1]) === '.js' ? process.argv[1] : (process.argv[1] + '.js'); 
	return script === __filename;
}

function doCompress (src, target) {
	if(fs.existsSync(src)){
		gzip = zlib.createGzip({
			level: zlib.Z_BEST_COMPRESSION
		});		
		var inp = fs.createReadStream(src);
		var out = fs.createWriteStream(target || src + '.gz');
		inp.pipe(gzip).pipe(out);
		gzip.on('end', function(){
			console.log(src, 'Gzipped.'.yellow);
		});
	}else
		throw new Error('Can NOT find file:' + src);
}

if(isCLI()){
	//dealing with different src and dist path 
	var args = process.argv.slice(2);
	doCompress(args[0], args[1]);
}
else {
	module.exports = {
		compress: doCompress
	};
}
