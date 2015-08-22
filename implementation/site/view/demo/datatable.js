;(function(app){

	app.area('Demo.Datatable', {
	    template: [
	    	'<div ui="spin"><i class="fa fa-cog fa-spin"></i> Loading...</div>',
	    	'<div region="table"></div>',
	    	'<div region="footer"></div>'
	    ],

	    onAnimated: function(){
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
	    							//record, columns since action listeners are bound to the current row view
	    							console.log(this.model, this.collection, this.grid);
	    						}
	    					}, 
	    					delete: {}
	    				}
	    			}
	    		]

	    	});

	    	//load data grid page from server
	    	var table = this.table.currentView;
	    	table.on('row:clicked row:dblclicked', function(row){
	    		console.log('selected/focused on', row);
	    	});
	    	this.footer.trigger('region:load-view', 'Paginator', {
	    		target: table.getBody(),
	    		className: 'pagination pagination-sm pull-right',
	    		pageWindowSize: 3
	    	});

	    	var self = this;
	    	table.getBody().onPageChanged = function(){
	    		self.ui.spin.hide();
	    	};
	    	table.getBody().trigger('view:load-page', {
	    		url: 'sample/user',
	    		page: 1,
	    		querys: {
	    			status: 'active'
	    		}
	    	});
	    },

	    onNavigateTo: function(path){
	    	console.log('Datatable nav to', path);
	    },

	    //can only be detected if parentCt is still present.
	    onNavigateAway: function(){
	    	console.log('Datatable nav away', this);
	    }
	});	

})(Application);
