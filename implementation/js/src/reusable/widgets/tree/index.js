/**
 * This is the Tree widget.
 *
 * <ul>
 * 	<li></li>
 * 	<li></li>
 * 	<li>
 * 		<a></a> -- item val
 * 		<ul>...</ul> -- nested children
 * 	</li>
 * 	...
 * </ul>
 *
 * options
 * -------
 * 1. data - [{
 * 		val: ...
 * 		icon: ...
 * 		children: []
 * }]
 * 2. node - default view definition config: see nodeViewConfig below
 *
 * override node view
 * ------------------
 * a. just template (e.g val attr used in template)
 * use node: {template: [...]}; don't forget <ul></ul> at the end of tpl string.
 * 
 * b. children array attr
 * use node: {
 * 		initialize: function(){
 * 			if(this.className() === 'node') this.collection = app.collection(this.model.get('[new children attr]'));
 * 		}
 * }
 *
 * @author Tim.Liu
 * @created 2014.04.24
 */

;(function(app){

	app.widget('Tree', function(){

		var nodeViewConfig = {
			type: 'CompositeView',
			tagName: 'li',
			itemViewContainer: 'ul',
			className: function(){
				if(_.size(this.model.get('children')) > 1){
					return 'node';
				}
				return 'leaf';
			},
			initialize: function(){
				if(this.className() === 'node') this.collection = app.collection(this.model.get('children'));
			},
			template: [
				'<a href="#"><i class="{{icon}}"></i> {{{val}}}</a>',
				'<ul></ul>'
			]
		};

		var Root = app.view({
			type: 'CollectionView',
			className: 'tree tree-root',
			tagName: 'ul',
			initialize: function(options){
				this._options = options;
				this.itemView = this._options.itemView || app.view(_.extend({}, nodeViewConfig, _.omit(this._options.node, 'type', 'tagName', 'itemViewContainer')));
			},
			onShow: function(){
				this.trigger('view:reconfigure', this._options);
			},
			onReconfigure: function(options){
				_.extend(this._options, options);
				this.trigger('view:render-data', this._options.data);
			}
		});

		return Root;

	});

})(Application);