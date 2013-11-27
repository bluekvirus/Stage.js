/**
 * This is the Select-All Header for Datagrid2
 *
 * @author Tim.Liu
 * @created 2013.11.27
 */

Application.Widget.register('SelectAllHeader', function(){

	var UI = Backbone.Marionette.ItemView.extend({
		template: '#widget-selectallcell-tpl',

		initialize: function(options){
			this.row = options.row;
			this.autoDetectUIs();
		},

		events: {
			'click input': 'toggleAll'
		},

		toggleAll: function(e){
			var checked = this.ui.checkbox.attr('checked');
			if(checked) {
				checked = false;
			}else {
				checked = true;
			}
			this.ui.checkbox.attr('checked', checked);

			this.row.meta.table.tbody.$el.find('.select-all-cell :checkbox').attr('checked', checked);
		}
	});

	return UI;
});