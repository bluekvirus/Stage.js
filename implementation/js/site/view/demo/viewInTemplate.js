;(function(app){

	app.view('Demo.ViewInTemplate', {
		className: 'view1-holder',
		template: [
			'<div style="text-align:center;position:relative;top:50%;transform:translateY(-50%);">',
				'<div class="text-primary">',
					'<div>&lt;div region="..." view="..." &gt;</div>',
				'</div>',
			'</div>',
		],
		onReady: function(){
			$('.view1-holder').css({height: '100%', width: '100%'});
		}
	});

})(Application);