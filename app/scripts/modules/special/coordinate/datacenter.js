/**
 * A Data Center module to coordinate data between needed party and 
 * the data modules. It is needed because we need a monitored way of 
 * loading/refreshing required data instead of letting the needed party
 * implement their own (mostly ajax) in the editors and widgets.
 *
 * Fallback seq:
 * 1. url
 * 2. module name
 * 3. form field name (on the same form)
 * 
 * @param {String} resource - A name/url/fieldname.
 * @param {Backbone.Form} form - optional only required when resource is fieldname.
 * @param {Function} cb - do something when the data is ready/resolved.
 *
 * @return {Object} - the parsed json object. (only the payload)
 *
 * @author Tim.Liu
 * @update 2013.04.08
 * 
 */

(function(app){

	var module = app.module('DataCenter');

	/**
	 * Synced Data Resolving - Collection ONLY atm
	 */
	module.resolve = function(resource, form, cb){
		if(!cb){
			cb = form;
		}
		var options = {
			//signal the server that we will not use paginations 
			data: {pagination: false},
			processData: true, //this will convert data into query params.
			success: function(data){
				//returned from url or collection fetch()
				cb(data.payload || data.toJSON());
			}
		};

		if(resource.indexOf('/') !== -1){
			//case: url
			$.ajax(_.extend({url: resource}).extend(options));

		}else if(/[A-Z].*/.test(resource) && app[resource]){
			//case: data module name
			app[resource].collection.fetch(options);

		}else if(form && !_.isFunction(form)){
			//case: form field
			//Note:: Make sure the request maker is rendered after the targeted field.
			cb(form.getValue(resource));

		}else{
			//unavailable >> undefined.
			Application.error('Data Resolving Error', resource, 'UNKNOWN...');
		}
	};

})(Application); /*Don't forget ;*/