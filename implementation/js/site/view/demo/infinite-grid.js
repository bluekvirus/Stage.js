;(function(app){

	

	app.view('Demo.InfiniteGrid', {
		
		template: [
			'<div region="test" style="height: 500px;"></div>', //need to give a height for the container
		],

		onReady: function(){

			//create grid definition
			var InfiGrid = app.widget('InfiniteGrid')
								.create({
									data: '/sample/infinite',
 									columns: [
 										'name', 
 										{name: 'ip', label: 'IP'}, 
 										'threads', 
 										{name: 'memory', label: 'Memory(GB)'}, 
 										{name: 'storage', label: 'Storage(GB)'}, 
 										{name: 'load', label: 'Load(%)'}, 
 										{
						    				cell: 'action',
						    				//label: 'Ops',
						    				icon: 'fa fa-cog',
						    				actions: {
						    					edit: {
						    						fn: function(){
						    							//record, columns since action listeners are bound to the current row view
						    							app.debug(this.model, this.collection, this.grid);
						    						}
						    					}, 
						    					delete: {}
						    				}
	    								}],
								});

			this.show('test', InfiGrid);
		},
	});

})(Application);