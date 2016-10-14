(function(app){

	app.context('DocumentNext', {
		template: [
			'<div view="@/static/docs/philosophy.md"></div>',
			// '<div view="static/docs/intro.md"></div>',
			// '<div view="static/docs/basics.md"></div>',
			// '<div view="static/docs/workflow.md"></div>',
			// '<div view="static/docs/specifics.md"></div>',
			// '<div view="static/docs/api.md"></div>',
		],

		onReady: function(){
			console.log(':)');
		}
	});

})(Application);