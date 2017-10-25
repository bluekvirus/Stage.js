//infinite grid header
//... comment TBI


(function(app){

	app.widget('InfiniteGridHeaders', function(){

		var UI = app.view({

			//tr, thead is the container in infinite grid that contains this widget
			tagName: 'tr',

			//temporary
			//template, TBI: different type should have different template
			template: [
				'{{#items}}',
					'<th><i class="{{icon}}"></i> {{{i18n label}}}</th>',
				'{{/items}}',
			],

		});

		return UI;

	});

})(Application);