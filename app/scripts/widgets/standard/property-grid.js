/**
 *
 * Property Grid Widget to display json format status.
 *
 * @author Xin Dong (xindong@fortinet.com), Tim Liu (zhiyuanliu@fortinet.com)
 * @update 2013.04.02
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
			 		this.collection.add({key: options.map[key] || key,val:val});
			 	}, this);
			 	this.model = new Backbone.Model(options.meta);				
			}		
	});

	return PropertyGrid;

});

/**
 *
 * Basic Property Grid Outline.
 * 
 */

Template.extend(	
	'property-item-tpl',
	[
		'<td>{{key}}</td>',
		'<td>{{val}}</td>'
	]
);

Template.extend(	
	'basic-propertygrid-view-wrap-tpl',
	[
		'<div region="title" class="alert alert-info">{{title}}</div>',
		'<table class="table">',
		'<tbody></tbody>',
		'</table>'
	]
);