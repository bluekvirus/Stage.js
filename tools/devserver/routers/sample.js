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
		var reply = 0;
		var callback = _.after(2, function(){
			res.json({msg: 'Upload processed...' + reply + ' MB'});
		});
		
		req.busboy.on('file', function(fieldname, file, fname, encoding, mimetype){
			var dist = path.join(server.resolve(path.join(profile.upload.path, fname)));
			fs.ensureFileSync(dist);
			file.pipe(fs.createWriteStream(dist));

			file.on('end', function(){
				reply += (fs.statSync(dist).size/1024/1024).toFixed(3);
				console.log('tmp file:', dist.grey, 'received'.yellow, 'under fieldname:', fieldname);
				callback();
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

	//d. sse
	router.get('/sse', function(req, res, next){
		var counter = 0;

		var setTimeout_1 = function(){
			setTimeout(function(){
				server.sse['/sample/sse'].broadcast("This is the data send from SSE /sample/sse", {
					//==== all optional parameters for SSE ====//
					//retry: 5000, //retry time out
					//event: 'some event name', //event name
					id: ++counter, //message id
				});

				//maximum 10 times
				if(counter <= 10)
					setTimeout_1();

			}, 1000);
		};

		var setTimeout_2 = function(){
			setTimeout(function(){
				server.sse['/sample/sse'].broadcast({msg: "This is the data send from SSE for customEvent /sample/sse"}, {
					//==== all optional parameters for SSE ====//
					//retry: 5000, //retry time out
					event: 'customEvent', //event name
					id: ++counter, //message id
				});

				//maximum 11 times, save the last one for custom event
				if(counter <= 11)
					setTimeout_2();

			}, 5000);
		};

		setTimeout_1();
		setTimeout_2();

	});

	//e. sample JSON Web Token login
	//user provide username and password, and server checks whether username and password is valid or not.
	//if yes, return token, encrypted by server.jwt. if not return 403.
	router.post('/jwt/login', function(req, res, next){

		//fetch username and password in payload
		var username = req.body.username,
			password = req.body.password;

		//check username and password
		//hard coded for demo purpose
		if(username === 'admin' && password === '123'){
			//valid
			var token = server.jwt({username: username, password: password});
			return res.status(200).json({jwttoken: token});

		}else{
			//invlaid, return 403
			return res.status(403).json({msg: 'username or password is incorrect...'});
		}
	});
};