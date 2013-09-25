;(function(Application){

	/**
	 * ================================
	 * Global Configure
	 * ================================
	 */
	$.ajax({url: '/loadappconfig',async: false,timeout: 200,
		success: function(cfg){
			Application.config = cfg;
		}
	});
	Application.config = _.extend(Application.config || {}, {

		appContext: 'Admin', 
		//TBI: appContext will be replaced by some sub-module dispatcher later. since we want the Login (before login) and App (after login) to be the two super contex.
		//We want the Admin to be a sub-context module under App...

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

		/*Override ONLY IF 
			A: want to use a query param for server side routing
			B: the server application lives in sub-folder of your WEB_ROOT like /admin
		*/
		baseURI: '', //can be /?dispatch= if server doesn't support URI-REWRITE by default. [do not add ?a=b or &a=b... here]

		/*Override Web API - defaults came from the server side config*/ 
		//apiBase: {}, - see server side /config folder.

	});

})(Application);