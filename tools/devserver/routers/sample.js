/**
 * Sample express.router() code
 *
 * uri base: /sample
 *
 * @author Tim.Liu
 * @created 2014.04.18
 */
var Mock = require('mockjs'),
_ = require('underscore'),
path = require('path'),
fs = require('fs-extra'),
Random = Mock.Random;

module.exports = function(server){

	var profile = server.get('profile');
	var router = server.mount(this);
	server.secure(router);

	/////////////fake data tpl///////////////

	var mockTpl = {
		users: {
			'payload|15-15': [{
				'_id': '_@GUID',
				'title|1': ['Dr.', 'Mr.', 'Ms.', 'Mrs'],
				'username': '@EMAIL',
				'status|1': ['active', 'blocked', 'offline', 'guest'],
				profile: {
					'name|1': _.times(250, function(){return Random.name();}),
					'age': '@INTEGER(20,90)',
					'dob': '@DATE',
					'major|1': ['CS', 'SE', 'Design', 'EE', 'Math'],
				},
				'link': '/profile/@_id'
			}],
			total: 150,
		},

		choices: {
			'payload|10-10': [{
				label: '@EMAIL',
				value: '@label'
			}]
		}

	};

	////////////////services/////////////////

	router.get('/', router.permission('read'), function(req, res, next){
		res.json({hello: true, content: 'world!'});
	});

	router.get('/user', router.permission('read:users'), function(req, res, next){
		res.json(Mock.mock(mockTpl.users));
	});

	router.get('/choices', function(req, res, next){
		res.json(Mock.mock(mockTpl.choices).payload);
	});

	//file upload example
	//use truncate -s 100M dummy.pdf to test on linux
	router.post('/file', function(req, res, next){
		req.busboy.on('file', function(fieldname, file, fname, encoding, mimetype){

			var dist = path.join(profile.resolve(path.join(profile.upload.path, fname)));
			fs.ensureFileSync(dist);
			file.pipe(fs.createWriteStream(dist));

			file.on('end', function(){
				res.json({msg: 'upload processed ' + (fs.statSync(dist).size/1024/1024).toFixed(2) + ' MB'});
				console.log('tmp file:', dist.grey, 'received'.yellow);
				_.delay(function(){
					fs.delete(dist);
					console.log('tmp file:', dist.grey, 'removed'.yellow);
				}, 25 * 1000);
			});
		});
		//req.busboy.on('finish', function(){});
		req.pipe(req.busboy);
	});

	router.get('/error', function(req, res, next){
		next(new Error('error!'));
	});

};