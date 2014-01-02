/**
 * This is the Admin context module, note that there is a requireLogin flag that can be set
 * to call on switching to the Login context if the user is not logged in...
 *
 * Factory
 * -------
 * We also provide a 'create' method for producing a UI submodule under Admin context. 
 * This way we can glue the data, datagrid, form, layout and effect together in a generalized way.
 *
 *
 * Menu
 * ----
 * We need both 1-level accordion and 2-level one so that if 1-level menu section list goes too long we can use the 2-level layout.
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

					initialize: function(){
						this.autoDetectRegions();
						if(app.config.fullScreen){
							this.resizeRegions = function(){
								//content:
								this.content.resize({h: app.fullScreenContextHeight.bodyOnly, view:false});
								//menu:
								this.menu.resize({h: app.fullScreenContextHeight.bodyOnly - this.user.$el.outerHeight(true)});
							}
							this.listenTo(app, 'view:resized', function(){
								this.resizeRegions();
							});
						}						
					},

					onShow: function(){
						this.user.show(new app.Context.Shared.User.View.Default());
						//this.menu.show(new context.Menu.View.Default());
						this.menu.show(app.Widget.create('AccordionMenu'));
						this.resizeRegions();
					}
				})
			}
		} 
	});

})(Application);

//context layout 
Template.extend(
	'application-context-admin-tpl',
	[
	    '<div class="pull-left" style="width:320px">',
	    	'<div region="user"></div>',
	    	'<div region="menu"></div>',
	    '</div>',
	    '<div region="content" class="with-border-left" style="margin-left:320px"></div>'
	]
);

//admin factory default submodule layout
Template.extend(
	'custom-tpl-context-admin-submodule-general',
	[
		'<div class="default-layout-header" ui="header">',
			'<ul class="inline" style="margin:0;">',
				'{{#each title}}',
					'<li><span>{{this}}</span> <i class="icon-chevron-right"></i></li>',
				'{{/each}}',
			'</ul>',
		'</div>',
		'<div class="default-layout-body" ui="body">',
			'<div region="detail"></div>',
            '<div region="list"></div>',
		'</div>',
		'<div class="default-layout-footer"></div>',
	]
);

//admin factory default form layout - table
Template.extend(
	'custom-tpl-context-admin-submodule-general-form-table',
	[

		'<div class="form-body" editorarea="true"></div>',
		//buttons
		'<div class="btn-bar-ct">',
			'<div class="btn-bar">',
				'<span class="btn btn-action-save" action="submit">Save</span> ',
				'<span class="btn" action="cancel">Cancel</span> ',
			'</div>',		
		'</div>',
	]
);

//admin factory default form layout - complex
Template.extend(
	'custom-tpl-context-admin-submodule-general-form-complex',
	[

		'<div class="form-body" editorarea="true"></div>',
		//buttons
		'<div class="btn-bar">',
			'<span class="btn btn-action-save" action="submit">Save</span> ',
			'<span class="btn" action="refresh">Refresh</span> ',
		'</div>',

	]
);