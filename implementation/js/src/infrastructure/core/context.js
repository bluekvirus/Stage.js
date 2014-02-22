/**
 * This is the Application context registry. 
 * A context defines the scope of a group of modules that represent a phase/mode/page of the Application. 
 * (e.g. Login, Admin, AppUser, AppPublic(can be the same thing as Login) ...etc.)
 *
 * 
 * Design
 * ------
 * A context is an Application sub-module that has a name and a layout template defined.
 * Since it is a module itself it also serves as a registry for the sub-modules of that context of the Application.
 * Context switch can be triggered by 
 * 	a. use app:navigate (contextName, moduleName) event;
 *  b. click <a href="#/navigate/[contextName][/moduleName]"/> tag;
 *
 * 
 * Usage
 * -----
 * ###How to define one? 
 * app.Context.create({
 * 		name: 'name of the context',
 * 		layout/template: 'html template of the view as in Marionette.Layout',
 * 							- region=[] attribute --- mark a tag to be a region container
 * 							- view=[] attribute --- mark this region to show an new instance of specified view definition
 * 	    requireLogin: 'true' | 'false' (default),
 * 	    onNavigateTo: function(module or path) - upon getting the context:navigate-to event,
 * 	    onShow: function() - specify this to override the default onShow() behavior
 * });
 *
 * ###How to populate the context with regional views?
 * context.create({
 * 		name: ,
 * 		layout/template: '',
 * 		[type]: Marionette View type [ItemView(default), Layout, CollectionView, CompositeView]
 * 		...: other Marionette View type .extend options.
 * }) - create a context's regional sub-module.
 *
 * 
 * @author Tim.Liu
 * @created 2013.09.21
 * @updated 2014.02.21 (1.0.0-rc1)
 */

;(function(app, _){

	var definition = app.module('Context');
	_.extend(definition, {

		create: function(config){
			config.name = config.name || '_default';
			var ctx = app.module('Context.' + config.name);
			_.extend(ctx, {
				_config: config,

				//big layout
				name: config.name,
				Layout: Backbone.Marionette.Layout.extend({
					template: app.Util.Tpl.build(config.layout || config.template).id,
					initialize: function(){
						this.autoDetectRegions();
					},
					onShow: config.onShow || function(){
						this.fakeRegions();
						_.each(this.regions, function(selector, r){
							var RegionalViewDef = ctx.Views[this[r].$el.attr('view')];
							if(RegionalViewDef) this[r].show(new RegionalViewDef());
						}, this);
					}
				}),

				//regional views
				Views: {},
				create: function(options){ //provide a way of registering sub regional views
					_.extend(options, {
						template: app.Util.Tpl.build(options.layout || options.template),
						context: ctx
					});
					delete options.layout;
					var View = ctx.Views[options.name] = Marionette[options.type || 'ItemView'].extend(options);

					return View;
				}
			});

			if(config.onNavigateTo)
				ctx.listenTo('context:navigate-to', config.onNavigateTo);
			return ctx;
		}

	});

})(Application, _);


/**
 * ====================
 * Pre-Defined Contexts
 * ====================
 */
Application.create('Context', {name: 'Shared'});

