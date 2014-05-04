;(function(app){

	app.area('Datatable', {
	    className: 'container',
	    template: [
	    	'<div region="header"></div>',
	    	'<div region="table"></div>',
	    	'<div region="footer"></div>'
	    ],

	    onShow: function(){
	    	this.table.trigger('region:load-view', 'Datagrid', {
	    		className: 'table table-hover',

	    		//data: Mock.mock(mockDataTpl).data,
	    		columns: [
	    			{
	    				name: '_id',
	    				label: '#',
	    				cell: 'seq'
	    			},
	    			{
	    				name: 'username',
	    				icon: 'fa fa-envelope'
	    			},
	    			{
	    				name: 'profile.name',
	    				label: 'Name'
	    			},
	    			{
	    				name: 'profile.age',
	    				label: 'Age'
	    			},
	    			{
	    				name: 'link'
	    			},
	    			{
	    				cell: 'action',
	    				//label: 'Ops',
	    				icon: 'fa fa-cog',
	    				actions: {
	    					edit: {
	    						fn: function(){
	    							//record, columns
	    							console.log(this.model, this.collection);
	    						}
	    					}
	    				}
	    			}
	    		]

	    	});

	    	//load data grid page from server
	    	var table = this.table.currentView;
	    	table.trigger('view:load-page', {
	    		url: '/sample1/user'
	    	});
	    }
	});	

})(Application);
