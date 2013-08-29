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
	})
	Application.config = _.extend(Application.config || {}, {

		crossdomain: {
			//enabled: true,
			/*CROSSDOMAIN ONLY*/
			protocol: '', //https or not? default: '' -> http
			host: '127.0.0.1', 
			port: '4000',
			/*----------------*/
		},

		/*Override ONLY IF 
			A: want to use a query param for server side routing
			B: the server application lives in sub-folder of your WEB_ROOT like /admin
		*/
		baseURI: '', //can be /?dispatch= if server doesn't support URI-REWRITE by default.

		/*Override Web API - defaults came from the server side config*/ 
		//apiBase: {},

	});

})(Application);