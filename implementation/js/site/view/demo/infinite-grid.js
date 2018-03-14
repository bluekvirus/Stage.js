;(function(app){

	app.view('Demo.InfiniteGrid', {
		
		template: [
			'<div region="grid" style="height: 500px;"></div>', //need to give a height for the container
		],

		onReady: function(){

			//create grid definition
			var InfiGrid = app.widget('InfiniteGrid').create({
				//data attribute for a view
				dataUrl: '/sample/infinite',
				/*Customized options, if necessary.*/
				// rowHeight: 25, //fixed row height in px
				// rowView: app.view({template: '<span>ID: {{id}}</span> <span>IP: {{id}}.{{id}}.{{id}}.{{id}}</span>', attributes: {style: 'height: 25px;width:100%;'}}), //view name or definition
				// totalKey: 'total',
				// dataKey: 'payload',
				// initialIndex: 0,
				// indexKey: 'start',
				// sizeKey: 'size',
			});

			this.show('grid', InfiGrid);
		},
	});

})(Application);