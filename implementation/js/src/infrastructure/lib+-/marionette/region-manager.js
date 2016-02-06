/**
 * Override the RegionManager methods (for refinement and bug fixing)
 *
 * @author Tim Lauv
 * @created 2016.02.05
 */

;(function(app){

	_.extend(Marionette.RegionManager.prototype, {

	    // Close all regions in the region manager, but
	    // leave them attached
	    closeRegions: function(_cb) {
	    	if(!this._regions.length)
	    		return _cb && _cb();

	    	var callback = _.after(this._regions.length, function(){
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