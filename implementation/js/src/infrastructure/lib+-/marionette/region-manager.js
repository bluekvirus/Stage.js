/**
 * Override the RegionManager methods (for refinement and bug fixing)
 *
 * @author Tim Lauv
 * @created 2016.02.05
 * @updated 2017.03.10
 */

;(function(app){

	_.extend(Marionette.RegionManager.prototype, {

		// Add an individual region to the region manager,
		// and return the region instance
		// +We give the region object its own name as the _name property.
		addRegion: function(name, definition) {
		    var region;

		    var isObject = _.isObject(definition);
		    var isString = _.isString(definition);
		    var hasSelector = !!definition.selector;

		    if (isString || (isObject && hasSelector)) {
		        region = Marionette.Region.buildRegion(definition, Marionette.Region);
		    } else if (_.isFunction(definition)) {
		        region = Marionette.Region.buildRegion(definition, Marionette.Region);
		    } else {
		        region = definition;
		    }

		    region._name = name;
		    this._store(name, region);
		    this.triggerMethod("region:add", name, region);
		    return region;
		},

	    // Close all regions in the region manager, but
	    // leave them attached
	    closeRegions: function(_cb) {
	    	if(!_.size(this._regions))//**Caveat: this._regions is not an [];
	    		return _cb && _cb();

	    	var callback = _.after(_.size(this._regions), function(){
	    		_cb && _cb();
	    	});
	        _.each(this._regions, function(region, name) {
	            region.close(callback);
	        }, this);
	    },

	    // *Close all regions* and shut down the region-manager entirely
	    // *region.close()* needs a sync on close effects;
	    close: function(_cb) {
	    	this.closeRegions(_.bind(function(){
		        this.removeRegions();
		        Marionette.Controller.prototype.close.apply(this, arguments);
		        _cb && _cb();
	    	}, this)); //was missing in M v1.8.9
	    },

	});

})(Application);