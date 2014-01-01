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
		className: 'row-fluid',
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
		},
		onShow: function(){
			this.groups.show(new Groups({
				collection: new Backbone.Collection(this._options.structure)
			}));
		}
	});

	var Groups = Backbone.Marionette.CollectionView.extend({
		itemView: Backbone.Marionette.ItemView.extend({
			template: '#widget-accordion-menu-group-tpl',
			className: 'group',
			initialize: function(options){
				if(!this.model.get('label')){
					this.model.set('label', this.model.get('name'));
				}
			}
		})
	});

	return View;

});

Template.extend('widget-accordion-menu-tpl', [
	'<div class="span4" region="groups"></div>',
	'<div class="span8 hide" region="sections"></div>'
]);

Template.extend('widget-accordion-menu-group-tpl', [
	'<div class="group-icon-ct"><i class="{{icon}}"></i></div>',
	'<div name="{{name}}" class="group-label">{{label}}</div>',	
]);