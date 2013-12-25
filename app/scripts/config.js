;(function(Application){

	/**
	 * ================================
	 * Global Configure
	 * ================================
	 */
	Application.config = _.extend(Application.config || {}, {

		appContext: 'Admin', //This is the context the application will sit on upon loading.
		fullScreen: true, //Note that this only indicates <body> will have overflow set to hidden in its css.
		//No matter true/false here, we will be tracking application window size upon window resizing events and put values in Application.fullScreenContextHeight as reference.

		crossdomain: {
			//enabled: true,
			/**
			 * CROSSDOMAIN ONLY
			 * [Warning - During Development: Crossdomain Authentication]
			 * If you ever need crossdomain development, we recommend that you TURN OFF local server's auth layer/middleware.
			 */
			protocol: '', //https or not? default: '' -> http
			host: '127.0.0.1', 
			port: '5000',
			username: 'admin',
			password: '123'
			/*----------------*/
		},


		//Pre-set RESTful API configs (see Application.API core module) - Modify this to fit your own backend apis.
		api: {
			//_Default_ entity is your fallback entity, only register common api method config to it would be wise, put specific ones into your context.module.
			_Default_: {
				data: {
					read: {
						type: 'GET',
						url: function(entity, category, method, options){
							if(options.model && options.model.id){
								return '/' + category + '/' + entity + '/' + options.model.id;
							}else {
								return '/' + category + '/' + entity;
							}
						},
						parse: 'payload',
					},
					create: {
						type: 'POST',
						url: function(entity, category, method, options){
							return '/' + category + '/' + entity;
						},
						parse: 'payload',
					},
					update: {
						type: 'PUT',
						parse: 'payload',
						url: function(entity, category, method, options){
							return '/' + category + '/' + entity + '/' + options.model.id;
						}

					},
					'delete': {
						type: 'DELETE',
						url: function(entity, category, method, options){
							return '/' + category + '/' + entity + '/' + options.model.id;
						}
					}
				}
			}
		
		}

	});

})(Application);