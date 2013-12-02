/**
 * This is the Select-All Cell for Datagrid2
 *
 * @author Tim.Liu
 * @created 2013.11.27
 */

Application.Widget.register('SelectAllCell', function(){

	var UI = Backbone.Marionette.ItemView.extend({
		template: '#widget-selectallcell-tpl',
		className: 'select-all-cell',
		initialize: function(options){
			this.row = options.row; //grab the meta data passed down by table row.
			this.autoDetectUIs();
		},
		onRender: function(){
			this.ui.checkbox.attr('rowcid', this.row.cid); //this is to facilitate getSelectedRows() in table [instrumented by select-all header]
		}
	});

	return UI;
});

Template.extend('widget-selectallcell-tpl', [

	'<input ui="checkbox" tabindex="-1" type="checkbox" style="margin:0;">'

]);