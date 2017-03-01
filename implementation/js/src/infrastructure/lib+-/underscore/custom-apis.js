/**
 * Custom api addons to Underscore.js
 * 
 * @author Tim Lauv
 * @created 2017.02.04
 */

(function(_, underscoreString, $){

    _.isPlainObject = function(o){
        return _.isObject(o) && !_.isFunction(o) && !_.isArray(o) && !_.isElement(o);
    };

    _.isjQueryObject = function(o){
        return o instanceof $;
    };

    _.deepClone = function(o){
        return $.extend(true, {}, o); //jQuery >= 1.1.4 (see https://api.jquery.com/jquery.extend/)
    };

    //ignoring fn, undefined, meta attr ([].foo), prototype chain, also Date() becomes ISO-8601 strings.
    //ref: http://www.zsoltnagy.eu/cloning-objects-in-javascript/
    _.deepCloneFast = function(o){
    	return JSON.parse(JSON.stringify(o));
    };

    _.string = underscoreString;

})(_, s, jQuery);
