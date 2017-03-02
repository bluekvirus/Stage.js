/**
 * Similar to view.triggerMethod() but,
 * modified to have view.triggerMethodInversed() call onE() before every registered on('e', fn) listeners,
 * e.g view.triggerMethodInversed('ready') to always call onReady() before all other 'ready' listeners.
 *
 * @author Tim Lauv
 * @created 2017.03.01
 */

// Trigger an event and/or a corresponding method name. Examples:
//
// `this.triggerMethod("foo")` will trigger the "foo" event and
// call the "onFoo" method.
//
// `this.triggerMethod("foo:bar")` will trigger the "foo:bar" event and
// call the "onFooBar" method.
Marionette.triggerMethodInversed = (function(){

  // split the event name on the ":"
  var splitter = /(^|:)(\w)/gi;

  // take the event section ("section1:section2:section3")
  // and turn it in to uppercase name
  function getEventName(match, prefix, eventName) {
    return eventName.toUpperCase();
  }

  // actual triggerMethod implementation
  var triggerMethod = function(event) {
    // get the method name from the event name
    var methodName = 'on' + event.replace(splitter, getEventName);
    var method = this[methodName];

    // 1st: call the onMethodName if it exists //Tim's Hack: onE() always runs before on('e', fn);
    if (_.isFunction(method)) {
      // pass all arguments, except the event name
      method.apply(this, _.tail(arguments));
    }

    // 2nd: trigger the event, if a trigger method exists
    if(_.isFunction(this.trigger)) {
      this.trigger.apply(this, arguments);
    }

  };

  return triggerMethod;
})();
