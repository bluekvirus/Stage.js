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
 * options
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
 * events
 * ------
 * 1. row:clicked
 * 2. row:dblclicked
 * 
 * 
 * note
 * ----
 * the details row appears under each normal data row;
 *
 * TBI
 * ---
 * select header/cell
 * details row is still in TBI status (extra tr stub, view close clean up)
 * 
 * 
 * @author Tim.Liu
 * @created 2014.04.22
 */

;(function(app){

	app.widget('Datagrid', function(){

		var UI = app.view({
			type: 'Layout',
			tagName: 'table',
			template: [
				'<thead region="header"></thead>',
				'<tbody region="body"></tbody>'
			],
			initialize: function(options){
				this._options = _.extend({
					data: [],
					details: false,
					columns: []
				}, options);
			},
			onShow: function(){
				this.header.show(new HeaderRow());
				this.body.show(new Body({
					//el can be css selector string, dom or $(dom)
					el: this.body.$el 
					//Note that a region's el !== $el[0], but a view's el === $el[0] in Marionette
				}));
				this.trigger('view:reconfigure', this._options);
			},
			onReconfigure: function(options){
				options = options || {};
				//1. reconfigure data and columns into this._options
				this._options.data = options.data || this._options.data;
				_.each(options.columns, function(column){
					//TBI column ['name' or {}, '-name']
				}, this);

				//2. rebuild header cells - let it rerender with new column array
				_.each(this._options.columns, function(column){
					column.header = column.header || 'string';
					column.cell = column.cell || column.header || 'string';
					column.label = column.label || _.string.titleize(column.name);
				});				
				this.header.currentView.trigger('view:render-data', this._options.columns);

				//3. rebuild body rows - let it rerender with new data array
				this.body.currentView._options = this._options;
				this.body.currentView.trigger('view:render-data', this._options.data);
			},
			onRenderData: function(data){
				//override the default data rendering meta-event responder
				this.trigger('view:reconfigure', {data: data});
			}
		});

		var HeaderRow = app.view({
			type: 'CollectionView',
			itemView: 'dynamic',
			itemViewEventPrefix: 'headercell',
			tagName: 'tr',
			//buildItemView - select proper header cell
			buildItemView: function(item, ItemViewType, itemViewOptions){
				return app.widget(_.string.classify([item.get('header'), 'header', 'cell'].join('-')), {
					model: item,
					tagName: 'th'
				});
			}
		});

		var Row = app.view({
			type: 'CollectionView',
			itemView: 'dynamic',
			itemViewEventPrefix: 'cell',
			tagName: 'tr',
			triggers: { //forward DOM events to row
				'click': 'clicked',
				'dblclick': 'dblclicked'
			},
			initialize: function(options){
				this.grid = options.body.parentCt; //give each row the grid view ref.
			},
			//buildItemView - select proper cell
			buildItemView: function(item, ItemViewType, itemViewOptions){
				return app.widget(_.string.classify([item.get('cell'), 'cell'].join('-')), {
					tagName: 'td',
					model: item,

					row: this //link each cell with the row. (use/link it in cell's init())
				});
			}			
		});

		var Body = app.view({
			type: 'CollectionView',
			itemView: Row,
			itemViewEventPrefix: 'row',
			itemViewOptions: function(model, index){
				return {
					collection: app.collection(_.map(this._options.columns, function(column){
						return _.extend({
							value: selectn(column.name || '', model.attributes),
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