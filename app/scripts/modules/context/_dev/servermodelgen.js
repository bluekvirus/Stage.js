/**
 * UI module for server model tool.
 *
 * @author Tim.Liu
 * @created 2013.10.01
 */

;(function(app){

	var context = app.Context.get('_Dev');
	var module = context.module('ServerModelGen');

	_.extend(module, {

		label: _.string.titleize(_.string.humanize(module.moduleName)),
		icon: 'icon-plus-sign',

		View: {
			ModelListItem: Backbone.Marionette.ItemView.extend({
				template: '#custom-module-_dev-servermodelgen-modelitem-tpl',
				tagName: 'span',
				className: 'label'
			}),
			ModelList: Backbone.Marionette.CompositeView.extend({
				template: '#custom-module-_dev-servermodelgen-modellist-tpl',
				itemViewContainer: '[item-view-ct]',
				initialize: function(options){
					this.itemView = options.itemView || module.View.ModelListItem;
				},
				onShow:function(){
					this.collection.fetch();
				}
			}),

			Default: Backbone.Marionette.Layout.extend({
				template: '#custom-module-_dev-servermodelgen-tpl',
				className: 'tab-pane',
				regions: {
					'list': '[region=modellist]',
					'form': '[region=addmodel]'
				},
				onShow: function(){
					this.list.show(new module.View.ModelList({
						collection: new (Backbone.Collection.extend({
							url: '/dev/models/',
							parse: function(res){
								return _.toArray(res);
							}
						}))
					}))
				}
			})
		}

	});

})(Application);

Template.extend('custom-module-_dev-servermodelgen-modelitem-tpl',
[
	'{{this.meta.name}}'
]
);

Template.extend('custom-module-_dev-servermodelgen-modellist-tpl',
[
	'<div><span>search</span></div>',
	'<div class="row-fluid">',
		'<div class="span2">+ New Model</div>',
		'<div class="span10" item-view-ct></div>',
	'</div>'
]
);

Template.extend('custom-module-_dev-servermodelgen-tpl',
[
	'<div region="modellist"></div>',
	'<div region="addmodel"></div>'
]);
