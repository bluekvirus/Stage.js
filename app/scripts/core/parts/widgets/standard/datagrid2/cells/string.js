/**
 * The Default String Cell Definition. (for Datagrid2)
 *
 * @author Tim.Liu
 * @created 2013.11.25
 */

;Application.Widget.register('StringCell', function(){

	var View = Backbone.Marionette.ItemView.extend({
		template: '#_blank',
		onRender: function(){
			this.$el.html(String(this.model.get('val')));
		}
	});

	return View;

});