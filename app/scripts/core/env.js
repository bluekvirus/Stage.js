/**
 * The Web Application Environment Setup
 *
 * Warning
 * -------
 * Note that this evn.js is loaded AFTER config.js and BEFORE template-builder.js
 *
 * @author Tim.Liu
 * @created 2013.04.01
 * @updated 2013.11.08
 */

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

//1-6 Configure NProgress.configure
NProgress.configure({
  //minimum: 0.1
  //template: "<div class='....'>...</div>"
  //ease: 'ease', speed: 500
  //trickle: false
  //trickleRate: 0.02, trickleSpeed: 800
  //showSpinner: false
});

//1-7,8,9
//7.We override the Region open method to let it consult a view's openEffect attribute.
//8.We add a resize method to Region to allow easier layout sizing.
//	config: {w: ..., h: ..., view: true - resize the view instead of region container, overflowX: hidden, overflowY: auto}
//9.We add a schedule method to show a view when the parent layout is ready and shown, this should be used within the parent layout's initialize(). 
//	It also save a ref to the region's future view, so you can .listenTo the view by layout.views.[region name] in the initialize() after scheduling.
_.extend(Backbone.Marionette.Region.prototype, {
	open: function(view){
		if(view._openEffect){
			this.$el.hide();
			this.$el.empty().append(view.el);
			this.$el.show(view._openEffect.name, view._openEffect.options, view._openEffect.duration || 200);
		}
		else 
			this.$el.empty().append(view.el);
	},

	resize: function(config){
		config = _.extend({
			view: true,
			overflowX: 'hidden',
			overflowY: 'auto'
		},config);
		var target = this.currentView;
		if(!config.view) target = this;
		if(!target) return;
		if(config.h) target.$el.height(config.h).css('overflowY', config.overflowY);
		if(config.w) target.$el.width(config.w).css('overflowX', config.overflowX);
		target.trigger('view:resized', _.pick(config, 'h', 'w'));
	},

	schedule: function(view, immediate){
		this.layout.views = this.layout.views || {};
		this.layout.views[this.name] = view;
		if(immediate) this.show(view);
		else
			this.listenToOnce(this.layout, 'show', function(){
				this.show(view);
			});
	}
});


