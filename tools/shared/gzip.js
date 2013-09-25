/**
 * The gzip util using zlib in nodejs.
 *
 * @author Tim.Liu
 * @created 2013.09.25
 */

var fs = require('fs'), 
zlib = require('zlib'),
gzip = zlib.createGzip({
	level: zlib.Z_BEST_COMPRESSION
});

//dealing with different src and dist path 
var args = process.argv.slice(2);

if(fs.existsSync(args[0])){
	var inp = fs.createReadStream(args[0]);
	var out = fs.createWriteStream(args[1] || args[0] + '.gz');
	inp.pipe(gzip).pipe(out);
}else
	throw new Error('Can NOT find file:' + args[0]);