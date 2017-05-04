/**
 * Enhancing the Backbone.Marionette.Region Class
 *
 * 1. open()/close/show() (altered to support enter/exit effects)
 * --------------
 * a. consult view.effect animation names (from Animate.css or your own, not from jQuery ui) when showing a view;
 * b. inject parent view as parentCt to sub-regional view;
 *
 * 2. 'region:load-view' and regional metadata
 * ---------------------
 * All view.show() links to 'region:load-view' now. Do NOT use region.show() directly!
 * Giving region the ability to show:
 *     1. a registered View/Widget by name and options
 *     2. direct templates (same as given to view.template)
 *         2.1 @*.html -- remote template in html
 *         2.2 @*.md -- remote template in markdown
 *         2.3 'raw html string'
 *         2.4 ['raw html string1', 'raw html string2']
 *         2.5 a '#id' marked DOM element 
 *     3. view def (class fn)
 *     4. view instance/options (object)
 *     
 * Through:
 *     a. view="" in the template; (1, 2.1, 2.2, 2.5 only)
 *     b. this.show('region', ...) in a view; (all 1-4)
 *     c. 'region:load-view' on a region; (all 1-4)
 *
 *
 * Effect config
 * -------------
 * in both view & region
 * 
 * use the css animation name as enter (show) & exit (close) effect name.
 * 1. 'lightSpeed' or {enter: 'lightSpeedIn', exit: '...'} in view definition
 * 2. effect="lightSpeed" or effect-enter="lightSpeedIn" effect-exit="..." on region tag
 *
 * https://daneden.github.io/animate.css/
 * 
 *
 * Show
 * -------------
 * 1. means view.$el is in DOM, (sub-region view will only render after parent region 'show')
 * 2. 'show' will be triggered after enter animation done.
 * 
 * @author Tim Lauv
 * @updated 2014.03.03
 * @updated 2015.08.10
 * @updated 2015.12.15
 * @updated 2015.02.03
 * @updated 2016.12.12
 * @updated 2017.03.09
 */

