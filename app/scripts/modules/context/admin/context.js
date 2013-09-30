/**
 * This is the Admin context module, note that there is a requireLogin flag that can be set
 * to call on switching to the Login context if the user is not logged in...
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