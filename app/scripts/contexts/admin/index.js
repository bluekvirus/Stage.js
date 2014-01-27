/**
 * This is the Admin context module, note that there is a requireLogin flag that can be set
 * to call on switching to the Login context if the user is not logged in...
 *
 * Factory
 * -------
 * We need to provide a 'create' method for producing a UI submodule under Admin context. 
 * This way we can glue the data, datagrid, form, layout and effect together in a generalized way.
 *
 *
 * Menu
 * ----
 * We need both 1-level accordion and 2-level one so that if 1-level menu section list goes too long we can use the 2-level layout.
 * Pre-processing:
 * 	by triggering the 'context:admin:load-menu' event, we can provide it with a menu data pre-processing cb that alters the menu listing for the user.
 *
 * @author Tim.Liu
 * @created 2013.09.28
 */
;(function(app){

	app.Context.create('Admin', function(context){

		return {
			requireLogin: true,
			defaultModule: 'Dashboard',

			View: {
				Default: Backbone.Marionette.Layout.extend({
					template: '#application-context-admin-tpl',

					initialize: function(){
						this.autoDetectRegions();
						//resize
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
						//menu loading event handle
						this.listenTo(this, 'context:admin:load-menu', function(url, preProcess){
							if(_.isFunction(url)){
								preProcess = url;
								url = '/static/admin/menu2.json';
							}
							var _this = this;
							$.ajax({
								url: url
							}).done(function(data){
								if(preProcess) data = preProcess(data);
								_this.menu.schedule(app.Widget.create('AccordionMenu', {
									structure : data
								}), true);
								_this.resizeRegions();
								if(_this._preMenuInitNavigationCache) {
									_this.navigateToModule();
								}
								_this.listenTo(_this.views.menu, 'item:selected', function(item){
									context.trigger('context:navigate-to-module', item.model.get('name'), true);
								});							
							});							
						});
						//context sub-module navigation event handle
						this.listenTo(context, 'context:navigate-to-module', function(name, userClicked){
							name = name || context.defaultModule; //put default module here for fallback display. (must have entry in menu)
							if(!this.views || !this.views.menu) {
								this._preMenuInitNavigationCache = name; //save this navigation event.
							}else
								this.navigateToModule(name, userClicked);
							
						});
					},

					onShow: function(){
						this.user.show(new app.Context.Shared.User.View.Default());
						this.trigger('context:admin:load-menu', this.prepMenu); //add menu items preprocessing here.
					},

					prepMenu: function(data){
						//merge admin.x sub module.defaultMenuPath into the menu data.
						_.each(context.submodules, function(m){
							if(m.defaultMenuPath) {
								var parts = m.defaultMenuPath.split('->');
								while(parts.length < 3){
									parts.unshift('Unknown');
								}
								var visitor = _.isArray(data)?data:data.sub;
								_.each(parts, function(part, index){
									var found = _.findWhere(visitor, {label: part});
									if(found) {
										if(!found.sub) found.sub = [];
										visitor = found.sub;
									}
									else {
										if(index !== parts.length - 1){
											var node = {
												label: part,
												sub: []
											};
											visitor.push(node);
											visitor = node.sub;
										}else {
											visitor.push({
												label: part,
												name: m.name,
											})
										}
									}
								});
							}
							//console.log(m.name, m.defaultMenuPath);
						});

						return data;
					},

					navigateToModule: function(moduleName, userClicked) {
						if(!moduleName) {
							moduleName = this._preMenuInitNavigationCache;
							delete this._preMenuInitNavigationCache;
						}
						if(!moduleName) return;
						if(!context[moduleName]) throw new Error('DEV::Context.Admin::No such module named ' + moduleName);
						if(!context.currentModule || (context.currentModule.name !== moduleName)){
							context.currentModule = new (context[moduleName].View.Default)();
							this.content.show(context.currentModule);
							if(!userClicked) this.views.menu.trigger('navigate:to:item', moduleName);
							else Application.router.navigate('#navigate/Admin/' + moduleName); //change the location.hash only without triggering navigation
						}

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
	    '<div class="pull-left" style="width:260px">',
	    	'<div region="user"></div>',
	    	'<div region="menu"></div>',
	    '</div>',
	    '<div region="content" class="with-border-left" style="margin-left:260px"></div>'
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