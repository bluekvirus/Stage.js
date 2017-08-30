/**
 * This is the minimum Datagrid widget for data tables
 *
 * [table]
 * 		[thead]
 * 			<tr> th, ..., th </tr>
 * 		[tbody]
 * 			<tr> td, ..., td </tr>
 * 			...
 * 			<tr> ... </tr>
 *
 * Options
 * -------
 * 1. data []: rows of data
 * 2. columns [
 * 		{
 * 			name: datum key in data row
 * 			cell: cell name
 * 			header: header cell name
 * 			label: name given to header cell (instead of _.titleize(name))
 * 		}
 * ]
 * 3. details: false or datum name in data row or a view definition (render with row.model) - TBI
 * 
 *
 * Events
 * ------
 * 1. row:clicked
 * 2. row:dblclicked
 * 
 * 
 * Note
 * ----
 * The details row appears under each normal data row;
 *
 * TBI
 * ---
 * select header/cell
 * details row is still in TBI status (extra tr stub, view close clean up)
 * 
 * 
 * @author Tim Lauv
 * @created 2014.04.22
 */

;(function(app){

	app.widget('Datagrid', function(){

		var UI = app.view({
			tagName: 'table',
			template: [
				'<thead region="header"></thead>',
				'<tbody region="body"></tbody>'
			],
			initialize: function(options){
				this.options = _.extend({
					data: [],
					details: false,
					columns: []
				}, options);
			},
			onReady: function(){
				this.trigger('view:reconfigure', _.extend(this.options, {data: this.get('items', [])}));
			},
			onReconfigure: function(options){
				options = options || {};
				//1-1. reconfigure data and columns into this.options
				this.options = _.extend(this.options, options);

				//1-2. rebuild header cell options - let it rerender with new column array
				_.each(this.options.columns, function(column){
					column.header = column.header || 'string';
					column.cell = column.cell || column.header || 'string';
					column.label = column.label || _.string.titleize(column.name);
				});

				//2. ensure header and body views
				if(!this.header.currentView)
					this.header.show(HeaderRow.create({grid: this}));
				if(!this.body.currentView){
					var that = this;
					var body = Body.create({
						//el can be css selector string, dom or $(dom)
						el: this.body.$el, 
						//Note that a region's el !== $el[0], but a view's el === $el[0] in Marionette.
						grid: this
					}).on('all', function(e){
						//setup page related events forwarding (page-changed, page-not-changed)
						if(/page-/.test(e))
							that.trigger.apply(that, arguments);
					});
					this.body.show(body);
				}

				////////////////Note that the ifs here are for early 'show' --> .set() when using local .data////////////////			
				this.header.currentView.set(this.options.columns);
				this.body.currentView.options = this.options;
				/////////////////////////////////////////////////////////////////////////////////////////////////////////////
				this.trigger('view:set-grid-data', this.options.data);
			},
			onSetGridData: function(data){
				//3. rebuild body rows - let it rerender with new data array
				this.body.currentView.set(data);

			},
			onLoadPage: function(options){
				this.body.currentView.trigger('view:load-page', options);
			},
			getBody: function(){
				return this.body.currentView;
			},
			getHeader: function(){
				return this.header.currentView;
			}
		});

		var HeaderRow = app.view({
			type: 'CollectionView',
			forceViewType: true,
			itemView: 'dynamic',
			itemViewEventPrefix: 'headercell',
			tagName: 'tr',
			initialize: function(options){
				this.grid = options.grid; //give each row the grid view ref.
			},
			//buildItemView - select proper header cell
			buildItemView: function(item, ItemViewType, itemViewOptions){
				var HCell = app.get(_.string.classify([item.get('header'), 'header', 'cell'].join('-')), 'Widget');
				return HCell.create({
					model: item,
					tagName: 'th',

					row: this //link each cell (this.options.row) with the row. (use/link it in cell's init())
				});
			}
		});

		var Row = app.view({
			type: 'CollectionView',
			forceViewType: true,
			itemView: 'dynamic',
			itemViewEventPrefix: 'cell',
			tagName: 'tr',
			triggers: { //forward DOM events to row
				'click': {
					event: 'clicked',
					preventDefault: false //for cell elements to work properly (checkbox/radio/<anchor/>)
				},
				'dblclick': {
					event: 'dblclicked',
					preventDefault: false
				}
			},
			initialize: function(options){
				this.grid = options.body.grid; //give each row the grid view ref.
			},
			//buildItemView - select proper cell
			buildItemView: function(item, ItemViewType, itemViewOptions){
				var Cell = app.get(_.string.classify([item.get('cell'), 'cell'].join('-')), 'Widget');
				return Cell.create({
					tagName: 'td',
					model: item,

					row: this //link each cell (this.options.row) with the row. (use/link it in cell's init())
				});
			}			
		});

		var Body = app.view({
			type: 'CollectionView',
			forceViewType: true,
			itemView: Row,
			itemViewEventPrefix: 'row',
			initialize: function(options){
				this.grid = options.grid;
			},
			itemViewOptions: function(model, index){
				return {
					collection: app.collection(_.map(this.options.columns, function(column){
						return _.extend({
							value: app.extract(column.name || '', model.attributes),
							index: index
						}, column);
					}, this)),

					body: this //passing body to row view
				};
			},
			itemEvents: { //forward row events to grid
				'clicked': function(e, row){
					row.grid.trigger('row:clicked', row);
				},
				'dblclicked': function(e, row){
					row.grid.trigger('row:dblclicked', row);
				}
			}
		});
		
		return UI;

	});

})(Application);