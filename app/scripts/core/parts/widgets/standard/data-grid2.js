/**
 * This is the new implementation of the DataGrid widget. We still utilizes the power of Backgrid and $.tablesorter;
 *
 * Options
 * -------
 * 1. collection (of course)
 * 
 * 2. pagination (for the collection) - see core/enhancements/collection.js
 * 
 * 3. tools: [ (append to default tools)
 * 		{
 * 			name: ..., action event string (*required)
 * 		 	label: ..., string [opt]
 * 		  	icon: ..., class string [opt]
 * 		  	group: ..., string [opt]
 * 		   	fn: impl function() with this = datagrid view
 * 		},...,
 * ] or { (replace the tools)
 * 		'name': { 
 * 			label: ..., string [opt]
 * 			icon: ..., class string [opt]
 * 			fn: impl function() [opt]
 * 		},...,
 * }
 * Advanced: since tool name is also the action trigger/event name, you can use ':name' to just fire event from datagrid.
 *
 * 4.1 disableBatchSelection: false | true,
 * 4.2 disableRowActions: false | true
 * 4.3 columns: [ (add in between selectAll and action columns)
 * 		{
 * 			name: ...,
			label: default on titleized field name, optional
			cell: default on "string", optional
			headerCell: default on 'string', optional
			filterable: default on 'true' , searchable through jquery.sieve, optional
			sortDisabled: default on 'false', apply local sort through $.tablesorter, optional
			...
		}, - see datagrid widget and lib Backgrid.js (we turned off sortable and editable by default)
		...
 * ]
 * 
 * 5. rowActions: [ (append to default row actions)
 * 		{
 * 			name: ...,
 * 			label: ...,
 * 			icon: ...,
 * 			fn: impl function(datagrid) with this =  row model object
 * 		},...,
 * ] or { (replace the actions)
 * 		'name': {
 * 			label: ...,
 * 			icon: ...,
 * 			fn: impl function(datagrid)
 * 		}
 * }
 * 
 * 6. groupBy: fieldname of a row model. (this will disable pagination)
 * 
 * 7. rowDetails: View object/['field1', 'field2']/fieldname/boolean (true for all fields).
 * If rowDetails is enabled, another row will appear under the data row for details (default on using a property grid as details view)
 *
 * Note that we no longer use parentCt or formWidget options. Collaboration with other widgets or view objects should be done with events (handshakes)
 * 
 *
 * @author Tim.Liu
 * @created 2013.11.20
 */

Application.Widget.register('DataGrid2', function(){

	var DataGrid = Backbone.Marionette.Layout.extend({
	        template: '#widget-datagrid-tpl',
	        className: 'basic-datagrid-view-wrap',

	        initialize: function(options) {
	        }
	});

	return DataGrid;

});

Template.extend(
	'widget-datagrid-tpl',
	[
		'<div region="header" class="datagrid-header-container"></div>',
		'<div region="body" class="datagrid-body-container"></div>',
		'<div region="footer" class="datagrid-footer-container"></div>'
	]
);

Template.extend(
	'widget-datagrid-footer-tpl',
	[
		' ' //TBI
	]
);