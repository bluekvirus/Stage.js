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

		toolURL: '/dev/models/',

		View: {

			//------------Model List--------------
			ModelListItemDetail: Backbone.Marionette.ItemView.extend({
				template: '#custom-module-_dev-servermodelgen-modelitem-detail-tpl',

			}),

			ModelListItem: Backbone.Marionette.ItemView.extend({
				template: '#custom-module-_dev-servermodelgen-modelitem-tpl',
				className: 'tool-servergen-model-list-item',
				ui: {
					model: 'span[model]' //for locating the model tpl tags. (used for tooltip)
				},
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
						float:'left',
					}).tooltip({
						title: _.bind(function(){
							return this.ui.model.attr('path');
						}, this)
					});
				},
				events: {
					'click': function(e){
						if(e.target !== e.currentTarget) { //let the event pass to View.Default's action event handler;
							return;
						}
						e.stopPropagation();
						this.ui.model.click(); //pass the click event to model tpl span[action]
					}
				}
			}),

			ModelList: Backbone.Marionette.CompositeView.extend({
				template: '#custom-module-_dev-servermodelgen-modellist-tpl',
				itemViewContainer: '[item-view-ct]',
				initialize: function(options){
					this.itemView = options.itemView || module.View.ModelListItem;
				},
				onShow:function(){
					this.collection.fetch({notify:false});
				}
			}),
			//-------------Form------------
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

			//----------Default View [as action coordinator]---------
			Default: Backbone.Marionette.Layout.extend({
				template: '#custom-module-_dev-servermodelgen-tpl',
				tab: {
					title: _.string.titleize(_.string.humanize(module.moduleName)),
					icon: 'icon-plus-sign',					
				},

				regions: {
					'list': '[region=modellist]',
					'form': '[region=addmodel]'
				},
				initialize: function(options){
					this.enableUILocks(); //see - infrastructure/base-lib-fix.js
					this.enableActionTags('Context._DEV.ServerModelGen'); //see - infrastructure/base-lib-fix.js
				},
				onShow: function(){
					this.list.show(new module.View.ModelList({
						collection: new (Backbone.Collection.extend({
							url: module.toolURL,
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
					//hook up the model search input.
					this.list.currentView.$el.sieve({
						itemSelector: '.tool-servergen-model-list-item',
						textSelector: 'span[model]',
						searchInput: this.list.getEl('input.tool-servergen-model-list-item-search')
					});
					
				},
				actions: {
					showNewModelForm: function($action){
						if(!this.lockUI('list') || $action.hasClass('disabled')) return; //lock the list region

						this.clearModelSelection();//clear model listing selection highlight first;
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
						if(!this.unlockUI('list')) return; //unlock the list region

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
							url: module.toolURL,
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
					},

					showModelDefDetails: function($action){
						if(this.isUILocked('list')) return;

						$.ajax({
							url: module.toolURL + $action.attr('model'),
							success: _.bind(function(res){
								/*WARNING::Hardcoded Section::According to server model definition structure*/
								//pre-process the model description
								var modeldetails = _.extend({fields: {}}, _.pick(res, 'meta', 'restriction'));
								_.each(res.Schema.paths, function(description, fieldName){
									var type = description.instance || (description.caster && description.caster.instance);
									if(description.caster){
										//array
										if(res.meta.ref && res.meta.ref[fieldName]){
											type = "ref: '" + res.meta.ref[fieldName].model + "'";
										}else if(res.meta.sub && res.meta.sub[fieldName])
											type = "sub: '" + res.meta.sub[fieldName].model + "'";
										type = '[ ' + type + ' ] - collection';
									}else {
										type = type || 'Boolean/Date/Mixed'; //undetectable schema types...
									}
									modeldetails.fields[fieldName] = {
										name: fieldName,
										type: type
									};									
								});
								//add in the file fields, which we don't store in database but on the server file system.
								_.each(res.restriction.file, function(fileRestr, fieldName){
									modeldetails.fields[fieldName] = {
										name: fieldName,
										type: 'File - stored in OS file system'
									}
								});
								delete modeldetails.fields.__v;
								//console.log(modeldetails);
								/*===========================================================================*/

								//show it with proper view tpl
								this.form.show(new module.View.ModelListItemDetail({
									model: new Backbone.Model(modeldetails)
								}));
								this.clearModelSelection();
								$action.parent().addClass('btn-info');
							},this)
						})
					}
				},

				clearModelSelection: function(){
					this.list.getEl('.tool-servergen-model-list-item').removeClass('btn-info');
				}

			})
		}

	});

})(Application);

Template.extend('custom-module-_dev-servermodelgen-modelitem-tpl',
[
	'<span action="showModelDefDetails" model="{{name}}" path="{{path}}">{{name}}<span>'
]
);

Template.extend('custom-module-_dev-servermodelgen-modellist-tpl',
[
	'<div class="clearfix" item-view-ct style="margin-bottom:10px;"></div>',
	'<div class="input-prepend input-append">',
		'<span class="add-on"><i class="icon-search"></i></span>',
		'<input type="text" placeholder="Find Model..." class="input input-medium tool-servergen-model-list-item-search">', //model search/filter box
		'<span class="btn btn-success" action="showNewModelForm"><i class="icon-plus-sign icon-white"></i> Server Model</span>', //+ Server Model button, show model form.
		'<span class="btn" action="refreshModelList"><i class="icon-refresh"></i> Refresh List</span>',
	'</div>'
]
);

Template.extend('custom-module-_dev-servermodelgen-modelitem-detail-tpl',
[
	'<div style="padding: 10px; border: 5px dashed #eee;">Model Definition Details for <i class="icon-hdd"></i> <strong>{{meta.name}}</strong></div>',
	'<table class="table table-condensed">',
		'<thead><tr><th>Field</th><th>Type</th></tr></thead>',
		'{{#each fields}}',
			'<tr>',
				'<td>{{name}}</td>',
				'<td>{{type}}</td>',
			'</tr>',
		'{{/each}}',
	'</table>'
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
			'<p class="text-warning">Available Types: String, Number, Date, Buffer, Boolean, Mixed, Objectid, Array and \'__File\'</p>',
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
