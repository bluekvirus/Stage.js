;(function(app){

	app.view('Demo.Selectable', {
		template: [
			'<div class="row">',
				'<div class="col-md-6" view="Selectable.List"></div>',
				'<div class="col-md-6" view="Selectable.Result"></div>',
			'</div>'
		],
	});

	app.view('Selectable.List', {
		className: 'wrapper-full',
		template: [
			'<div class="box border border-full">',
				'<div class="heading">Select from these items</div>',
				'<div class="body">',
					'{{#each items}}',
						'<p class="border border-full wrapper-full text-center ui-selectable-item"><i class="fa fa-{{.}}"> #{{@index}}</i></p>',
					'{{/each}}',
				'</div>',
			'</div>'
		],
		data: ['beer', 'bed', 'bicycle', 'book', 'bug'],
		selectable: true,
		onSelectionDone: function($items){
			app.coop('display-selection-result', $items.map(function(){return $(this).html();}).get());
		},
		onItemSelected: function($item){
			$item.toggleClass('bg-warning', true);
		},
		onItemUnselected: function($item){
			$item.toggleClass('bg-warning', false);
		},
		onItemSelecting: function($item){
			$item.toggleClass('bg-info', true);
		},
		onItemUnselecting: function($item){
			$item.toggleClass('bg-info', false);
		}
	});

	app.view('Selectable.Result', {
		className: 'wrapper-full',
		template: [
			'<div class="box">',
				'<div class="heading">You selections are:</div>',
				'<div class="body" ui="result">',
				'</div>',
			'</div>'
		],
		coop: ['display-selection-result'],
		onDisplaySelectionResult: function(items){
			this.ui.result.html(items.join(', '));
		}
	});

})(Application);