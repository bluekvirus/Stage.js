/**
 * This is the shared UI module: Banner under All contexts. It is the header of a web application.
 *
 * ==========
 * Dependency
 * ==========
 * app.Context.Login.Account.user - a model that stores the logged in user info returned from server.
 * 
 * @author Tim.Liu
 * @created 2013.09.24
 */

;(function(app){

	var context = app.Context.Shared;
	var module = context.module('Banner');

	_.extend(module, {

		View: {
			Default: Backbone.Marionette.ItemView.extend({
				template: '#custom-module-shared-banner-tpl',
				className: 'navbar-inner',

				initialize: function(){
					this.model = new Backbone.Model({
						projectName: 'Your Project Name Here',
						logo: 'Your project logo path',
					});
					this.listenTo(this.model, 'change', this.render);
					this.listenTo(app, 'app:user-changed', this.onShow);
					this.enableActionTags('Shared.Banner');
				},

				onShow: function(){
					this.model.set(app.user);
				},

				actions: {
					logout: function($action){
						var that = this;
						$.get('/logout', function() {
							app.user = {name: undefined};
							that.onShow();//clear user display on banner.
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
	'custom-module-shared-banner-tpl',
	[
		'<div class="container">',
			'<!-- .btn-navbar is used as the toggle for collapsed navbar content -->',
			'<a class="btn btn-navbar" data-toggle="collapse" data-target=".nav-collapse">',
				'<span class="icon-bar"></span>',
				'<span class="icon-bar"></span>',
				'<span class="icon-bar"></span>',
			'</a>',

			'<!-- Be sure to leave the brand out there if you want it shown -->',
			'<a class="brand" href="#">{{projectName}}</a>',

			'<!-- Everything you want hidden at 940px or less, place within here -->',
			'<div class="nav-collapse collapse">',
				'<!-- .nav, .navbar-search, .navbar-form, etc -->',
				'<ul class="nav pull-right">',
					'<li><a href="#"><i class="icon-question-sign"></i> Help</a></li>',
					'<li class="divider-verticall"></li>',
					'{{#if name}}', //if only we have a user logged in.
						'<li class="dropdown">',
                        	'<a data-toggle="dropdown" class="dropdown-toggle" href="#"><i class="icon-user"></i> {{name}} <b class="caret"></b></a>',
                        	'<ul class="dropdown-menu">',
								'<li><a href="#"><i class="icon-eye-open"></i> Change Preference</a></li>',
								'<li><a href="#"><i class="icon-edit"></i> Edit Profile</a></li>',
								'<li><a href="#"><i class="icon-comment"></i> Open Ticket</a></li>',
								'<li class="divider"></li>',
								'<li><a href="#" action="logout"><i class="icon-share-alt"></i> Logout</a></li>',
	                        '</ul>',
                      	'</li>',
                    '{{/if}}',
				'</ul>',
			'</div>',
		'</div>'
	]
);