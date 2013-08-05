/**
 *
 * Property Grid Widget to display json format status.
 *
 * Added custom options:
 * cells: new ItemView({...}) to allow customized cells for displaying certain properties.
 *
 * @author Xin Dong (xindong@fortinet.com), Yan Zhu (yanzhu@fortinet.com), Tim Liu (zhiyuanliu@fortinet.com)
 * @update 2013.08.05
 * 
 */

Application.Widget.register('PropertyGrid', function(){

	var PropertyItemView = Backbone.Marionette.ItemView.extend({
			tagName: "tr",
			template: "#property-item-tpl"
	});

	var PropertyGrid = Backbone.Marionette.CompositeView.extend({	
			template: "#widget-propertygrid-view-wrap-tpl",
			className: 'property-grid',
			itemView: PropertyItemView,
			// specify a jQuery selector to put the itemView instances into
			itemViewContainer: "tbody",
			initialize:function(options){
		 		this.collection = new Backbone.Collection();
		 		var that = this;
			 	_.each(options.data,function(val,key){
			 		if (options.cells && options.cells[key]) {
			 			val = options.cells[key].render().$el.html();
			 		}
			 		this.collection.add({
			 			key: key,
			 			label: (options.map && options.map[key]) || key,
			 			val: val
			 		});
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
		'<td class="cell key-cell field-{{key}}">{{{label}}}</td>',
		'<td class="cell value-cell field-{{key}}">{{{val}}}</td>'
	]
);

Template.extend(	
	'widget-propertygrid-view-wrap-tpl',
	[
		'<div region="title" class="alert alert-info header">',
			'<i class="icon-tasks header-icon"></i> ',
			'<span class="header-title">{{{title}}}</span>',
		'</div>',
		'<table class="table">',
			'<tbody></tbody>',
		'</table>'
	]
);