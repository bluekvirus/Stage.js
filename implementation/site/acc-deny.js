(function(app){

	app.context('AccessDenied', {
		guard: function(){
			return {
				msg: 'You are not allowed to see this context',
				target: this
			};
		}
	});

})(Application);