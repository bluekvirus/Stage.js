/**
 * This is the Remote data interfacing core module of this application framework.
 * (Replacing the old Data API module)
 *  
 *
 * @author Tim.Liu
 * @created 2014.03.24
 */

;(function(app, _, $){

	var definition = app.module('Core.Remote');

	function fixOptions(options){
		if(!options) throw new Error('DEV::Core.Remote::options empty, you need to pass in at least a url string');
		if(_.isString(options)) options	= { 
			url: options,
			type: 'GET'
		};
		//default options, process entity/_id and strip off options.querys(alias:params)
		//TBI
		app.trigger('app:ajax', options);		
		return options;
	}

	function notify(jqXHR, options){
		jqXHR
		.done(function(data, textStatus, jqXHR){
			app.trigger('app:success', jqXHR, textStatus, data);
		})
		.fail(function(jqXHR, textStatus, errorThrown){
			app.trigger('app:error', jqXHR, textStatus, errorThrown);
		});
		return jqXHR;
	}

	_.extend(definition, {

		//GET
		get: function(options){
			fixOptions(options);
			app.trigger('app:ajax-pre-get', options);
			return notify($.ajax(options));
		},

		//POST/PUT/DELETE
		change: function(options, payload){
			fixOptions(options);
			if(!payload) throw new Error('DEV::Core.Remote::payload empty, please use GET');
			if(!payload._id) options.type = 'POST';
			else {
				if(_.isEmpty(_.without(payload, '_id'))) options.type = 'DELETE';
				else options.type = 'PUT';
			}
			if(options.type !== 'DELETE'){
				//add json data
				options.processData = _.isUndefined(options.processData)? false: options.processData;
				if(_.isUndefined(options.contentType)){
					//dicate contentType to be json? //TBI
					options.data = JSON.stringify(payload);
				}
			}

			app.trigger('app:ajax-pre-change', options, payload);
			return notify($.ajax(options));
		}

	});

})(Application, _, jQuery);