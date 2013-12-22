/**
 * This is the Shared.User module for displaying logged-in user related info and operations.
 *
 * @author Tim.Liu
 * @create 2013.12.22
 */

;(function(app){

	var context = app.Context.Shared;
	var module = context.module('User');

	_.extend(module, {

		View: {
			Default: Backbone.Marionette.Layout.extend({
				template: '#custom-module-shared-user-tpl',
				className: 'user-bar',

				initialize: function(options){
					this.enableActionTags('Shared.User');
					this.model = new Backbone.Model();
					this.listenTo(this.model, 'change', this.render);
					this.listenTo(app, 'app:user-changed', this.onShow);
				},

				onShow: function(){
					this.model.set(app.user);
				},

				actions: {
					logout: function($action, e){
						e.preventDefault();
						var that = this;
						$.get('/logout', function() {
							app.user = {name: undefined, space: undefined};
							delete app.user; //clean up user info in app.
							app.trigger('app:switch-context', 'Login', '#navigate/Welcome');
						});
					}
				}
			})
		}

	});

})(Application);

Template.extend(
	'custom-module-shared-user-tpl',
	[
		'<span>Logged in as</span>:',
		'<div class="dropdown pull-right">',
	    	'<a data-toggle="dropdown" class="dropdown-toggle" href="#"><i class="icon-user"></i> {{name}} <b class="caret"></b></a>',
	    	'<ul class="dropdown-menu">',
				'{{#if space}}',
					'{{#isnt space "User"}}',
						'<li action="switchContext" context="Admin"><a href="#"><i class="icon-wrench"></i> System</a></li>',
						'<li class="divider"></li>',
					'{{/isnt}}',
				'{{/if}}',
				'<li><a href="#"><i class="icon-eye-open"></i> Change Preference</a></li>',
				'<li><a href="#"><i class="icon-edit"></i> Edit Profile</a></li>',
				'<li><a href="#"><i class="icon-comment"></i> Open Ticket</a></li>',
				'<li class="divider"></li>',
				'<li><a href="#" action="logout">{{#is name "guest"}}<i class="icon-arrow-right"></i> Login{{else}}<i class="icon-arrow-left"></i> Logout{{/is}}</a></li>',,
	        '</ul>',
	  	'</div>',
	]
);