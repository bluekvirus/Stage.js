;(function(app){

	//mock template for a cluster of computers
	var _dataTemplate = {
		'payload|50': [{
			'name': '@pick(["Private", "Sergeant", "Chief", "Lieutenant", "Captain", "Major", "General"])' + '-' + '@integer(1, 100)',
			'ip': '@ip()',
			'threads': '@integer(4, 32)',
			'memory': '@integer(8, 128)',
			'storage': '@integer(512, 8192)',
			'load': '@integer(0, 100)',
		}],
		total: 5000,
	};

	app.view('Demo.InfiniteGrid', {
		
		template: [
			'infinite grid',
		],

		onReady: function(){
			console.log(Mock.mock(_dataTemplate));
		},
	});

})(Application);