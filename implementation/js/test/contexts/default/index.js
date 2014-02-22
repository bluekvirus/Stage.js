;(function(){

	Application.create('Context', {
		//don't name so this is the default context.
		layout: [
			'<div region="abc"></div>',
			'<div region="efg"></div>'
		],

	});

	Application.create('Context', {
		name: 'Login',
		layout: [
			'<div region="2"></div>',
			'<div region="3"></div>'
		],

	});	

})();