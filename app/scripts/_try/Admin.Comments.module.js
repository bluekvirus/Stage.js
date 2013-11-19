/**
 * 
 */

;(function(app){

	var module = app.Context.Admin.create('Comment', 'table', {

		defaultAdminPath: 'Test->Content->Comments',

		dataunit: {},

		datagrid: {
			pagination: {
				mode: 'server'
			},
			columns: [
				//select-all col
				{
		            name: "_selected_",
		            label: "",
		            cell: "select-row",
		            headerCell: "select-all",
		            filterable: false,
		            sortDisabled: true
		        },

		        //fields
		        {
		        	name: 'title',
		        	label: 'Title',
		        	cell: 'string'
		        },
		        
		        //action col
		        {
	        	    name: "_actions_",
		            label: "",
		            cell: "action",
		            filterable: false,
		            sortDisabled: true,
		            actions: [
		            	{
			            	name: 'edit',
			            	title: 'Edit'
		            	},
		            	{
		            		name: 'delete',
		            		title: 'Delete'
		            	}
		            ]
		        }
			]
		},

		form: {
			template: '',
			editors: {
				title: {
					type: 'text',
					label: 'Title',
					validate: {
						required: true
					}
				},
				body: {
					type: 'textarea',
					label: 'Content'
				}
			}
		}

	});

})(Application);