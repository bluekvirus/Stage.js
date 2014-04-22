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
	    		data: [
	    			{_id: 1, title: 'Dr.', name: 'Andy', age: 24, status: 'active', profile: {dob: '2000/01/01', major: 'cs'}},
	    			{_id: 2, title: 'Dr.', name: 'July', age: 24, status: 'blocked', profile: {dob: '2000/01/01', major: 'cs'}},
	    			{_id: 3, title: 'Dr.', name: 'Jay', age: 24, status: 'active', profile: {dob: '2000/01/01', major: 'cs'}},
	    			{_id: 4, title: 'Dr.', name: 'Bob', age: 24, status: 'offline', profile: {dob: '2000/01/01', major: 'cs'}},
	    			{_id: 5, title: 'Dr.', name: 'Alice', age: 24, status: 'active', profile: {dob: '2000/01/01', major: 'cs'}},
	    			{_id: 6, title: 'Dr.', name: 'Tom', age: 24, status: 'active', profile: {dob: '2000/01/01', major: 'cs'}},
	    		],

	    		columns: [
	    			{
	    				name: '_id',
	    				label: '#'
	    			},
	    			{
	    				name: 'name',
	    				icon: 'fa fa-credit-card'
	    			},
	    			{
	    				name: 'age'
	    			},
	    			{
	    				cell: 'action',
	    				label: 'Ops',
	    				icon: 'fa fa-cogs',
	    				actions: {
	    					edit: {
	    						fn: function(record){
	    							console.log(record);
	    						}
	    					}
	    				}
	    			}
	    		]

	    	});
	    }
	});	

})(Application);
