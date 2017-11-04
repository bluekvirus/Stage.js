;(function(app){

	

	app.view('Demo.InfiniteGrid', {
		
		template: [
			'<div region="test" style="height: 500px;"></div>', //need to give a height for the container
		],

		onReady: function(){

			//create grid definition
			var InfiGrid = app.widget('InfiniteGrid')
								.create({
 									columns: [
 										'id',
 										'name', 
 										{key: 'ip'}, 
 										'threads', 
 										{key: 'memory'}, 
 										{key: 'storage'}, 
 										{key: 'load', cell: 'string'}, 
 										{cell: 'action', icon: 'fa fa-cog', actions: { edit: { fn: function(){ app.debug(this.model, this.collection, this.grid); } }, delete: {}}
	    							}],
								});

			this.show('test', InfiGrid);
		},
	});

})(Application);