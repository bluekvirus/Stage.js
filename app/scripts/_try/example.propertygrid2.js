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
	var context= app.Context.Admin;
	var module = context.module('StatusPanel');

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
			this.blocks = (options && options.blocks) || [{name:'gridA', title:'abc', path:'./static/status/status.test.json'},
													  {name:'gridB', title:'efg', path:'./static/status/status.test2.json'}];
			//load the label
			this._loadLabelMap(options);

		},			
		onShow:function(){
			var that=this;
			_.each(this.blocks, function(block, index){
				$.get(block.path,function(data){
				 	that[block.name].show(app.Widget.create('PropertyGrid',{data:data, map:that.keyLabelMap ,meta:{title:block.title}}));
				});
			});
					
		},

		_loadLabelMap: function(options){
			var that = this;
			$.ajax({
				url: (options && options.labelInfo) || '/static/status/status.keylabel.map.json',
				async: false,
				success: function(map){
					that.keyLabelMap = map;
				},
				error: function(err){
					console.log(err);
					that.keyLabelMap = this.keyLabelMap || {};
				}
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

	module.defaultAdminPath = "System->Dashboard->Status Example";

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
		'<div class="custom-tpl-layout-wrapper" region="content">',
			'<div region="gridA"></div>',
			'<div region="gridB"></div>',
		'</div>'
	]
);