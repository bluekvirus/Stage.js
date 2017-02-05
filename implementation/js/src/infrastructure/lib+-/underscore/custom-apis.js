/**
 * Custom api addons to Underscore.js
 * 
 * @author Tim Lauv
 * @created 2017.02.04
 */

(function(_, underscoreString){

	_.isPlainObject = function(o){
		return _.isObject(o) && !_.isFunction(o) && !_.isArray(o) && !_.isElement(o);
	};
	_.string = underscoreString;

})(_, s);
