/**
 * This is the Select-All Header for Datagrid2
 *
 * Options
 * -------
 * row - which in turn contains a meta object holding a ref to the table view.
 *
 * Instrumentation
 * ---------------
 * If you use header:'select-all' in a column config, it will give the table a new method called getSelectedRows(iterator(row));
 * If you passin a iterator function then please return the data object you want by extracting it from the passed in row object in param, if not, the row view object will be returned;
 * This should mainly be used by the action listeners of the toolbar items of a datagrid;
 *
 * @author Tim.Liu
 * @created 2013.11.27
 */

Application.Widget.register('SelectAllHeader', function(){

	var UI = Backbone.Marionette.ItemView.extend({
		template: '#widget-selectallcell-tpl', //re-use the SelectAllCell's template.
		className: 'select-all-header-cell',

		initialize: function(options){
			this.row = options.row;
			this.autoDetectUIs();

			//instrument the table object with a getSelectedRows method
			this.row.meta.table.getSelectedRows = function(iterator){
				var that = this;
				var selection = this.tbody.$el.find('.select-all-cell :checked').map(function(index, el){
					var row = that.tbody.currentView.children.findByCid($(el).attr('rowcid'));
					if(iterator){
						return iterator(row);
					}
					return row;
				}).get();
				return selection;
			} 
		},

		events: {
			'click input': 'toggleAll'
		},

		toggleAll: function(e){
			/*Important: use $.prop instead of $.attr for getting/setting checked status from <input> tags*/
			var checked = this.ui.checkbox.prop('checked');
			this.row.meta.table.tbody.$el.find('.select-all-cell :checkbox').prop('checked', checked);
		}
	});

	return UI;
});