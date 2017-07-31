/**
 * Custom middleware script for JSON Web Token(JWT).
 *
 * Usage:
 * 	1). Use server.jwt to generate a token and provide it to user through certain apis. e.g. /sample/jwt/login
 * 	2).	This middleware checkes for the "Authorization" property in the header. 
 * 		If such property exists it fetches the token, and checks whether the token is valid. 
 * 		If the token is valid, it allows the request to continue; otherwise it returns a 403 error.
 * 		
 * 	NOTE: In order to accommodate stage.js, currently assume the schema is Bearer. 
 * 		  If you change the schema in the front end, you might need to change the verification process here.
 *
 * @author Patrick Zhu
 * @created 2017.07.24
 */

//require jsonwebtoken package
var jwt = require('jsonwebtoken');

module.exports = function(server){

	var profile = server.get('profile');

	//1. setup something here upon middleware loading
	//e.g db/store connection, global server vars...

	//This is a pair of randomly generated 512 bit public and private key, hard coded for demo purpose.
	//If you are using RSA algorithm, then
	//	1). when encrypting JSON web token you need to use private key
	//	2). when verifying JSON web token you need to use public key
	var	privateKey = '-----BEGIN RSA PRIVATE KEY-----\n' +
					'MIIBOQIBAAJBAL6PXZumZ/W4WlfAJCEfENDqxoUlIdUSdBptgx+HK0idsoQV8kTt\n' +
					'ol/XY16rrvqrbx8f1VKelRrUlgs116Ii0+cCAwEAAQJARv/fnri3j0Pq1TsPuw96\n' +
					'En0HDmCxZFQF0jrvWfXg2KLTkiVhszCgbTrJdZq0H28aapF062uVShpPpSsxouRm\n' +
					'MQIhAPQNmCGDVTr2r/AShf/FTfzrQDrMooY/yHKlsx1tjfADAiEAx+NpNJRdFs+M\n' +
					'vX/lFZ2K+DFGVPZ+jmh7UGDuSRTV4U0CIBxLTy3jeggh/XfJzfs/NrFx3Lp0awtB\n' +
					'bc3M5B0vTFtdAiAhjymrnTkfykrLyfwxK9kYIFW5kAThbeM+NHftJyVdhQIgBcSp\n' +
					'VksCM4JoEWH5zZMjv19YPVE9JjTaLPO5MTbfc2M=\n' +
					'-----END RSA PRIVATE KEY-----';

	var publicKey = '-----BEGIN PUBLIC KEY-----\n' +
					'MFwwDQYJKoZIhvcNAQEBBQADSwAwSAJBAL6PXZumZ/W4WlfAJCEfENDqxoUlIdUS\n' +
					'dBptgx+HK0idsoQV8kTtol/XY16rrvqrbx8f1VKelRrUlgs116Ii0+cCAwEAAQ==\n' +
					'-----END PUBLIC KEY-----\n';

	//server.jwt for encrypting the token
	server.jwt = function(claim){
		//generate json web token 
		var token = jwt.sign(claim, privateKey, {algorithm: 'RS256'});
		return token;
	};

	//2.a return a factory function to further config your middleware; [suggested]
	//2.b skip this factory function and return the middleware directly; [optional, zero-configuration]
	return function(options){

		//prepare your middleware according to options

		return function(req, res, next){
			var validFlag = true,
				authorization = req.header('Authorization'),
				decoded;

			//get token, if there is authorization
			if(authorization){
				bearerToken = req.header('Authorization').split(" ")[1];//Bearer schema has a "Bearer" at string at the beginning of the token, ignore it when verify.
			}

			//decrypt the token to see if it is valid or not.
			//check whether the request has a "Authorization" property in header(default in stage.js)
			if( authorization && bearerToken && bearerToken !== 'NOTOKEN'){
				//Caveat: Do NOT use callback function provided by "jsonwebtoken", it is asynchronous.
				//Use catch and try to provide synchronous operation.
				//Reference: https://github.com/auth0/node-jsonwebtoken.
				try{
					decoded = jwt.verify(bearerToken, publicKey, { algorithms: ['RS256'] });
				}catch(err){
					res.status(403).json({msg: 'Unathorized user for JSON web token....'});
				}
			}

			//give the decoded information to the request
			req.token = decoded;

			//continue for successful decoding or no jwt situation
			next();
		};

	};

};