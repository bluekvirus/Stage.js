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
 * Note that we no longer use parentCt or formWidget options.
 * Collaboration with other widgets or view objects should be done with events (handshakes) up in the parent container.
 * 
 *
 * @author Tim.Liu
 * @created 2013.11.20
 */

Application.Widget.register('DataGrid2', function(){

	var View = Backbone.Marionette.Layout.extend({
	        template: '#widget-datagrid-tpl',
	        className: 'basic-datagrid-view-wrap',

	        initialize: function(options) {
	        	options = options || {};
	        	this.autoDetectRegions();
	        	//1. collection, pagination;
	        	this.table = new Table(options); 
	        	//2. columns (sortable, filterable), customized cells/header cells;
	        	//3. toolbar; (link with our toolbar widget)
	        	//4. row - actions, details, groups;
	        },

	        onShow: function(){
	        	this.body.show(this.table);
	        }
	});

	var Table = Backbone.Marionette.CompositeView.extend({
		template: '#widget-datagrid-table-tpl',
		tagName: 'table',
		className: 'datagrid',
		itemViewContainer: 'tbody',
		itemView: Row,		

		initialize: function(options){
			this.columns = this.columns || options.columns || [];
			//check
			if(!this.collection || !this.columns) throw new Error('DEV::Widget.Datagrid2::You must init the grid with a collection and some columns!');
			if(options.pagination) this.collection.enablePagination(options.pagination);
			var that = this;
			this.itemViewOptions = function(){
				return {
					columns: that.columns,
					//need to pass down other options as well.
					//see above 4-7 in code design comment
				};
			};
		},

	});

	var Row = Backbone.Marionette.CollectionView.extend({
		template: '#widget-datagrid-row-tpl',
		tagName: 'tr',
		itemView: Cell,

		initialize: function(options){
			this.collection = new Backbone.Collection(_.map(this.options.columns, function(col){
				return this.model.get(col.name);
			}, this));
		}
	});

	var Cell = Backbone.Marionette.itemView.extend({
		template: '#_blank',
		tagName: 'td',

		initialize: function(options){
			//find the cell view or default on just showing the data as a string.
		}
	});

	/*Actual impl of Cells are not here except for the default 'string' Cell*/	

	var Footer = Backbone.Marionette.Layout.extend({
		template: '#widget-datagrid-footer-tpl',
	});

	return View;

});

//Template:
Template.extend(
	'widget-datagrid-tpl',
	[
		'<div region="header" class="datagrid-header-container"></div>',
		'<div region="body" class="datagrid-body-container"></div>',
		'<div region="footer" class="datagrid-footer-container"></div>'
	]
);

//Table:
Template.extend(
	'widget-datagrid-table-tpl',
	[
		'<thead></thead>',
		'<tbody></tbody>'
	]
);

//Row: 
Template.extend(
	'widget-datagrid-row-tpl',
	[
		' ' //TBI
	]
);

//Footer:
Template.extend(
	'widget-datagrid-footer-tpl',
	[
		' ' //TBI
	]
);