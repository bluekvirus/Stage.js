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
fs = require('fs-extra'),
Mock = require('mockjs');

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
		var counter = 0,
			topics = _.isArray(req.query.topic) ? req.query.topic : [req.query.topic],
			flag = true;

		req.on('close', function(err){
			flag = false;
		});

		_.each(topics, function(topic){
			var setTimeout_1 = function(){
				setTimeout(function(){
					if(flag){
						server.topic(topic, '/sample/sse', {
							data: topic + "... This is the data send from SSE /sample/sse", 
							options: {
								//==== all optional parameters for SSE ====//
								//retry: 5000, //retry time out
								//event: 'some event name', //event name
								id: ++counter, //message id
							}
						});

						//maximum 10 times
						//if(counter <= 10)
						setTimeout_1();
					}

				}, 1500);
			};

			var setTimeout_2 = function(){
				setTimeout(function(){
					if(flag){
						server.topic(topic, '/sample/sse', {
							data: {msg: topic + "... This is the data send from SSE for customEvent /sample/sse"}, 
							options: {
								//==== all optional parameters for SSE ====//
								//retry: 5000, //retry time out
								event: 'customEvent', //event name
								id: ++counter, //message id
							}
						});

						//maximum 11 times, save the last one for custom event
						//if(counter <= 11)
						setTimeout_2();
					}

				}, 3000);
			};

			setTimeout_1();
			setTimeout_2();
		});	
	});

	//e. sample JSON Web Token login
	//user provide username and password, and server checks whether username and password is valid or not.
	//if yes, return token, encrypted by server.jwt. if not return 403.
	router.post('/jwt/login', function(req, res, next){
		
		//get authentication info from server configuration
		var users = server.locals.settings.profile.auth.users,
			validFlag = false;

		//fetch username and password in payload
		var username = req.body.username,
			password = req.body.password;		

		//check username and password match any of configured user
		if(users[username] && ( users[username].password === password )){
			validFlag = true;
		}

		//check what kind of information will be returned
		//valid
		if(validFlag){
			var token = server.jwt({
				iss: 'stage.js', //issuer
				iat: parseInt((new Date()).getTime() / 1000), //issue time in seconds, not ms
				jti: 'stage.js-jwt-' + (new Date()).getTime(), //json web token id
				user: username, //private claim, give username back to front end
				permissions: users[username].permissions || [], //private claim, embed permission in the token
			});
			return res.status(200).json({jwttoken: token});
		}
		//invalid, return 403.
		else{
			return res.status(403).json({msg: 'username or password is incorrect...'});
		}

	});

	//f. sample JSON Web Token touch
	//once user passed the jwt token check
	//echo back the payload to user as a confirmation
	router.get('/jwt/touch', router.permission('read') ,function(req, res, next){
		return res.status(200).json({msg: 'If you see this message you are an authenticated "reading privilege" user. '});
	});

	//g. sample infinite grid data
	//one must provide total count of data entries in order to use inifinite grid
	
	//global counter
	var infiniteCounter = 1;
	router.get('/infinite', function(req, res, next){
		//define fake total
		var fakeTotal = 1000;

		//get index and size
		var startIndex = req.query.start || 0,
			size = req.query.size || 100;

		infiniteCounter = startIndex;

		// if(!size || (startIndex !== 0 && !startIndex) || !startIndex){
		// 	return res.status(500).json({msg: 'You need to provide size and start index...'});
		// }

		//mock data template, mimics individual computer node on a large computer monitoring network
		var template = {
			'name': '@pick(["Private", "Captain", "General"])' + '-' + '@integer(1, 100)',
			'ip': '@ip()',
			'threads': '@integer(4, 32)',
			'memory': '@integer(8, 128)',
			'storage': '@integer(512, 8192)',
			'load': '@integer(0, 100)',
		};

		var temp  = {}, single;
		temp.payload = [];

		//generate mock data
		for(var i = 0; i < size; i++){
			single = Mock.mock(template);
			single.id = infiniteCounter++;
			temp.payload.push(single);
		}

		//give total
		temp.total = fakeTotal;

		return res.status(200).json(temp);
	});
};