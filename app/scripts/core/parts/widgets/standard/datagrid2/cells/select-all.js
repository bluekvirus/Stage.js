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
	});

	return UI;
});

Template.extend('widget-selectallcell-tpl', [

	'<input ui="checkbox" type="checkbox" style="margin:0;">'

]);