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
						{name: 'aS-1', sub: [{name: 'aS-1.item1'}, {name: 'aS-1.item2'}]},
						{name: 'aS-2', sub: [{name: 'aS-2.item1'}, {name: 'aS-2.item2'}]},
						{name: 'aS-3', sub: [{name: 'aS-3.item1'}, {name: 'aS-3.item2'}]}
					]},
					{name: 'bG', sub: [
						{name: 'bS-1', sub: [{name: 'bS-1.item1'}, {name: 'bS-1.item2'}]},
						{name: 'bS-2', sub: [{name: 'bS-2.item1'}, {name: 'bS-2.item2'}]},
						{name: 'bS-3', sub: [{name: 'bS-3.item1'}, {name: 'bS-3.item2'}]}
					]},
					{name: 'cG', sub: [
						{name: 'cS-1', sub: [{name: 'cS-1.item1'}, {name: 'cS-1.item2'}]},
						{name: 'cS-2', sub: [{name: 'cS-2.item1'}, {name: 'cS-2.item2'}]},
						{name: 'cS-3', sub: [{name: 'cS-3.item1'}, {name: 'cS-3.item2'}]}
					]}
				]
				//---------------------------------------
			}, options);
			this._options = options;
			this.autoDetectRegions();
			this.groups.schedule(new Groups({
				collection: new Backbone.Collection(this._options.structure)
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
		}
	});

	//lvl-1 nodes
	var Groups = Backbone.Marionette.CollectionView.extend({
		className: 'groups',
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
		}
	});

	//lvl-2 nodes (per level 1 node)
	var Sections = Backbone.Marionette.CollectionView.extend({
		className: 'sections',
		initialize: function(options){
			this._options = options;
			var borderFix = Number(_.string.trim(this._options.group.$el.css('borderBottomWidth'), 'px'));
			this._itemHeight = (this._options.group.$el.innerHeight() - borderFix)/2; //dynamically make 2 section together to be as high as a group view block.
		},
		itemViewOptions: function(){
			return {
				parentCt: this,
				group: this._options.group
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
				//this.tree.schedule()... //show the section items as tree in the tree region.
			},
			onRender: function(){
				//adjust height
				this.ui.header.css({
					height: this._options.parentCt._itemHeight + 'px',
					lineHeight: this._options.parentCt._itemHeight + 'px'
				});
			}
		}),
		onShow: function(){
			//activate accordion
		}
	})

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
	'<div class="section-header" ui="header" name="{{name}}"><i class="{{icon}}"></i> <span class="title">{{label}}</span></div>',
	'<div class="section-tree" region="tree"></div>'
]);