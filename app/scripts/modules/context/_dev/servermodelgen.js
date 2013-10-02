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
				onRender: function(){
					var size = 70;
					this.$el.css({
						backgroundColor: '#eee',
						borderRadius: size + 'px',
						width: size + 'px',
						height: size + 'px',
						textAlign: 'center',
						lineHeight: size * 0.95 + 'px',						
						marginLeft: size/10 + 'px',
						cursor:'pointer',
						float: 'left'
					});
				}
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

			ModelFormField: Backbone.Marionette.ItemView.extend({
				template: '#custom-module-_dev-servermodelgen-modelform-field-tpl',
				initialize: function(options){
					this.model.set('cid', this.model.cid);
				}
			}),

			ModelForm: Backbone.Marionette.CompositeView.extend({
				template: '#custom-module-_dev-servermodelgen-modelform-tpl',
				itemViewContainer: '[model-field-list]',
				initialize: function(options){
					this.itemView = options.itemView || module.View.ModelFormField;
				},
				onShow: function(){
					this.$el.css({
						padding: '10px',
						borderTop: '5px dotted #eee'
					});
				},
				ui: {
					'modelNameInput': '[name=modelname]'
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
								var models = _.map(res, function(modelPath, modelName){
									return {name: modelName, path: modelPath};
								});
								return _.sortBy(models, function(m){
									return m.path;
								}).reverse();
							}
						}))
					}));
					//TBI: hook up the model search input.
					
				},
				//General Actions
				events: {
					'click [action]': '_doAction'
				},
				_doAction: function(e){
					e.stopPropagation();
					var $el = $(e.currentTarget);
					var doer = this.actions[$el.attr('action')];
					if(doer) {
						doer = _.bind(doer, this);
						doer($el);
					}else throw new Error('DEV::DEV Tools::You have not yet implemented this action');
				},
				actions: {
					showNewModelForm: function($action){
						if($action.hasClass('disabled'))
							return;
						this.form.show(new module.View.ModelForm({
							collection: new Backbone.Collection([{
								fieldName: '',
								type: 'UNKNOWN'
							}])
						}));
						$action.addClass('disabled'); //disable the button
					},

					addField: function($action){
						this.form.currentView.collection.add({
								fieldName: '',
								type: 'UNKNOWN'
						});
					},

					removeField: function($action){
						var target = $action.attr('cid');
						if(this.form.currentView.collection.length > 1)
							this.form.currentView.collection.remove(target);
					},

					cancelModelForm: function($action){
						this.form.close();
						this.list.getEl('span[action=showNewModelForm]').removeClass('disabled');
					},

					submitModelDef: function($action){
						var name = this.form.currentView.ui.modelNameInput.val();
						var fNames = this.form.getEl('[name=fieldname]').map(function(index, el){
							return _.string.slugify($(this).val());
						}).get();
						var fTypes = this.form.getEl('[name=fieldtype]').map(function(index, el){
							return $(this).val();
						}).get();
						var fields = _.object(fNames, fTypes);
						$.ajax({
							url: '/dev/models/',
							type: 'POST',
							notify: true,
							contentType: 'application/json',
							data: JSON.stringify({
								name: _.string.classify(name),
								fields: fields	
							}),
							success: _.bind(function(res){
								this.form.getEl('span[action=cancelModelForm]').click();
							}, this)
						})
					},

					refreshModelList: function($action){
						this.list.currentView.collection.fetch();
					}
				}
			})
		}

	});

})(Application);

Template.extend('custom-module-_dev-servermodelgen-modelitem-tpl',
[
	'{{name}}'
]
);

Template.extend('custom-module-_dev-servermodelgen-modellist-tpl',
[
	'<div class="clearfix" item-view-ct style="margin-bottom:10px;"></div>',
	'<div class="input-prepend input-append">',
		'<span class="add-on"><i class="icon-search"></i></span>',
		'<input type="text" placeholder="Find Model..." class="input input-medium">', //model search/filter box
		'<span class="btn btn-success" action="showNewModelForm"><i class="icon-plus-sign icon-white"></i> Server Model</span>', //+ Server Model button, show model form.
		'<span class="btn" action="refreshModelList"><i class="icon-refresh"></i> Refresh List</span>',
	'</div>'
]
);

Template.extend('custom-module-_dev-servermodelgen-modelform-field-tpl', //single field inputs row
[
	'<div class="controls controls-row">',
		'<input class="span3" name="fieldname" type="text" placeholder="Name of the variable/field">', //field name input
		'<input class="span2" name="fieldtype" type="text" placeholder="Type of the field">', //field type input
		'<span style="margin-left:5px;padding:5px;float:left;cursor:pointer" action="removeField" cid="{{cid}}"><i class="icon-remove-sign"></i></span>', //remove field
	'</div>'
]
);

Template.extend('custom-module-_dev-servermodelgen-modelform-tpl',
[
	'<div class="control-group">',
		'<label class="control-label" for="inputModelName">Name</label>',
		'<div class="controls">',
			'<input type="text" name="modelname" id="inputModelName" placeholder="Your Model Name Here...">', //model name input
		'</div>',
	'</div>',
		'<blockquote>', //help text on available field types [+]
			'<p class="text-warning">Available Types: String, Number, Date, Buffer, Boolean, Mixed, Objectid, Array</p>',
			'<small>e.g [String] or [Number]</small>',
			'<small>or [\'Your Model Name\'] - shortcut for [Objectid] ref:\'Your Model\'</small>',
			'<small>or ^[\'Your Model Name\'] - sub:\'Your Model\' see - /util/objectfactory.js</small>',
			'<small>MongooseJS Schema Types see - http://mongoosejs.com/docs/schematypes.html</small>',
		'</blockquote>', //help text on available field types [.]	
	'<div style="margin-bottom:5px;">Fields <span style="cursor:pointer;" action="addField"><i class="icon-plus-sign"></i></span></div>', //add field
	'<div model-field-list></div>',
	'<div><span class="btn btn-info" action="submitModelDef">Submit</span> <span class="btn" action="cancelModelForm">Cancel</span></div>' //submit model or cancel.
]
);

Template.extend('custom-module-_dev-servermodelgen-tpl',
[
	'<div region="modellist"></div>',
	'<div region="addmodel"></div>'
]);
