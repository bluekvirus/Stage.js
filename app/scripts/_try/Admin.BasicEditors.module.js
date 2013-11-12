/**
 * New sub UI Module (of a context) Code Template.
 *
 * =================================================
 * Layout or ItemView/CollectionView/CompositView ?
 * =================================================
 * for View.Default. This concept holds true for both Context/Sub Modules and Widgets.
 * Use a layout when there are sub view items (like widgets) contained in the view object.
 * Use other view classes when there are no sub view regions to show other views on.
 *
 * @author Tim.Liu
 * @create 2013.10.20
 * @version 1.0.1
 * @sublime-snippet
 */

;(function(app){

	var context = app.Context.Admin;
	var module = context.module('EditorDemo');

	_.extend(module, {

		View: {
			Default: Backbone.Marionette.Layout.extend({
				template: '#custom-module-Admin-EditorDemo-tpl',
				className: '',

				initialize: function(options){
					//activate some view enhancements or coop events listening here.
				},

				onShow: function(){
					//some code here...
				},

				actions: {
					//action func here...
				}
			})
		}

	});

})(Application);

Template.extend(
	'custom-module-Admin-EditorDemo-tpl',
	[
		' '
	]
);
