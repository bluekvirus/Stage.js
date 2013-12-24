/**
 * This is the shared UI module: Banner under All contexts. It is the header of a web application.
 * 
 * @author Tim.Liu
 * @created 2013.09.24
 */

;(function(app){

	var context = app.Context.Shared;
	var module = context.module('Banner');

	_.extend(module, {

		View: {
			Default: Backbone.Marionette.Layout.extend({
				template: '#custom-module-shared-banner-tpl',
				className: 'banner',

				initialize: function(){
					this.model = new Backbone.Model({
						projectName: 'PRODUCT NAME', //your project/product/company name
						logo: '', //your project logo icon class
					});
					this.listenTo(app, 'app:context-switched', function(ctx){
						console.log('switched to context:', ctx, '- see context.shared.banner.js for menu/navi highlighting'); //ctx is the name of the context.
					});
					this.enableActionTags('Shared.Banner');
					this.autoDetectRegions();
				},

				onShow: function(){
					this.messagecount.show(new context.Notify.View.MessageCount());
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
			'<a class="brand" href="#"><i class="icon- {{logo}}"></i>{{projectName}}</a>',

			'<!-- Everything you want hidden at 940px or less, place within here -->',
			'<div class="nav-collapse collapse">',
				'<!-- .nav, .navbar-search, .navbar-form, etc -->',
				'<ul class="nav pull-right">',
					'<li region="messagecount"></li>',	
					'<li><a href="#"><i class="icon-question-sign"></i> Help</a></li>',				
				'</ul>',
			'</div>',
		'</div>'
	]
);