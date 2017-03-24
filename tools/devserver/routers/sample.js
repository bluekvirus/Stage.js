/**
 * Sample express.router() code
 *
 * uri base: /sample
 *
 * @author Tim Lauv
 * @created 2014.04.18
 */
var _ = require('underscore'),
path = require('path'),
fs = require('fs-extra');

module.exports = function(server){

	var profile = server.get('profile');
	var router = server.mount(this);
	server.secure(router);

	//a. json api
	router.get('/', router.permission('read'), function(req, res, next){
		res.json({hello: true, content: 'world!'});
		//res.send()
		//res.sendFile()
		//res.download()
		//res.format({ 'application/json': fn(){res.send()}, 'text/html': fn(){res.send()}, ...})
	});

	//b. file upload
	//use truncate -s 100M dummy.pdf to test on linux
	router.post('/file', function(req, res, next){
		req.busboy.on('file', function(fieldname, file, fname, encoding, mimetype){
			var dist = path.join(server.resolve(path.join(profile.upload.path, fname)));
			fs.ensureFileSync(dist);
			file.pipe(fs.createWriteStream(dist));

			file.on('end', function(){
				res.json({msg: 'upload processed ' + (fs.statSync(dist).size/1024/1024).toFixed(3) + ' MB'});
				console.log('tmp file:', dist.grey, 'received'.yellow, 'under fieldname:', fieldname);
				_.delay(function(){
					fs.remove(dist);
					console.log('tmp file:', dist.grey, 'removed after 5 sec.'.yellow);
				}, 5 * 1000);
			});
		});
		req.busboy.on('field', function(fieldname, val, fieldnameTruncated, valTruncated) {
      		console.log('field [' + fieldname + ']: ' + val);
    	});
		//req.busboy.on('finish', function(){});
		req.pipe(req.busboy);
	});

	//c. throw error
	router.get('/error', function(req, res, next){
		next(new Error('error!'));
	});

};