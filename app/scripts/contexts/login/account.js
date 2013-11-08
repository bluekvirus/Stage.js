/**
 * The login page module. Moving the login page to the front-end.
 *
 * @author Tim.Liu
 */

;(function(app){

	var context = app.Context.Login;
	var module = context.module('Account');

	_.extend(module, {

		View: {
			Default: Backbone.Marionette.ItemView.extend({
				template: '#custom-module-login-account-tpl',
				className: 'hero-unit login-account-dialog-big',

				ui: {
					form: '.login-form',
					submitBtn: '[action=signin]'
				},

				events: {
					'keydown': function(e){
						if(e.keyCode === 13) 
							this.ui.submitBtn.trigger('click');
					}
				},

				initialize: function(options){
					this.enableActionTags('Context.Login.Account');
				},

				actions: {
					signin: function($el){
						var login = this.ui.form.serialize();
						$.ajax({
							url: '/login',
							type: 'POST',
							dataType: 'json',
							data: login,
							beforeSend: function(){
								$el.spin(true);
							},
							success: function(res) {
								//the default reply from server is res.redirect
								app.user = res.user;
								app.trigger('app:user-changed');
								app.trigger('app:switch-context', app.config.appContext, app.Context.Login.cachedRedirect || 'navigate/default'); //use the triggerNavi flag to allow re-evaluation of uri fragment.
							}
						})
						.always(function(){
							$el.spin(false);
						})
						
					}
				}
			})
		}

	});

})(Application);

Template.extend(
	'custom-module-login-account-tpl',
	[
		'<h3><p>Please login</p></h3>',
		'<hr>',
		'<form class="form-horizontal login-form" method="POST">',
			'<div class="control-group">',
				'<label class="control-label" for="inputEmail">Email</label>',
				'<div class="controls">',
					'<input type="text" placeholder="Email" name="username" id="inputEmail">',
				'</div>',
			'</div>',
			'<div class="control-group">',
				'<label class="control-label" for="inputPassword">Password</label>',
				'<div class="controls">',
					'<input type="password" placeholder="Password" name="password" id="inputPassword">',
				'</div>',
			'</div>',
			'<div class="control-group">',
				'<div class="controls">',
					'<label class="checkbox"><input type="checkbox">Remember me</label>',
					'<button class="btn btn-action-primary" type="button" action="signin">Sign in</button>', //css in core.less that utilizes variables.less and mixins.less
				'</div>',
			'</div>',
		'</form>'
	]
);