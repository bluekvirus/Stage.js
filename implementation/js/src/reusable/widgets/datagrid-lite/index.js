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
 * 3. details: false or datum name in data row or {
 * 		key: ...,
 * 		view: ... (definition)
 * }
 *
 * note
 * ----
 * the details row appears under each normal data row;
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
					el: this.body.$el[0]
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
					column.header = column.header || 'string',
					column.cell = column.cell || column.header || 'string',
					column.label = column.label || _.string.titleize(column.name)
				});				
				this.header.currentView.trigger('view:render-data', this._options.columns);

				//3. rebuild body rows - let it rerender with new data array
				this.body.currentView._options = this._options;
				this.body.currentView.trigger('view:render-data', this._options.data);
			}
		});

		var HeaderRow = app.view({
			type: 'CollectionView',
			itemView: 'dynamic',
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
			tagName: 'tr',
			initialize: function(options){
				this.record = options.record;
			},
			//buildItemView - select proper cell
			buildItemView: function(item, ItemViewType, itemViewOptions){
				return app.widget(_.string.classify([item.get('cell'), 'cell'].join('-')), {
					model: item,
					tagName: 'td',
					row: this //link each cell with the row. (use/link it in cell's init())
				});
			}			
		})		

		var Body = app.view({
			type: 'CollectionView',
			itemView: Row,
			itemViewOptions: function(model, index){
				return {
					record: model, //link each row with corresponding data record
					collection: app.collection(_.map(this._options.columns, function(column){
						return _.extend({
							value: model.get(column.name)
						}, column)
					}, this))
				}
			}
		})

		return UI;

	});

})(Application);