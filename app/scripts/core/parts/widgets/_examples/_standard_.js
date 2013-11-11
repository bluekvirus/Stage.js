/**
 * Standard Custom Widget Code Template
 *
 * =================================================
 * Layout or ItemView/CollectionView/CompositView ?
 * =================================================
 * for View.Default. This concept holds true for both Context/Sub Modules and Widgets.
 * Use a layout when there are sub view items (like widgets) contained in the view object.
 * Use other view classes when there are no sub view regions to show other views on.
 * 
 *
 * @author Tim.Liu
 * @create 2013.10.20
 * @version 1.0.1
 */

Application.Widget.register(/*Your widget name.*/, function(factoryOpt){

	var UI = Backbone.Marionette./*Layout/ItemView/CollectionView/CompositeView*/.extend({
		template: '#widget-/*'Your widget name.'*/-tpl',
		className:'',

		initialize: function(options){
			this.enableActionTags('Widget./*'Your widget name.'*/');
		},

		actions: {
		}
	});

	return UI;

});

Template.extend('widget-/*'Your widget name.'*/-tpl', [
	'',
]);