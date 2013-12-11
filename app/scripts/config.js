;(function(Application){

	/**
	 * ================================
	 * Global Configure
	 * ================================
	 */
	Application.config = _.extend(Application.config || {}, {

		appContext: 'Admin', //This is the context the application will sit on upon loading.
		fullScreen: true, //If set true, we will be tracking application body size upon window resizing events and put values in Application.fullScreenContextHeight as reference.
						  //Note that this also indicates <body> will have overflow set to hidden in its css.

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

			_Default_: {
				data: {
					read: {
						type: 'GET',
						url: function(namespace, data, params, options){
							var spaces = namespace.split('.');
							if(options.model && options.model.id){
								return '/data/' + spaces[0] + '/' + options.model.id;
							}else {
								return '/data/' + spaces[0];
							}
						},
						// parse: function(resp, options){
						// 	//TBI
						// }
					},
					create: {
						type: 'POST'
					},
					update: {
						type: 'PUT'
					},
					'delete': {
						type: 'DELETE'
					}
				}
			}
		
		}

	});

})(Application);