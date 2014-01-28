/**
 * The login page module. Moving the login page to the front-end.
 *
 * @author Tim.Liu
 */

;(function(app){

	var context = app.Context.Login;
	var module = context.module('Form');

	_.extend(module, {

		View: {
			Default: Backbone.Marionette.ItemView.extend({
				template: '#custom-module-login-form-tpl',
				className: 'hero-unit',

				events: {
					'keydown': function(e){
						if(e.keyCode === 13) 
							this.ui.submitbtn.trigger('click');
					}
				},

				initialize: function(options){
					this.enableActionTags('Login.Form');
					this.autoDetectUIs();
					this.enableForm({
						appendTo: '.login-form div[editors]',
						editors: {
							username: {
								label: 'Username',
								validate: {
									required: true
								}
							},
							password: {
								label: 'Password',
								type: 'password'
							}
						}
					});
				},

				actions: {
					signin: function($el){
						var that = this;
						var error = this.validate(true);
						if(error) return;

						that.lockUI();
						var login = this.ui.form.serializeForm(); //since not all editors are activated through enableForm
						
						$.ajax({
							url: '/login',
							type: 'POST',
							dataType: 'json',
							data: login,
							success: function(res) {
								//the default reply from server is res.redirect
								app.user = res.user;
								app.trigger('app:user-changed');
								app.trigger('app:switch-context', app.config.defaultContext, true); //use the triggerNavi flag to allow re-evaluation of uri fragment.

								//better UIExp: retrieve the cached window.location.href string upon login.
								
							}
						})
						.always(function(){
							that.unlockUI();
						})
						
					}
				}
			})
		}

	});

})(Application);

Template.extend(
	'custom-module-login-form-tpl',
	[
		'<h3><p>Please login</p></h3>',
		'<hr>',
		'<div class="form-horizontal login-form" ui="form">',
			'<div editors="*"></div>',
			'<div class="control-group">',
				'<div class="controls">',
					'<label class="checkbox"><input type="checkbox">Remember me</label>',
					'<span class="btn" ui="submitbtn" action="signin">Sign in</span>', //css in core.less that utilizes variables.less and mixins.less
				'</div>',
			'</div>',
		'</div>'
	]
);