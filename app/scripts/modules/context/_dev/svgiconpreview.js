/**
 * UI module for previewing the svg tool processed .svg xml exports from Adobe Illustrator.
 *
 * =====
 * Usage
 * =====
 * Drag'n'Drop your svglib.json from /tools/iconprep/.
 *
 * @author Tim.Liu
 * @created 2013.10.24
 */

;(function(app){

	var context = app.Context.get('_Dev');
	var module = context.module('SvgIconPreview');

	_.extend(module, {

		label: _.string.titleize(_.string.humanize(module.moduleName)),
		icon: 'icon-eye-open',
		defaultSVGIconConfig: {
			baseSize: 32,
			showScale: 1.5,
		},

		View: {

			Default: Backbone.Marionette.Layout.extend({
				template: '#custom-module-_dev-svgiconpreview-tpl',
				className: 'tab-pane',
				regions: {
					'dndzone': '[region=dndzone]',
					'iconlist': '[region=iconlist]'
				},

				initialize: function(){
					this.listenTo(this, 'coordinate:svgIconLoaded', this.onSVGLibLoaded);
				},

				onShow: function(){
					this.fakeRegions();
					this.dndzone.show(new module.View.DnDFileZone({
						coordinator: this
					}));
				},

				onSVGLibLoaded: function(data){
					data = JSON.parse(data);
					var groups = [];
					_.each(data, function(g, gname){
						groups.push({
							name: gname,
							icons: g,
							size: module.defaultSVGIconConfig.baseSize, 
							scale: module.defaultSVGIconConfig.showScale
						})
					});
					this.iconlist.show(new module.View.SVGIconList({
						collection: new Backbone.Collection(groups)
					}));
				}

			}),

			SVGIconList: Backbone.Marionette.CollectionView.extend({
				tagName: 'ul',
				attributes: {
					style: 'list-style:none;margin:0'
				},
				initialize: function(options){
					//Note that since View is not yet created during init, we need to delay assigning itemView till inside the constructor here.
					this.itemView = module.View.SVGIconGroup;
				}
			}),

			SVGIconGroup: Backbone.Marionette.CompositeView.extend({
				template: '#custom-module-_dev-svgiconpreview-iconlist-group-tpl',
				tagName: 'li',
				itemViewContainer: '[icon-list-ct]',
				initialize: function(options){
					this.itemView = module.View.SVGIcon;
					var icons = [];
					_.each(this.model.get('icons'), function(path, name){
						icons.push({
							name: name,
							path: path
						});
					});
					this.collection = new Backbone.Collection(icons);
				}
			}),						

			SVGIcon: Backbone.Marionette.ItemView.extend({
				template: '#custom-module-_dev-svgiconpreview-iconlist-item-tpl',
				className: 'pull-left',
				onShow: function(){
					this.$el.css({
						height: module.defaultSVGIconConfig.baseSize * module.defaultSVGIconConfig.showScale,
						width: module.defaultSVGIconConfig.baseSize * module.defaultSVGIconConfig.showScale,
						padding: 5
					});
					this.enableSVGCanvas();
					this.paper.path(this.model.get('path')).attr({
						fill: '#000',
						stroke: 'none'
					}).transform('s'+module.defaultSVGIconConfig.showScale+','+module.defaultSVGIconConfig.showScale+',0,0');
				}
			}),

			DnDFileZone: Backbone.Marionette.ItemView.extend({
				template: '#custom-module-_dev-svgiconpreview-dndfilezone-tpl',
				className: '',
				attributes: {
					style: 'padding:25px;margin:10px 0;border:3px dashed #ddd;border-radius:6px;'
				},
				initialize: function(options){
					this.coordinator = options.coordinator;
				},

				events: {
					//The HTML5 API requires e.originalEvent.dataTransfer object. (e.originalEvent is the original DOM event)
					'dragover': function(e){
						e.stopPropagation();
						e.preventDefault();
						e.originalEvent.dataTransfer.dropEffect = 'copy'; //show this is a copy -> (+)icon
					},

					'drop': function(e){
						e.stopPropagation();
					    e.preventDefault();
					    var files = e.originalEvent.dataTransfer.files; //obtain the file list object.
					    _.each(files, function(f){
					    	if(!f.type.match('application/json')) return;
					    	//console.log(f); - f is the file description object.
					    	var reader = new FileReader();
					    	var that = this;
					    	reader.onload = function(e){
					    		that.coordinator.trigger('coordinate:svgIconLoaded', e.target.result);
					    	};
					    	reader.readAsBinaryString(f);
					    }, this);
					}
				}
			}),

		}
	});	

})(Application);


Template.extend('custom-module-_dev-svgiconpreview-iconlist-item-tpl',
[
	' '
]);

Template.extend('custom-module-_dev-svgiconpreview-iconlist-group-tpl',
[
	'<p class="alert" style="margin:0"><strong>{{name}}</strong> <span>{{size}}x{{size}}</span> <span class="badge">x{{scale}}</span> </p>',
	'<div class="row-fluid" icon-list-ct style="margin-bottom:5px;"></div>'
]);

Template.extend('custom-module-_dev-svgiconpreview-dndfilezone-tpl',
[
	'<p class="text-center" style="margin:0;font-size:13px;color:#bbb">Drop your tools/iconprep/svglib.json here</p>'
]);

Template.extend('custom-module-_dev-svgiconpreview-tpl',
[
	'<div region="dndzone"></div>',
	'<div region="iconlist"></div>'
]);