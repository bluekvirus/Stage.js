/**
 * Overriding the special M.Application module so that,
 *
 * It waits for `callbacks:all-done` event from its init chain and trigger `app:initialized`.
 *
 * Usage
 * -----
 * All init routines added through `app.addInitializer()` can now contain async code.
 * ```
 * app.addInitializer(function(){
 *    return app.remote('some-data.json').done(...);
 * });
 * ```
 *
 * Deps
 * ----
 * see callbacks.js
 *
 * @author Tim Lauv
 * @created 2016.03.24
 */
;(function(app){

	_.extend(Marionette.Application.prototype, {

		// kick off all of the application's processes.
		// initializes all of the regions that have been added
		// to the app, and runs all of the initializer functions (+async promise)
		start: function(options){
			this._initCallbacks.once('callbacks:all-done', function(noi){
				app.trigger('app:initialized', options);
			});
			this._initCallbacks.run(options, this);
		},

	});

})(Application);