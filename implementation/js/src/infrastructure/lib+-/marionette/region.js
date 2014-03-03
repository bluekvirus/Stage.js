/**
 * Enhancing the Backbone.Marionette.Region Class
 *
 * 1. open()+ -- consult view.effect config block when showing a view;
 *
 * effect config
 * --------------
 * 'string' name of the effect in jQuery;
 * or
 * {
 * 		name: ...
 * 	 	options: ...
 * 	 	duration: ...
 * }
 *
 * @author Tim.Liu
 * @updated 2014.03.03
 */

;(function(app){

	_.extend(Backbone.Marionette.Region.prototype, {
		open: function(view){
			if(view.effect){
				if(_.isString(view.effect)){
					view.effect = {
						name: view.effect
					};
				}
				this.$el.hide();
				this.$el.empty().append(view.el);
				this.$el.show(view.effect.name, view.effect.options, view.effect.duration || 200);
			}
			else 
				this.$el.empty().append(view.el);
		}
	});

})(Application);
