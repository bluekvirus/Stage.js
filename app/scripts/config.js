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

		crossdomain: {
			//enabled: true,
			/**
			 * CROSSDOMAIN ONLY
			 * [Warning - During Development: Crossdomain Authentication]
			 * If you ever need crossdomain development, we recommend that you TURN OFF the server side authenticaion(thus authorization) on the remote server.
			 * You can still have your local app host server enabling the authentication layer 
			 * (just for the login page tho, the authorization filters on routes will have no effects here since you are fetching data from the remote server)
			 *
			 * If you do need authorization during crossdomain development, please consider using a 'TOKEN', TBI...
			 */
			protocol: '', //https or not? default: '' -> http
			host: '127.0.0.1', 
			port: '5000',
			token: '', //TBI:: no in effect yet, this will most likely be a encoded user id, e.g (encode('admin'))
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