/**
 * =====================
 * Module Definition
 * =====================
 *
 * @author Tim.Liu
 * @update 
 */

(function(app){

	/**
	 * ================================
	 * [*REQUIRED*] 
	 * 
	 * Module Name 
	 * ================================
	 */
	var module = app.module('StatusPanel');

	/**
	 * ================================
	 * Module Data Sources
	 * [Model/Collection]
	 * ================================
	 */
	
	/**
	 * ================================
	 * Module Views(+interactions)
	 * [Widgets]
	 * ================================
	 */

	/**
	 * ================================
	 * [*REQUIRED*]
	 *  
	 * Module Layout
	 * Opt.[+interactions] 
	 * ================================
	 */	
	var PropertyLayout = Backbone.Marionette.Layout.extend({
		template: "#custom-tpl-status-panel-layout",		    
		regions: {
		  gridA: "div[region=gridA]",
		  gridB: "div[region=gridB]",			  
		},
		initialize:function(options){
			this.urls = (options && options.urls) || [{name:'gridA', title:'abc', path:'./data/status.test.json'},
													  {name:'gridB', title:'efg', path:'./data/status.test2.json'}];
		},			
		onShow:function(){
			var that=this;
			_.each(this.urls, function(url, index){
				$.get(url.path,function(data){
				 	that[url.name].show(app.Widget.create('PropertyGrid',{data:data, meta:{title:url.title}}));
				});
			});
				
			
		}
	});

	/**
	 * ================================
	 * [*REQUIRED*] 
	 * 
	 * Module's default menu view
	 * (Points to a layout view above)
	 * ================================
	 */
	module.View = {Default:PropertyLayout};

})(Application);



/**
 * ==========================================
 * Module Specific Tpl
 * [Generic tpls go to templates/generic/...]
 * ==========================================
 */

Template.extend(
	'custom-tpl-status-panel-layout',
	[
		'<div region="content">',
			'<div region="gridA"></div>',
			'<div region="gridB"></div>',
		'</div>'
	]
);