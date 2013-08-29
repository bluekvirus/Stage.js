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
		 		this.meta = options.meta;
		 		this.mapUrl = options.mapUrl;
		 		this.map = options.map;
		 		this.cells = options.cells;
		 		this.dataUrl = options.dataUrl;
		 		this.data = options.data;

			 	this.model = new Backbone.Model(this.meta);

			 	this.fetchMap();

		 		if (this.dataUrl) {
		 			this.fetchData();
		 		} else {
		 			this.setData(this.data);
		 		}
			},

			fetchMap: function() {
				//console.log('PropertyGrid fetchMap');
				if (this.mapUrl) {
			 		$.ajax({
						url: this.mapUrl,
						async: false,
						success: _.bind(function(res) {
							this.map = res;
						}, this),
						error: function(error) {
							console.log('PropertyGrid fetchMap error', error);
						}
					});
			 	}
			},

			fetchData: function() {
				//console.log('PropertyGrid fetchData');
				if (this.dataUrl) {
					$.getJSON(this.dataUrl, _.bind(function(data, textStatus, jqXHR) {
						this.setData(data);
					}, this));
				} else {
					console.log('PropertyGrid fetchData error: no [dataUrl] specified');
				}
			},

			setData: function(data) {
				this.data = data;

				var propList = [];
			 	_.each(this.data, function(val, key){
			 		if (this.cells && this.cells[key]) {
			 			var cellConfig = this.cells[key];
			 			var widgetName = cellConfig[0];
			 			var widgetOptions = cellConfig[1];
			 			_.extend(widgetOptions, {value: val});
			 			var widget = Application.Widget.create(widgetName, widgetOptions);
			 			val = widget.render().$el.html();
			 		}

			 		propList.push({
			 			key: key,
			 			label: (this.map && this.map[key]) || key,
			 			val: val
			 		});

			 	}, this);

				if (typeof(this.collection) === 'undefined') {
					this.collection = new Backbone.Collection();
				}
				this.collection.reset(propList);
			},

			refresh: function(data) {
				//console.log('PropertyGrid refresh', new Date());
				if (typeof(data) !== 'undefined') {
					this.setData(data);
				} else {
					this.fetchData();
				}
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
