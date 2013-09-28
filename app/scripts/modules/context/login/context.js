;(function(app){

	app.Context.create('Login', function(context){
		
		return {
			defaults: {
				region: 'content',
				module: 'Account'
			},
			View: {
				Default: Backbone.Marionette.Layout.extend({
					template: '#application-context-login-tpl',
					regions: {
						content: '.content'
					}
				})
			}
			//Do NOT need to use onShow() here, since the defaults config will put 'Account' module on page.
		}

	});

})(Application);

Template.extend(
	'application-context-login-tpl',
	[
		'<div class="container content"></div>'
	]
);
