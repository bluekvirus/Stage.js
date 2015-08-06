/**
 * Enhancing the Backbone.Marionette.Region Class
 *
 * 1. open()+
 * --------------
 * a. consult view.effect animation names (from Animate.css or your own, not from jQuery ui) when showing a view;
 * b. inject parent view as parentCt to sub-regional view;
 * c. store sub view as parent view's _fieldsets[member];
 * 
 *
 * @author Tim.Liu
 * @updated 2014.03.03
 */

;(function(app){

	_.extend(Backbone.Marionette.Region.prototype, {
		open: function(view){

			/**
			 * Effect config in view & region **(only enter effect is implemented pre 1.8)**
			 * 
			 * use the css animation name as enter & exit effect name.
			 * e.g 'lightSpeedIn' or {enter: 'lightSpeedIn', exit: '...'}
			 * e.g data-effect="lightSpeedIn" or data-effect-enter="lightSpeedIn" data-effect-exit="..."
			 *
			 * animationName:defer means calling view.enter() to animate out the effect instead of right after 'show' event.
			 *
			 * https://daneden.github.io/animate.css/
			 * 
			 */
			if(view.effect !== false)
				view.effect = (_.isObject(view.effect)?view.effect.enter:view.effect) || this.$el.data('effect') || this.$el.data('effectEnter');
			if(view.effect){
				var meta = view.effect.split(':'); //effectName:defer?
				view.$el.css('opacity', 0).addClass(meta[0]);
				this.$el.empty().append(view.el);

				function enter(){
					_.defer(function(){
						view.$el.addClass('animated');
						_.defer(function(){
							view.$el.css('opacity', 1);
						});
					});
				}

				if(meta[1] === 'defer')
					view.enter = enter;
				else
					view.once('show', function(){
						enter();
					});
			}
			else 
				this.$el.empty().append(view.el);

			//inject parent view container through region into the regional views
			if(this._parentLayout){
				view.parentCt = this._parentLayout;
				//also passing down the name of the outter-most context container.
				if(this._parentLayout.category === 'Context') view.parentCtx = this._parentLayout;
				else if (this._parentLayout.parentCtx) view.parentCtx = this._parentLayout.parentCtx;
			}

			//store sub region form view by fieldset
			if(view.fieldset) {
				this._parentLayout._fieldsets = this._parentLayout._fieldsets || {};
				this._parentLayout._fieldsets[view.fieldset] = view;
			}

			//trigger view:resized anyway upon its first display
			if(this._contentStyle){
				//view.$el.css(this._contentStyle); //Tricky, use a .$el.css() call to smooth dom sizing/refreshing after $el.empty().append()
				var that = this;
				_.defer(function(){
					view.trigger('view:resized', {region: that}); //!!Caution: this might be racing if using view.effect as well!!
				});			
			}

			view.parentRegion = this;

			return this;
		},

		//you don't need to calculate paddings on a region, since we are using $.innerHeight()
		resize:function(options){
			options = options || {};

			/*Note that since we use box-sizing in css, if using this.$el.css() to set height/width, they are equal to using innerHeight/Width()*/
			this._contentStyle = _.extend({}, options, this._contentOverflow);
			this.$el.css(this._contentStyle);
			
			var that = this;
			_.defer(function(){ //give browser a chance to catch up with style changes.
				if(that.currentView) {
					//this.currentView.$el.css(this._contentStyle);
					that.currentView.trigger('view:resized', {region: that});
				}
			});

			return this;

		}
	});

})(Application);
