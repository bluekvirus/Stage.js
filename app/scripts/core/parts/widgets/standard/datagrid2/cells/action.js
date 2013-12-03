/**
 * This is the ActionCell definition used by Datagrid2
 *
 * Options
 * -------
 * passed down by this.model.get('column').actions
 * 
 * actions: [ (append to default row actions) - default on having [detials] [edit] [delete]
 * 		{
 * 			name: ...,
 * 			label: ...,
 * 			icon: ...,
 * 			tooltip: ...,
 * 			fn: impl function(record, row) - with row record model and row view object. (Note that row.meta has both record and table view object, the first 'record' param is just a short cut)
 * 		},...,
 * ] or { (replace the actions)
 * 		'name': {
 * 			label: ...,
 * 			icon: ...,
 * 			tooltip: ...,
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
				//concat
				actions = [{
					name: 'detail',
					icon: 'icon-eye-open',
					tooltip: 'Show Details'
				},
				{
					name: 'edit',
					icon: 'icon-edit',
					tooltip: 'Edit'
				}, {
					name: 'delete',
					icon: 'icon-trash',
					tooltip: 'Delete'
				}].concat(actions);
			}else {
				//override
				actions = _.map(actions, function(action, name){
					return _.extend({
						name: name
					}, action);
				});
			}
			//allow action impl overriden by action config.fn
			this.actions = this.actions || {};
			_.each(actions, function(action){
				if(action.fn){
					this.actions[action.name] = function($action){
						action.fn(options.row.meta.record, options.row)
					}
				}
			}, this);
			this.model.set('actions', actions);
			this.enableActionTags('Widget.ActionCell', true); //let un-implemented actions be passed to DataGrid2.Table
		},

		onRender: function(){
			this.$('[data-toggle="tooltip"]').tooltip();
			this.$('[action]').data('row', this.row); //easy implementation here, might have performance impact?
		}

	});

	return UI;

});

Template.extend('widget-actioncell-tpl', [

	'{{#each actions}}',
		'<span class="action-cell-item" action={{name}} data-toggle="tooltip" title="{{tooltip}}"><i class="icon- {{icon}}"></i> {{label}}</span> ',
	'{{/each}}'

])