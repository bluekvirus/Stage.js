/**
 *
 * Property Grid Widget to display json format status.
 *
 * @author Xin Dong (xindong@fortinet.com)
 * @update 2013.03.22
 * 
 */

Application.Widget.register('PropertyGrid', function(){

	var PropertyItemView = Backbone.Marionette.ItemView.extend({
			tagName: "tr",
			template: "#property-item-tpl"
	});

	var PropertyGrid = Backbone.Marionette.CompositeView.extend({	
			template: "#basic-propertygrid-view-wrap-tpl",	
			itemView: PropertyItemView,
			// specify a jQuery selector to put the itemView instances into
			itemViewContainer: "tbody",  		
			initialize:function(options){
		 		this.collection = new Backbone.Collection();
			 	_.each(options.data,function(val,key){
			 		this.collection.add({key:key,val:val});
			 	}, this);
			 	this.model = new Backbone.Model(options.meta);				
			}		
	});

	return PropertyGrid;

});
