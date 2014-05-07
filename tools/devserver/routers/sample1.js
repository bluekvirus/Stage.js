/**
 * Sample express.router() code
 *
 * uri base: /sample1
 *
 * @author Tim.Liu
 * @created 2014.04.18
 */
var Mock = require('mockjs'),
_ = require('underscore'),
Random = Mock.Random;

module.exports = function(server){

	var router = server.mount(this);

	router.get('/', function(req, res, next){
		res.json({hello: true});
	});

	var mockDataTpl = {
		'payload|15-15': [{
			'_id': '_@GUID',
			'title|1': ['Dr.', 'Mr.', 'Ms.', 'Mrs'],
			'username': '@EMAIL',
			'status|1': ['active', 'blocked', 'offline', 'guest'],
			profile: {
				'name|1': _.times(250, function(){return Random.name()}),
				'age': '@INTEGER(20,90)',
				'dob': '@DATE',
				'major|1': ['CS', 'SE', 'Design', 'EE', 'Math'],
			},
			'link': '/profile/@_id'
		}],
		total: 150,
	};
	router.get('/user', function(req, res, next){
		res.json(Mock.mock(mockDataTpl));
	});

}