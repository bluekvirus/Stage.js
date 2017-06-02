/**
 * Added more methods to Backbone.Model
 *
 * @author Tim Lauv
 * @created 2017.06.01
 */

(function(_, Backbone){

	_.extend(Backbone.Model.prototype, {

		//since there is no {reset: true} in model.set() like in view.set(),
		//we give it a reset() method like collection.reset().
		reset: function(data, options){
			options = options || {silent: false};

			if(!data || !_.size(data))
				return this.clear(options);

			return this.clear({silent: true}).set(data, options);
		}

	});

})(_, Backbone);