/**
 * This is the Admin context module, note that there is a requireLogin flag that can be set
 * to call on switching to the Login context if the user is not logged in...
 *
 * Factory
 * -------
 * We also provide a 'create' method for producing a UI submodule under Admin context. 
 * This way we can glue the data, datagrid, form, layout and effect together in a generalized way.
 *
 * @author Tim.Liu
 * @created 2013.09.28
 */
;(function(app){

	app.Context.create('Admin', function(context){

		return {
			requireLogin: true,
			defaults: {
				region: 'content',
				module: 'Dashboard'
			},
			View: {
				Default: Backbone.Marionette.Layout.extend({
					template: '#application-context-admin-tpl',
					className: 'default row-fluid',
					regions: {
						sidebar: '.sidebar',
						content: '.content',
					},
					onShow: function(){
						this.sidebar.show(new context.Menu.View.Default());
					}
				})
			},

			/**
			 * Factory
			 * @param  {[type]} name    name of the admin submodule
			 * @param  {[type]} type    table|complex
			 *
			 * Options
			 * -------
			 * 1. dataunit { - see core/modules/data-units.js
			 *  modelOnly: true|false
			 * 	model: ...
			 * 	collection: ...
			 * }
			 * 2. datagrid { - see core/parts/widgets/standard/data-grid.js, ignored if of type complex.
			 * 	columns: [],
			 * 	tools: ,
			 * 	alterTools
			 * }
			 * 3. form - a view object definition or a object wrapping template + config for activateEditors
			 * 4. defaultAdminPath - 'MenuItem->SubItem->...' menu item name and path.
			 * 
			 * @return the admin submodule
			 */
			create: function(name, type, options){

			}
		} 
	});

})(Application);

Template.extend(
	'application-context-admin-tpl',
	[
	    '<div class="sidebar span2"></div>',
	    '<div class="content span10"></div>'
	]
);