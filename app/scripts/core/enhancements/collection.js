/**
 * Backbone Collection Enhancement 
 * 
 * 1. +Pagination & Search/Filter & Recover ability - Backbone.Collection
 * 2. +bindToEntity/getEntityName to hookup with Application.API through Backbone.sync override (core/env.js)
 *
 * @author Tim.Liu
 * @created 2013.09.11
 * @updated 2013.11.08
 * 
 */

/*	
	Pagination - extend the Backbone.Collection to let it have this ability
	(Warning: To make the code simpler, we put a special parse() in data-units.js for collections to save
				the fetched result without feeding all of them to the model factory. (only in mode:client)
				This way, we don't have to make another 'window' collection for updating the UI.
	)
	+Config: {
		mode: client/server - non 'server' value means 'client' mode.
		cache: false(default)/true (completely swap the content of this collection or incrementally feed it)
		pageSize: (default: 25) - 0 means showing all
		params: { optionally control the server params used. //Hard coded atm...
			offset: 'page', 
			size: 'per_page'
		}
	}
	+Properties: { should be Read-Only, can only be changed from calling the functions below.
		currentPage:
		totalRecords: in cached server mode, this can be null
	}
	+Func: { 
		load: instead of calling fetch directly, we use load(options) to do some preprocess.
			+options: apart from the normal options to be passed to fetch() we add
					page: number or nothing -> load specific page or page 1
				
		nextPage: load currentPage + 1;
		prevPage: only works if 'cache' is set to false;
	}
	+Events 
		1. pagination:updatePageNumbers - fired upon 'sync' after 'add' and 'destroy' after 'remove', only in non-cached client mode.
		2. pagination:pageChanged - fired upon each time the collection change to hold another page of data.
	Note that: at any given time, you can still use fetch(), using load() will always enforce a paginated fetch()
*/

_.extend(Backbone.Collection.prototype, {

	//To opt-in the pagination with any Backbone.Collection
	//Invoke this function in your collection definition's initialize()
	//Warning:: your parse() method must be overridden to provide support to the load() method below, see collection's parse() method override in - special/registry/data-units.js
	//You don't have to do anything if your collection is created by the DataUnits special registry module.
	enablePagination: function(config){
		this.pagination = _.extend({
			mode: 'client',
			cache: false, //this means the collection is not used to cache previously loaded records. However, we do save the fetched result in client mode. see - data-units.js
			pageSize: 10,
		}, this.pagination, config);

		//we need to +/- related records from _cachedResponse array as well.
		function signalClientModePageNumberUpdate(collection){
			collection.totalRecords = collection._cachedResponse.length;
			collection.trigger('pagination:updatePageNumbers');
		}

		//expose a pair of api exclusively. (for loading data locally instead of 1st-time load from server.)
		if(this.pagination.mode === 'client'){
			this.prepDataStart = function(data){
				this._cachedResponse = this._cachedResponse || [];
				this._cachedResponse = this._cachedResponse.concat(data);
			};
			this.prepDataEnd = function(){ //also need to call this whenever the _cachedResponse changes(e.g search & recover).
				signalClientModePageNumberUpdate(this);
			}
		}

		var eWhiteList = {
			'sync': true,
			'destroy': true
		};
		this.on('all', function(event, target){
			if(!eWhiteList[event]) return;
			if(this.pagination.cache) return;
			if(this.pagination.mode !== 'client') return;
			//1. we only need to do this for non-cached client mode, since in other modes, the page numbers are either not needed or updated by server's replay about total records.			
			if(this === target){
				//Note that this === target means the 'sync' detected is after 'reset'. This is true for both client and server mode.
				this.prepDataEnd();
				return;
			}
			//2. we are only interested in sync after add and destroy after remove.
			switch(event){
				case 'sync':
					this._cachedResponse.push(target.attributes);
					signalClientModePageNumberUpdate(this);
					break;
				case 'destroy':
					console.log('-', target.id);
					for (var i = this._cachedResponse.length - 1; i >= 0; i--) {
						if(this._cachedResponse[i][target.idAttribute] === target.id){
							this._cachedResponse.splice(i, 1);
							break;
						}
					};
					signalClientModePageNumberUpdate(this);
					break;
				default:
					break;
			}

		});
		
		return this;
	},

	//A version of fetch() with pagination config applied. Always use load if possible.
	load: function(page, options){
		if(_.isObject(page)){
			options = page || {};
		}
		options = options || {};

		if(this.pagination){
			page = (_.isNumber(page) && page) || 1;
			//Note that we don't skip fetch when (this.currentPage === page), coz the page would be the same during a 'UI module' swap/navigate, like in the Admin context.

			this.currentPage = page;
			if(this.pagination.mode === 'client'){
				if(!this._cachedResponse || options.reset){
					//go fetch the records again.
					this.fetch(options);
				}else {
					//go to page
					this.set(this._cachedResponse.slice((this.currentPage-1) * this.pagination.pageSize, this.currentPage * this.pagination.pageSize), {remove: !this.pagination.cache});
					this.trigger('pagination:pageChanged');
				}
			}else {
				//server mode
				options.params = _.extend(options.params || {}, {
					page: this.currentPage,
					per_page: this.pagination.pageSize,
					criteria: this.criteria, //for remote search support
				});
				var that = this;
				_.extend(options, {
					remove: !this.pagination.cache,
					success: function(){
						that.trigger('pagination:pageChanged');
					}
				});
				this.fetch(options);
			}
		}else {
			this.fetch(options); //ignore pagination. normal fetch();
		}
	},

	//Supporting simple search(filtering) in a collection through {key: val, key2: val2, ...}
	//For complicated remote search use load() options instead.
	//For complicated local search use fitler() iterator instead. 
	//mode: client(local), server(remote) (this can be different than pagination mode)
	search: function(criteria, mode){
		this.recover();
		mode = mode || (this.pagination && this.pagination.mode) || 'client';
		//mode server, we send criteria through load();
		if(mode === 'server'){
			this.criteria = criteria;
			this.load();
		}else {
			if(this._cachedResponse) {
				//use cached json response array
				this._recoverArray = this._cachedResponse;
				this._cachedResponse = _.where(this._recoverArray, criteria);
				this.prepDataEnd();
				this.load();
			}else {
				//directly on collection.
				this._recoverCollection = _.clone(this.models);
				this.set(this.where(criteria));
			}
		}
	},

	//recover from search/filtering.
	recover: function(){
		if(this._recoverCollection) {
			this.set(this._recoverCollection);
			delete this._recoverCollection;
			return;
		}
		if(this.criteria) {
			delete this.criteria;
			this.load();
		}
		if(this._recoverArray) {
			this._cachedResponse = this._recoverArray;
			delete this._recoverArray;
			this.prepDataEnd();
			this.load();
		}
		
	},


	//Support Backbone.sync overriden code
	getEntityName: function(){
		return this._entity;
	},

	bindToEntity: function(entity){
		if(!this.getEntityName())
			this._entity = entity;
		else
			throw new Error('DEV::Enhancement.Collection::You have already bound this collection to entity ' + this.getEntityName());
		return this;
	}
});

