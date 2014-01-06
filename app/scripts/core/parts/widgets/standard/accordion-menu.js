/**
 * This is the accordion menu widget (both 1-lvl and 2-lvl) that is common in a web app.
 *
 * Options
 * -------
 * structure: [
 * 	{
 * 		name: ...,
 * 	 	label: ...,
 * 	 	icon: ..., (group icon)
 * 	 	sub: [{
 * 	 		name: ...,
 * 	 		label: ...,
 * 	 		icon: ..., (section icon)
 * 	 		sub: [{
 * 	 			name, label, icon (item icon)
 * 	 		}]
 * 	 	}, ..., ]
 * 	}, ..., 
 * ]
 *
 *
 * Events
 * ------
 * listens to -> navigate:to:item e(name)
 * triggers -> item:selected e(name, item model)
 * 
 *
 * @author Tim.Liu
 * @created 2014.01.01
 */

Application.Widget.register('AccordionMenu', function(){

	var View = Backbone.Marionette.Layout.extend({
		template: '#widget-accordion-menu-tpl',
		className: 'widget-accordion-menu with-border-top',
		initialize: function(options){
			options = _.extend({
				//-----------------TDD-------------------
				structure: [
					{name: 'aG', sub: [
						{name: 'aS-1', sub: [{name: 'aS-1.item1'}, {name: 'aS-1.item2', label: 'Expand-able', sub:[{name:'aS-1.item2.itemA'}, {name:'aS-1.item2.itemB'}, {name:'aS-1.item2.itemC'}]}, {name: 'aS-1.item3'}]},
						{name: 'aS-2', sub: [{name: 'aS-2.item1'}, {name: 'aS-2.item2'}, {name: 'aS-2.item3'}]},
						{name: 'aS-3', sub: [{name: 'aS-3.item1'}, {name: 'aS-3.item2'}]}
					]},
					{name: 'bG', sub: [
						{name: 'bS-1', sub: [{name: 'bS-1.item1', label: 'Expand-able', sub:[{name:'bS-1.item1.itemA'}, {name:'bS-1.item1.itemB'}, {name:'bS-1.item1.itemC'}]}, {name: 'bS-1.item2'}]},
						{name: 'bS-2', sub: [{name: 'bS-2.item1'}, {name: 'bS-2.item2'}]},
						{name: 'bS-3', sub: [{name: 'bS-3.item1'}, {name: 'bS-3.item2'}]}
					]},
					{name: 'cG', sub: [
						{name: 'cS-1', sub: [{name: 'cS-1.item1', label: 'Expand-able', sub:[{name:'cS-1.item1.itemA'}, {name:'cS-1.item1.itemB'}, {name:'cS-1.item1.itemC'}]}]},
						{name: 'cS-2', sub: [{name: 'cS-2.item1'}]},
						{name: 'cS-3', sub: [{name: 'cS-3.item1'}, {name: 'cS-3.item2', label: 'Expand-able', sub:[{name:'cS-3.item2.itemA'}, {name:'cS-3.item2.itemB'}, {name:'cS-3.item2.itemC'}]}]}
					]}
				]
				//---------------------------------------
			}, options);
			this._options = options;
			this.autoDetectRegions();
			this.groups.schedule(new Groups({
				collection: new Backbone.Collection(this._options.structure),
				delegate: this
			}));
			this.listenTo(this.views.groups, 'group:clicked', function(group){
				group.$el.siblings().removeClass('active');
				group.$el.addClass('active');
				//show this group's section accordions
				this.sections.schedule(new Sections({
					collection: new Backbone.Collection(group.model.get('sub')),
					group: group
				}), true);
			});
			this.listenToOnce(this.views.groups, 'groups:show', function(){
				this.sections.$el.addClass('make-room-for-groups');
				this.groups.$el.show('slide');
			});
			this.listenTo(this, 'navigate:to:item', function(name){
				//Todo
			});
		}
	});

	//lvl-1 nodes
	var Groups = Backbone.Marionette.CollectionView.extend({
		className: 'groups',
		initialize: function(options){
			this._options = options;
		},
		itemView: Backbone.Marionette.ItemView.extend({
			template: '#widget-accordion-menu-group-tpl',
			className: 'group',
			initialize: function(options){
				this._options = options;
				if(!this.model.get('label')){
					this.model.set('label', this.model.get('name'));
				}
			},
			events: {
				click: function(){
					this._options.parentCt.trigger('group:clicked', this);
				}
			}
		}),
		itemViewOptions: function(model, index){
			return {
				parentCt: this //let the individual group view to have a ref to the parent collection view.
			}
		},
		onShow: function(){
			if(this.collection.size() > 1) this.trigger('groups:show');
		}
	});

	//lvl-2 nodes (per level 1 node)
	var Sections = Backbone.Marionette.CollectionView.extend({
		className: 'sections',
		initialize: function(options){
			this._options = options;
			var borderFix = Number(_.string.trim(this._options.group.$el.css('borderBottomWidth'), 'px')); //tbh, this must also be the section header's border-bottom-width, see accordion-menu.less
			this._itemHeight = (this._options.group.$el.innerHeight() - borderFix)/2; //dynamically make 2 sections together to be as high as a group view block.
			this.listenTo(this, 'section:clicked', function(section){
				section.$el.siblings().removeClass('active');
				section.$el.addClass('active');
			});
		},
		itemViewOptions: function(){
			return {
				parentCt: this, //section.parentCt._options.group is the group the section belongs to
			};
		},
		itemView: Backbone.Marionette.Layout.extend({
			template: '#widget-accordion-menu-section-tpl',
			className: 'section',
			initialize: function(options){
				this._options = options;
				if(!this.model.get('label')){
					this.model.set('label', this.model.get('name'));
				}				
				this.autoDetectRegions();
				this.autoDetectUIs();
				this.tree.schedule(new Tree({
					collection: new Backbone.Collection(this.model.get('sub')),
					section: this
				})); //show the section items as tree in the tree region.
			},
			onRender: function(){
				//adjust height
				this.ui.header.css({
					height: this._options.parentCt._itemHeight + 'px',
					lineHeight: this._options.parentCt._itemHeight + 'px'
				});
			},
			events: {
				'click .section-header' : function(){
					this._options.parentCt.trigger('section:clicked', this);
				}
			}
		})
	});

	//lvl-3 nodes and their sub[] children nodes (per level 2 node) - generalize to be a widget?
	var Tree = Backbone.Marionette.CompositeView.extend({
		tagName: 'ul',
		className: 'root',
		template: '#_blank',
		initialize: function(options){
			this._options = options;
			if(this.model){
				this.enableActionTags('Widget.AccordionMenu.TreeNode');
				if(!this.model.get('label'))
					this.model.set('label', this.model.get('name'));
				//leaf
				if(!this.model.get('sub')){
					this.delegate = this._options.belongsTo._options.parentCt._options.group._options.parentCt._options.delegate;
				}
			}
		},
		itemViewOptions: function(model, index){
			var opt = {
				parentCt: this, //while !parentCt._options.section till root.parentCt._options.section to find the section a node/leaf belongs to
				belongsTo: this._options.section || this._options.belongsTo,
				template: '#widget-accordion-menu-treeitem-tpl'
			};
			if(model.get('sub')) {
				_.extend(opt, {
					collection : new Backbone.Collection(model.get('sub')),
					tagName: 'ul',
					className: 'node',
					itemViewContainer: 'ul'
				});
			}else {
				_.extend(opt, {
					tagName: 'li',
					className: 'leaf'
				});
			}
			switch(index){
				case this.collection.size() - 1:
					opt.className = opt.className + ' last';
					break;				
				case 0: 
					opt.className = opt.className + ' first';
					break;
				default:
					break;
			}
			return opt;
		},
		actions: {
			toggle: function($action){
				this.$el.toggleClass('active');
			},
			select: function($action){
				this.delegate.trigger('item:selected', this.model.get('name'), this.model);
			}
		}
	});

	return View;

});

Template.extend('widget-accordion-menu-tpl', [
	'<div region="groups" class="with-border-right"></div>',
	'<div region="sections"></div>'
]);

Template.extend('widget-accordion-menu-group-tpl', [
	'<div class="group-icon-ct"><i class="{{icon}}"></i></div>',
	'<div name="{{name}}" class="group-label">{{label}}</div>',	
]);

Template.extend('widget-accordion-menu-section-tpl', [
	'<div class="section-header" ui="header" name="{{name}}"><i class="{{icon}}"></i> <span class="section-label">{{label}}</span></div>',
	'<div class="section-tree" ui="tree" region="tree"></div>'
]);

Template.extend('widget-accordion-menu-treeitem-tpl', [
	'{{#if sub}}',
		'<li class="meta" action="toggle">',
	'{{/if}}',
	'<i class="linkicon"></i> <i class="{{icon}}"></i> <span class="item-label" {{#unless sub}}action="select"{{/unless}}>{{label}}</span>',
	'{{#if sub}}',
		'</li>',
		'<ul class="leafz"></ul>',
	'{{/if}}',
]);