/**
 * The Default String Column Header Definition. (for Datagrid2)
 *
 * @author Tim.Liu
 * @created 2013.11.25
 */

;Application.Widget.register('StringHeader', function(){

	var View = Backbone.Marionette.ItemView.extend({
		template: '#_blank',
		onRender: function(){
			this.$el.html(String(this.model.get('val')));
		}
	});

	return View;

});