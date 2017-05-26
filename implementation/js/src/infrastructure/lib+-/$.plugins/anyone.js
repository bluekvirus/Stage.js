/**
 * Listen to any event (in given event types) then off() the listener.
 * (To help with the app.ADE multiple e type firing quirk in some of the *modern* browsers)
 *
 * Usage
 * -----
 * $el.anyone('e1 e2 e3 ...', function(){
 * 		...
 * });
 *
 * Unlike $el.
 *
 * Dependency
 * ----------
 * jQuery, Underscore
 *
 * 
 * @author Tim Lauv
 * @created 2017.05.25
 */

(function($, _){

	/*===============the util functions================*/
	function bind($el, events, listener){
		events = events.split(' ');
		function offEveryoneElse(e){
			_.each(_.without(events, e), function(other){
				$el.off(other, listener);
			});
		};
		_.each(events, function(e){
			$el.one(e, function(){
				listener.apply(this, arguments);
				offEveryoneElse(e);
			})
		});
	};

	/*===============the plugin================*/

	//store table-of-content listing in data-toc
	$.fn.anyone = function(events, listener){
		return this.each(function(index, el){
			var $el = $(el);
			bind($el, events, listener);
		});
	};

})(jQuery, _);