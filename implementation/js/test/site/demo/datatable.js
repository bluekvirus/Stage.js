;(function(app){

	var mockDataTpl = {
		'data|50-50': [{
			'_id': '_@GUID',
			'title|1': ['Dr.', 'Mr.', 'Ms.', 'Mrs'],
			'username': '@EMAIL',
			'status|1': ['active', 'blocked', 'offline', 'guest'],
			profile: {
				'name|1': _.times(250, function(){return Random.name()}),
				'age': '@INTEGER(20,90)',
				'dob': '@DATE',
				'major|1': ['CS', 'SE', 'Design', 'EE', 'Math'],
			},
			'link': '/profile/@_id'
		}]
	}

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

	    		data: Mock.mock(mockDataTpl).data,
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
	    }
	});	

})(Application);
