/**
 * The User router, depends on a db middleware (req.db).
 * 
 * +space rule
 * +mutex rules
 *
 * @author Tim Liu
 * @created 2014.10.26
 */

module.exports = function(server){

	var router = server.mount(this);
	server.secure(router, 'debug');

	var collection = server.get('db').collection(router.meta.entity);

	//login
	router.post('/login', function(req, res, next){
		if(!req.session) return next();
		if(!req.session.username){

			//TBI: go into db find record and compare hash

			return res.json({msg: 'user logged in', username: req.session.username});
		}
		return res.json({msg: 'user already logged in', username: req.session.username});

	});
	
	//logout
	router.post('/logout', function(req, res, next){
		if(!req.session) return next();
		var username;
		if(req.session.username) {
			username = req.session.username;
			req.session.destroy();

			//TBI: go into db update record - last logged in
		}
		return res.json({msg: 'user logged out', username: username});
	});
	
	//session (data + cookie)
	router.get('/session', router.token('debug'), function(req, res, next){
		if(!req.session) return next();
		return req.session.username ? res.json(req.session) : res.json({});
	});

	//override basic crud 
	// router.get('/', function(req, res, next){
	// 	next('Overriden...');
	// });	
		
	//crud
	server.crud(router);

};