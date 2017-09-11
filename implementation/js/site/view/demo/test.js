;(function(app){

	app.view('Demo.Test', {
		template: [
			'<div class="">This is the test view...</div>',
		],
		initialize: function(){
			//kick start mocha
			mocha.run();
		},
		//flag: false,//for demo purpose
		actions: {
			
		},
		onReady: function(){
			//mocha.setup('bdd');
			
		},
	});

})(Application);