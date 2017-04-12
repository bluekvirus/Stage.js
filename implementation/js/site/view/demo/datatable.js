;(function(app){

	var mockDataTpl = {
		'payload|15-15': [{
			'_id': '_@GUID',
			'title|1': ['Dr.', 'Mr.', 'Ms.', 'Mrs'],
			'username': '@EMAIL',
			'status|1': ['active', 'blocked', 'offline', 'guest'],
			profile: {
				'name': '@name',
				'age': '@INTEGER(20,90)',
				'dob': '@DATE',
				'major|1': ['CS', 'SE', 'Design', 'EE', 'Math'],
			},
			'link': '/profile/@_id'
		}],
		total: 150,
	};

	app.view('Demo.Datatable', {
	    template: [
	    	'<div ui="spin"><i class="fa fa-cog fa-spin"></i> Loading...</div>',
	    	'<div region="grid"></div>',
	    	'<div region="footer"></div>'
	    ],

	    onReady: function(){
	    	var datagrid = new (app.widget('Datagrid'))({
	    		className: 'table table-hover',
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
	    							app.debug(this.model, this.collection, this.grid);
	    						}
	    					}, 
	    					delete: {}
	    				}
	    			}
	    		]
	    	});
	    	datagrid.on('all', function(){
	    		app.debug('e:', arguments);
	    	});
	    	datagrid.on('row:clicked', function(row){
	    		app.debug('selected/focused on', row);
	    	});
	    	datagrid.on('row:dblclicked', function(row){
	    		app.debug('drilled in', row);
	    	});
	    	datagrid.onPageChanged = function(){
	    		self.ui.spin.hide();
	    	};
	    	var self = this;
	    	datagrid.once('ready', function(){
				//load data grid page from server using a Paginator
		    	self.show('footer', 'Paginator', {
		    		target: datagrid.getBody(),
		    		className: 'pagination pagination-sm pull-right',
		    		pageWindowSize: 3
		    	});

		    	//hook up good data animation
				datagrid.on('view:page-changed', function(data){
					app.animateItems('tbody tr');
				});

				//hook up bad data backup mock data
				datagrid.on('view:page-not-changed', function(errStatus){
					datagrid.set(Mock.mock(mockDataTpl).payload);
				});

		    	datagrid.trigger('view:load-page', {
		    		url: 'sample/user',
		    		page: 1,
		    		querys: {
		    			status: 'active'
		    		}
		    	});
	    	});
			this.grid.show(datagrid);
	    },

	    onNavigateTo: function(path, vcfg){
	    	app.debug('Datatable navi to', path, vcfg);
	    },

	    //can only be detected if parentCt is still present.
	    onNavigateAway: function(){
	    	app.debug('Datatable navi away', this);
	    }
	});	

})(Application);
