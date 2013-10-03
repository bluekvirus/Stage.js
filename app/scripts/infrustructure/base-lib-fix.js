/**
 * ==========================
 * Base Libs Warmup & Hacks
 * ==========================
 *
 * @author Tim.Liu
 * @create 2013.09.11
 */
;(function(window, Swag, Backbone, Handlebars){

	//Hook up additional Handlebars helpers.
	Swag.registerHelpers();

	//Override to use Handlebars templating engine with Backbone.Marionette
	Backbone.Marionette.TemplateCache.prototype.compileTemplate = function(rawTemplate) {
	  return Handlebars.compile(rawTemplate);
	};

	//Add a _uilocks map for each of the UI view on screen, for managing UI action locks for its regions
	//Also it will add in a _all region for locking the whole UI
	_.extend(Backbone.Marionette.View.prototype, {
		//only for layouts
		initUILocks: function(){
			if(this.regions){
				this._uilocks = _.reduce(this.regions, function(memo, val, key, list){
					memo[key] = false;
					return memo;
				}, {_all: false});
			}
		},

		//region, caller are optional
		lockUI: function(region, caller){
			region = this._checkRegion(region);

			caller = caller || '_default_';
			if(!this._uilocks[region]){ //not locked, lock it with caller signature!
				this._uilocks[region] = caller;
				return true;
			}
			if(this._uilocks[region] === caller) //locked by caller already, bypass.
				return true;
			//else throw error...since it is already locked, by something else tho...
			throw new Error('DEV::View UI Locks::This region ' + region + ' is already locked by ' + this._uilocks[region]);
		},

		//region, caller are optional
		unlockUI: function(region, caller){
			region = this._checkRegion(region);

			caller = caller || '_default_';
			if(!this._uilocks[region]) return true; //not locked, bypass.
			if(this._uilocks[region] === caller){ //locked by caller, release it.
				this._uilocks[region] = false;
				return true;
			}
			//else throw error...
			throw new Error('DEV::View UI Locks::This region ' + region + ' is locked by ' + this._uilocks[region] + ', you can NOT unlock it with ' + caller);
		},

		isUILocked: function(region){
			region = this._checkRegion(region);

			return this._uilocks[region];
		},

		//=====Internal Workers=====
		_checkRegion: function(region){
			if(!region)
				region = '_all';
			else
				if(!this.regions[region])
					throw new Error('DEV::View UI Locks::This region does NOT exist - ' + region);
			return region;
		}
		//=====Internal Workers=====				

	});

})(window, Swag, Backbone, Handlebars);