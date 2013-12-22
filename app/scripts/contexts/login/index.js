;(function(app){

	app.Context.create('Login', function(context){
		
		return {
			View: {
				Default: Backbone.Marionette.Layout.extend({
					template: '#application-context-login-tpl',
					className: 'container',
					initialize: function(options){
						this.autoDetectRegions();
					},
					onShow: function(){
						this.form.show(new context.Form.View.Default());
					}
				})
			}
		}

	});

})(Application);

Template.extend(
	'application-context-login-tpl',
	[
		'<div region="form"></div>'
	]
);
