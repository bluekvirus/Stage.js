/**
 * This is the Select-All Header for Datagrid2
 *
 * @author Tim.Liu
 * @created 2013.11.27
 */

Application.Widget.register('SelectAllHeader', function(){

	var UI = Backbone.Marionette.ItemView.extend({
		template: '#widget-selectallcell-tpl', //re-use the SelectAllCell's template.

		initialize: function(options){
			this.row = options.row;
			this.autoDetectUIs();
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