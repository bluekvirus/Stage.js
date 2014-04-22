/**
 * This is the ActionCell definition 
 *
 * options
 * -------
 * passed down by this.model.get('actions')
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
 * @updated 2014.04.22
 */

;(function(app){

	app.widget('ActionCell', function(){

		var UI = Backbone.Marionette.ItemView.extend({
			template: [
				'{{#each actions}}',
					'<span class="action-cell-item" action={{name}} data-toggle="tooltip" title="{{tooltip}}"><i class="{{icon}}"></i> {{label}}</span> ',
				'{{/each}}'
			],
			className: 'action-cell',

			initialize: function(options){
				this.row = options.row;
				var actions = this.model.get('actions') || [];

					//default
					_.each({
						preview: {
							icon: 'fa fa-eye',
							tooltip: 'Preview'
						},
						edit: {
							icon: 'fa fa-edit',
							tooltip: 'Edit'
						},
						'delete': {
							icon: 'fa fa-trash-o',
							tooltip: 'Delete'
						}
					}, function(def, name){
						if(actions[name]){
							actions[name] = _.extend(def, actions[name]);
						}else
							actions[name] = def;
					});


				//allow action impl overriden by action config.fn
				this.actions = this.actions || {};
				_.each(actions, function(action, name){
					if(action.fn){
						this.actions[name] = function($action){
							action.fn.apply(this.row, this.row.record);
							/*Warning:: If we use options.row here, it won't work, since the options object will change, hence this event listener will be refering to other record's row when triggered*/
						}
					}
				}, this);
				this.model.set('actions', actions);
			},
			tooltips: true

		});

		return UI;

	});	

})(Application);
