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
					'click [action]': '_actionDispatcher',
					'keydown': function(e){
						if(e.keyCode === 13) 
							this.ui.submitBtn.trigger('click');
					}
				},

				_actionDispatcher: function(e){
					e.stopPropagation();
					var $el = $(e.currentTarget);
					var doer = this.actions['do' + _.string.capitalize($el.attr('action'))];
					if(doer) doer($el, this);
					else throw new Error('DEV::Context.Login::You must have the doAction() method defined for this action...');
				},
				actions: {
					doSignin: function($el, $view){
						var login = $view.ui.form.serialize();
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
					'<button class="btn" type="button" action="signin">Sign in</button>',
				'</div>',
			'</div>',
		'</form>'
	]
)