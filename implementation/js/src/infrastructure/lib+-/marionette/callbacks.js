/**
 * Overriding the special M.Callbacks module so that any callback in the chain
 * could return a promise for async operations. 
 *
 * Final done event is `callbacks:all-done` triggered on the Callbacks object (now also has events!).
 *
 * Caveat 1: we skipped this._callbacks since it is always initialized with length 2 ... :S
 * Caveat 2: changes made here also affect all the init/finalize chains in M.Modules, but luckily no one is using them.
 *
 * @author Tim Lauv
 * @created 2016.03.24
 */
;(function(app) {

    _.extend(Marionette.Callbacks.prototype, Backbone.Events, {

        // Add a callback to be executed. Callbacks added here are
        // guaranteed to execute, even if they are added after the
        // `run` method is called.
        add: function(callback, contextOverride) {
        	this._cbs = this._cbs || [];
            this._cbs.push({ cb: callback, ctx: contextOverride });

            var that = this;
            this._deferred.done(function(context, options) {
                if (contextOverride) { context = contextOverride; }
                var result = callback.call(context, options);

                if (result && _.isFunction(result.always)) {
                    //async promise object returned by a callback/initializer
                    result.always(function() {
                        that._alldone();
                    });
                }else {
                	that._alldone();
                }
            });
        },

        // Run all registered callbacks with the context specified.
        // Additional callbacks can be added after this has been run
        // and they will still be executed.
        run: function(options, context) {
            var that = this;
            this._cbs = this._cbs || [];
            if(this._cbs.length){
	            this._alldone = _.after(this._cbs.length, function() {
	                that.trigger('callbacks:all-done', that._cbs.length);
	            });
	            this._deferred.resolve(context, options);
	        }else {
	        	this.trigger('callbacks:all-done');
	        }
        },

        // Resets the list of callbacks to be run, allowing the same list
        // to be run multiple times - whenever the `run` method is called.
        reset: function() {
            var callbacks = this._cbs;
            this._deferred = Marionette.$.Deferred();
            this._cbs = [];
            this._alldone = _.noop;

            _.each(callbacks, function(cb) {
                this.add(cb.cb, cb.ctx);
            }, this);
        }
    });

})(Application);