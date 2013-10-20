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
 */

;(function(app){

	var context = app.Context./*'Your context name.'*/;
	var module = context.module(/*'Your sub UI module name.'*/);

	_.extend(module, {

		View: {
			Default: Backbone.Marionette.Layout.extend({
				template: '#custom-module-/*'Your context name.'*/-/*'Your sub module name.'*/-tpl',
				className: '',

				initialize: function(options){
					//this.enableUILocks(); - Layout View object only.
					this.enableActionTags('Context./*'Your context name.'*/./*'Your sub module name.'*/'); //enable the action tags (attr. action=func)
				},

				actions: {
					//action func here...
				}
			})
		}

	});

})(Application);

Template.extend(
	'custom-module-/*'Your context name.'*/-/*'Your sub module name.'*/-tpl',
	[
		''
	]
);