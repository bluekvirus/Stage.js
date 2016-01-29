//mockjs template (https://github.com/nuysoft/Mock/wiki/Syntax-Specification)
module.exports = {
		'payload|15-15': [{
			'_id': '_@GUID',
			'title|1': ['Dr.', 'Mr.', 'Ms.', 'Mrs'],
			'username': '@EMAIL',
			'status|1': ['active', 'blocked', 'offline', 'guest'],
			profile: {
				'name': '@name',
				'age': '@INTEGER(20,90)',
				'dob': '@DATE',
				'major|1': ['CS', 'SE', 'Design', 'EE', 'Math'],
			},
			'link': '/profile/@_id'
		}],
		total: 150,
	};