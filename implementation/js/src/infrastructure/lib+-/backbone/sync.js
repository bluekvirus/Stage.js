//1-3 Override Backbone.Sync - Use Application.Core.API module instead for method implementation
//+ entity, changeOnly, params options to .fetch, .save and .destroy methods of model & collection
Backbone.sync = (function(){

  /*method = create, update, delete, read*/
  return function(method, model, options) {
    //check if this operation is toward an entity
    options.entity = model.getEntityName() || (model.collection && model.collection.getEntityName()) || options.entity;
    if(!options.entity) throw new Error('DEV::Backbone.sync-Override::You must specify an [entity] name in the options');

    //put model or collection into options, note that this is not testing model.isNew().
    //model: save,fetch,destroy
    if(model.isNew){
		options.model = model;
	    //figure out what the data is to send to server
	    var data = model.attributes;
	    //default on changeOnly = true, only to put changed data of a model to server
	    options.changeOnly = _.isUndefined(options.changeOnly)? true : options.changeOnly;
		//hookup auto-add-to-collection upon creation & auto-recover-to-previous-attributes upon update
		//create - auto-add-to-collection
		if(method === 'create' && model.collection){
			model.listenToOnce(model, 'sync', function(model){
				var collection = model.collection;
				if(collection.pagination && collection.pagination.mode !== 'infinite'){
					if(collection.pagination.mode === 'client'){
						//need to add to the model cache array as well.
						collection.prepDataStart([model.attributes]);
						collection.prepDataEnd();
					}
					if(collection.size() < collection.pagination.pageSize){
						collection.add(model, {merge: true});
					}
				}else {
					collection.add(model, {merge: true});
				}
			});
		}else if(method === 'update'){
			if(options.changeOnly) data = model.changedAttributes() || {};		
		//update - auto-recovery
			var autorecovery = function(){
				model.set(model.previousAttributes());
			};
			if(model.collection && model.collection.pagination && model.collection.pagination.mode === 'client'){
				model.listenToOnce(model, 'sync', function(model){
					model.collection.updateData([model]);
				});
			}
		}else if (method === 'read'){
			if(model.isNew()) return; //abort!
			data = {};
		}else if (method === 'delete' && model.collection){
			var collection = model.collection;
			if(collection.pagination && collection.pagination.mode === 'client'){
				model.listenToOnce(model, 'sync', function(model){
					collection.removeData([model]);
					collection.prepDataEnd();
				});
			}
		}

    //collection: fetch
    }else {
      options.collection = model; //for collection's data prep-ing with pagination see core/enhancements/collection.js
    }
    //internal usage only, signal the Application.Core.API.call that this is coming from a .fetch .save or .destroy so the success callback can be sorted properly.
    //note that in such a case, the success callback is of the original backbone defined form.
    options._backbonesync = method;

    // Make the request, allowing the user to override any Ajax options.
    var xhr = options.xhr = Application.Core.API.call([options.entity, 'data', method].join('.'), _.isEmpty(data)? undefined: data, options.params, options);
    model.trigger('request', model, xhr, options);
    if(autorecovery) xhr = xhr.fail(autorecovery);
    return xhr;
  };

})();