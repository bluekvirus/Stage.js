/**
 * The Web Application Environment Setup
 *
 * @author Tim.Liu
 * @created 2013.04.01
 * @updated 2013.11.08
 */

/**
 * ================================
 * Global VARs Creation
 * ================================
 */

//0-1 Create the global Application var for modules to be registered on.
window.Application = new Backbone.Marionette.Application();

//0-2 Create the global Template var for views to easily define templates.
window.Template = window.Template || {};
window.Template.extend = function (name, tplStrArray){
	var tpl = tplStrArray.join('');
	$('head').append(['<script type="text/tpl" id="',name,'">',tpl,'</script>'].join(''));
}
window.Template.extend('_blank', [' ']); //blank sheet template.

/**
 * ================================
 * Application Config Loading
 * ================================
 */
$.ajax({
    url: 'scripts/config.js',
    dataType: 'script',
    async: false
});

/**
 * ================================
 * Lib Activation/Overriden (Global n Permanent)
 * ================================
 */

//1-1 Hook up additional Handlebars helpers.
Swag.registerHelpers();

//1-2 Override to use Handlebars templating engine with Backbone.Marionette
Backbone.Marionette.TemplateCache.prototype.compileTemplate = function(rawTemplate) {
  return Handlebars.compile(rawTemplate);
};

//1-3 Override Backbone.Sync - Use Application.API module instead for method implementation
//+ entity, changeOnly, params options to .fetch, .save and .destroy methods of model & collection
Backbone.sync = (function(){

  /*method = create, update, delete, read*/
  return function(method, model, options) {
    //check if this operation is toward an entity
    options.entity = model.getEntityName() || (model.collection && model.collection.getEntityName()) || options.entity;
    if(!options.entity) throw new Error('DEV::Backbone.sync-Override::You must specify an [entity] name in the options');
    //put model or collection into options
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
				if(collection.pagination && collection.pagination.cache === false){
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
		}else if (method === 'read'){
			if(model.isNew()) return; //abort!
			data = {};
		}

    }else {
		options.collection = model;
    }
    //internal usage only, signal the Application.API.call that this is coming from a .fetch .save or .destroy so the success callback can be sorted properly.
    //note that in such a case, the success callback is of the original backbone defined form.
    options._backbonesync = method;

    // Make the request, allowing the user to override any Ajax options.
    var xhr = options.xhr = Application.API.call([options.entity, 'data', method].join('.'), _.isEmpty(data)? undefined: data, options.params, options);
    model.trigger('request', model, xhr, options);
    if(autorecovery) xhr = xhr.fail(autorecovery);
    return xhr;
  };

})();

//1-4 Default Backbone.Model idAttribute to '_id'
Backbone.Model.prototype.idAttribute = '_id';

//1-5 Replace the original Backbone.Collection.create method to just prepare a new model for us.
Backbone.Collection.prototype.create = function(attributes, idAttributeToRemove){
	attributes = attributes || {};
	idAttributeToRemove = idAttributeToRemove || Backbone.Model.prototype.idAttribute;
	delete attributes[idAttributeToRemove];
	var model = new Backbone.Model(attributes, {
		collection: this
	});
	model.bindToEntity(this.getEntityName());
	return model;
};


