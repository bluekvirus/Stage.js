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
		  grid: "div[region=content]",			  
		},
		initialize:function(options){
			this.url = (options && options.url) || './data/status.test2.json';
		},			
		onShow:function(){
			var that=this;
			$.get(this.url,function(data){
			 	that.grid.show(app.Widget.create('PropertyGrid',{data:data}));
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
		'</div>'
	]
);