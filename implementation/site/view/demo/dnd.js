;(function(app){

	app.view('Demo.DND', {

		template: [
			'<div class="row">',
				'<div class="col-md-6" view="DND.Draggables"></div>',
				'<div class="col-md-6" view="DND.Droppable"></div>',
			'</div>'
		],

	});

	app.view('DND.Draggables', {

		className: 'wrapper-full',
		template: [
			'<div class="box">',
				'<div class="heading">Select from these items</div>',
				'<div class="body">',
					'{{#each items}}',
						'<p class="border border-full wrapper-full ui-draggable-item ui-sortable-item text-center"><i class="fa fa-{{.}}"></i></p>',
					'{{/each}}',
				'</div>',
			'</div>'
		],
		data: ['beer', 'bed', 'bicycle', 'book', 'bug'],
		dnd: {
			drag: true,
			//sort: true,
		}

	});

	app.view('DND.Droppable', {

		className: 'wrapper-full',
		template: [
			'<div class="box">',
				'<div class="heading">Put them and re-order here</div>',
				'<div class="body">',
					'<p class="wrapper-full">Items:</p>',
				'</div>',
			'</div>'
		],
		dnd: {
			drop: {
				activeClass: 'border border-full',
				container: '.body'
			},
			sort: {
				container: '.body'
			},
		}

	})

})(Application);