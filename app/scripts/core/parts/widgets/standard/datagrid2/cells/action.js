/**
 * This is the ActionCell definition used by Datagrid2
 *
 * Options
 * -------
 * passed down by this.model.get('column').actions
 * 
 * actions: [ (append to default row actions)
 * 		{
 * 			name: ...,
 * 			label: ...,
 * 			icon: ...,
 * 			fn: impl function(record, row) - with row record model and row view object. (Note that row.meta has both record and table view object, the first 'record' param is just a short cut)
 * 		},...,
 * ] or { (replace the actions)
 * 		'name': {
 * 			label: ...,
 * 			icon: ...,
 * 			fn: impl function(record, row)
 * 		}
 * }
 *
 * @author Tim.Liu
 * @created 2013.11.27
 */

Application.Widget.register('ActionCell', function(){

	var UI = Backbone.Marionette.ItemView.extend({
		template: '#widget-actioncell-tpl',
		className: 'action-cell',

		initialize: function(options){
			this.row = options.row;
			var actions = this.model.get('column').actions || [];
			if(_.isArray(actions)){
				actions = [{
					name: 'detail',
					icon: 'icon-eye-open'
				},
				{
					name: 'edit',
					icon: 'icon-edit'
				}, {
					name: 'delete',
					icon: 'icon-trash'
				}].concat(actions);
			}
			//allow action impl overriden by action config.fn
			_.each(actions, function(action){
				if(action.fn){
					this.actions[action.name] = function($action){
						action.fn(options.row.meta.record, options.row)
					}
				}
			}, this);
			this.model.set('actions', actions);
			this.enableActionTags('Widget.ActionCell');
		},

		actions: {
			test: function($action){
				console.log(this.row);
			}
		}

	});

	return UI;

});

Template.extend('widget-actioncell-tpl', [

	'{{#each actions}}',
		'<span class="action-cell-item" action={{name}}><i class="icon- {{icon}}"></i> {{label}}</span> ',
	'{{/each}}'

])