/**
 * Datagrid2
 * This is the new implementation of the DataGrid widget. We still utilizes the power of $.tablesorter;
 *
 * Layout
 * ------
 * [Header Bar]
 * [Grid      ]
 * [Footer Bar]
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
 * 4 columns: [ (add in between selectAll and action columns)
 * 		{
 * 			name: ...,
			label: default on titleized field name, optional
			cell: a string (looked up in app.Widget.get('..Cell')) or a view definition, default on null -> just display cell value as string.
			header: default on 'string', optional
			filterable: default on 'true' , searchable through jquery.sieve, optional
			sortable: default on 'false', apply local sort through $.tablesorter, optional
			?editable?: default on 'false', whether or not the inline editor bar should include this column
		},
		...
 * ]
 * 
 * 5. (row) groupBy: fieldname of a row model. (this will disable pagination)
 * 
 * 6. (row) details: View object/['field1', 'field2']/fieldname/boolean (true for all fields).
 * If details is enabled, another row will appear under the data row for details (default on using a property grid as details view)
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
	        	
	        	//toolbar; (link with our toolbelt widget)
	        	this.table = new Table(options); 
	        	this.footerbar = new FooterBar(options);
	        },

	        onShow: function(){
	        	//toolbar
	        	this.body.show(this.table);
	        	this.footer.show(this.footerbar);
	        	this.table.collection.load();
	        }
	});

	//----------------Grid----------------

	var Table = Backbone.Marionette.Layout.extend({
		template: '#widget-datagrid-table-tpl',
		tagName: 'table',
		id: _.uniqueId('table-view'),
		className: 'datagrid',
		
		initialize: function(options){
			this.itemView = Row; //specify here so it can be defined below Table definition.
			//collection, pagination;
			if(options.pagination) this.collection.enablePagination(options.pagination);

			//columns (sortable, filterable), customized cells/header cells;
			this.columns = this.columns || options.columns || [];
			//0. check (Note that checking this.collection will return false in init, so don't check it here...weird)
			if(!this.columns) throw new Error('DEV::Widget.Datagrid2::You must init the grid with some columns!');
			//1. sort out the cell/header view object. - this means customized/predefined cell/header should be defined with name XxxxCell and XxxxHeader in app.Widget registry
			_.each(this.columns, function(col){
				_.each(['cell', 'header'], function(tdType){
					if(!col[tdType]) col[tdType] = 'string';
					if(_.isString(col[tdType])){
						col[tdType] = Application.Widget.get(_.string.classify(col[tdType] + ' ' + tdType));
					}
				}, this);
			});
			//2. prepare the region $el(s)
			this.autoDetectRegions();
		},

		onShow: function(){
			//thead row
			this.thead.show(new HeaderRow({
				collection: new Backbone.Collection(_.map(this.columns, function(col){
					return {
						val: col.label || _.string.titleize(col.name),
						column: col
					}
				}, this)),
			}));
			//tbody
			var that = this;
			this.tbody.show(new Backbone.Marionette.CollectionView({
				template: '#_blank',
				el: 'table#' + this.id + ' > tbody', //hook the tbody view back to tbody.
				itemView: Row,
				itemViewOptions: function(model, index){
					return {
						collection: new Backbone.Collection(_.map(that.columns, function(col){
							return {
								val: model.get(col.name),
								column: col
							}
						})),
						meta: { //Note that we didn't include this in the above collection as per-cell-meta since these metadata items are shared within a row.
							record: model, //pass down the data model of this row
							table: that, //pass down the table view object
						}
					}
				},
				collection: this.collection,
			}));
		}

	});

	var HeaderRow = Backbone.Marionette.CollectionView.extend({
		tagName: 'tr',
		itemView: 'delegated',
		buildItemView: function(item, ItemViewType, itemViewOptions){
			// build the final list of options for the item view type
			var options = _.extend({model: item, tagName:'th'}, itemViewOptions);
			// create the item view instance
			var View = item.get('column').header;
			// return it
			return new View(options);
		}

	});

	var Row = Backbone.Marionette.CollectionView.extend({
		tagName: 'tr',
		itemView: 'delegated',
		initialize: function(options){
			this.meta = options.meta; //grab the meta data passed down by tbody CollectionView.
			this.itemViewOptions = {
				row: this, //passing down this row view object so that row.meta can be used within each cells.
			};
		},
		buildItemView: function(item, ItemViewType, itemViewOptions){
			var options = _.extend({model: item, tagName:'td'}, itemViewOptions);
			var View = item.get('column').cell;
			return new View(options);
		}
	});

	/*Actual impl of predefined Cells are not here, the pre-defined Cells are treated as standard widgets, and require only be named with a XxxxCell format*/	

	//----------------Header/Footer Bars----------------

	//HeaderBar: toolbelt (tools and search/filter)
	//TBI
	
	//FooterBar: record statistics, paginator
	var FooterBar = Backbone.Marionette.Layout.extend({
		template: '#widget-datagrid-footer-tpl',

		initialize: function(options){
			this.autoDetectUIs();
			this.autoDetectRegions();
			this.listenTo(options.collection, 'all', function(){
				//extract info from options.collection and show it through uis
				var size = options.collection.size();
				if(options.pagination) {
					var index = ((options.collection.currentPage || 1) - 1) * options.pagination.pageSize + 1;
					this.ui.number.html(index + '-' + (index+size-1) + '/' + options.collection.totalRecords);
				}
				else this.ui.number.html('1-'+ size);
			});
			if(options.pagination){
				this.paginator = Application.Widget.create('Paginator', {
					targetCollection: options.collection,
					alignment: 'right'
				});
			}
		},

		onShow: function(){
			if(this.paginator) this.pager.show(this.paginator);
		}
	});

	return View;

});

//Layout:
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
		'<thead region="thead"></thead>',
		'<tbody region="tbody"></tbody>' //leave to the row views (which is a collection view of <td>s)
	]
);

//Footer:
Template.extend(
	'widget-datagrid-footer-tpl',
	[
		'<div class="pull-left collection-stat" style="width:200px;"><small>Records</small> <small ui="number"></small></div>',
		'<div region="pager" style="margin-left:200px;">',
	]
);