;(function(app) {

    _.extend(Backbone.Marionette.Region.prototype, {

        //+region 'render' event listener for adding regional metadata and 'region:load-view' special listener.
        initialize: function() {

            //+since we don't have meta-e enhancement on regions, the 'region:load-view' impl is added here.
            //meta-e are only available on app and view (and context)
            this.listenTo(this, 'region:load-view', function(name /*or templates or View def/instance*/, options){ //can load both view and widget.
                if(!name) return;

                if(_.isString(name)){
                    //Template directly (static/mockup view)?
                    if(!/^[_A-Z]/.test(name)){
                        return this.show(app.view(_.extend({
                            template: name,
                        }, options))).currentView;
                    }
                    else{
                    //View name (_ or A-Z starts a View name, no $ sign here sorry...)
                        var Reusable = app.get(name, _.isPlainObject(options)?'Widget':'', {fallback: true}); //fallback to use view if widget not found.
                        if(Reusable){
                            //Caveat: don't forget to pick up overridable func & properties from options in your Widget.
                            return this.show(Reusable.create(options)).currentView;
                        }else
                            console.warn('DEV::Layout+::region:load-view View required ' + name + ' can NOT be found...use app.view({name: ..., ...}).');                   
                    }
                    return;
                }

                //View definition
                if(_.isFunction(name))
                    return this.show(new name(options)).currentView;

                //View instance (skip options) or anonymous view options
                if(_.isPlainObject(name)){
                    if(name.render)
                        return this.show(name).currentView;
                    else {
                        options = name;
                        return this.show(app.view(options)).currentView;
                    }
                }
            });
        },

        //give ensureEl the ability to add css class and parentCt (view), data('region') (this) meta
        ensureEl: function(parentCt, cssClass) {
          if (!this.$el || this.$el.length === 0) {
              this.$el = this.getEl(this.el);
          }

          if (parentCt)
            this.parentCt = parentCt;
          this.$el
                .addClass(cssClass || 'region ' + _.string.slugify('region ' + this._name)) //_name added through regionMgr.addRegion()
                .data('region', this);

        },

        //'region:show', 'view:show' will always trigger after effect done.
        //note that, newView is always a view instance.
    	show: function(newView, options) {
            this.ensureEl();
            
            var view = this.currentView;
            if (view) {
                this.close(_.bind(function(){
                    this._show(newView, options);
                }, this));
                return this;
            }
            return this._show(newView, options);
    	},

    	//modified show method (removed preventClose & same view check)
        _show: function(view, options) {

            //so now you can use region.show(app.view({...anonymous...}));
            if(_.isFunction(view))
                view = new view(options);

            view.render();
            Marionette.triggerMethod.call(this, "before:show", view);

            if (_.isFunction(view.triggerMethod)) {
                view.triggerMethod("before:show");
            } else {
                Marionette.triggerMethod.call(view, "before:show");
            }

            this.open(view, _.bind(function(){

                //original region:show from M.Region
                //Marionette.triggerMethod.call(this, "show", view);

                //call view:show
                if (_.isFunction(view.triggerMethod)) {
                    view.triggerMethod("show");
                } else {
                    Marionette.triggerMethod.call(view, "show");
                }

                //delay region:show till after view:show (to accommodate navRegion build up in Layout)
                Marionette.triggerMethod.call(this, "show", view);
            }, this));

            return this;
        },

        //modified open method (so effects won't affect 'show' timing seq in both navigation-chain and view="" nesting)
        open: function(view, _cb) {
            var that = this;

            //from original open() method in Marionette
            this.$el.empty().append(view.$el);
            //-----------------------------------------
            
            //fix $.flexlayout/view.layout forged region sub view $el height and sub el positioning:
            if(/flex:.*?;/.test(this.$el.attr('style')))
                view.$el.css({'height': '100%', 'position': 'relative'});

            //mark currentView, parentRegion
            this.currentView = view;
            view.parentRegion = this;

            //inject parent view container through region into the regional views
            if (this.parentCt) {
                view.parentCt = this.parentCt;
                //also passing down the name of the outter-most context container.
                if (this.parentCt.category === 'Context') view.parentCtx = this.parentCt;
                else if (this.parentCt.parentCtx) view.parentCtx = this.parentCt.parentCtx;
            }

            //play effect (before 'show')
            var enterEffect = (_.isPlainObject(view.effect) ? view.effect.enter : (view.effect ? (view.effect + 'In') : '')) || (this.$el.attr('effect')? (this.$el.attr('effect') + 'In') : '') || this.$el.attr('effect-enter');
            if (enterEffect) {
                view.$el.addClass(enterEffect + ' animated').one(app.ADE, function() {
                    view.$el.removeClass('animated ' + enterEffect);
                    _cb && _cb();
                });
            }else
                _cb && _cb();

            return this;
        },

        // Close the current view, if there is one. If there is no
        // current view, it does nothing and returns immediately.
        // 'region:close', 'view:close' will be triggered after animation effect done.
        close: function(_cb) {
            var view = this.currentView;
            if (!view || view.isClosed) {
                _cb && _cb();
                return;
            }

            // call 'close' or 'remove', depending on which is found
            if (view.close) {
                var callback = _.bind(function(){
                    Marionette.triggerMethod.call(this, "close", view);
                    delete this.currentView;
                    _cb && _cb(); //for opening new view immediately (internal, see show());
                }, this);

                var exitEffect = (_.isPlainObject(view.effect) ? view.effect.exit : (view.effect ? (view.effect + 'Out') : '')) || (this.$el.attr('effect')? (this.$el.attr('effect') + 'Out'): '') || this.$el.attr('effect-exit');
                if (exitEffect) {
                    view.$el.addClass(exitEffect + ' animated')
                    .one(app.ADE, function(e) {
                        e.stopPropagation();
                        view.close(callback);
                    });
                    return;
                }else
                    view.close(callback);
            } else if (view.remove) {
                view.remove();
                Marionette.triggerMethod.call(this, "close", view);
                delete this.currentView;
                _cb && _cb(); //for opening new view immediately (internal, see show());
            }
        },

    });

})(Application);
