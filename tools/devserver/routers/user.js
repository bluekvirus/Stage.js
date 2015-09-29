/**
 * The User router, depends on a specific db middleware(req.db).
 * 
 * +space rule
 * +mutex rules
 *
 * @author Tim Liu
 * @created 2013.10.26
 */

module.exports = function(server){

	var router = server.mount(this);
	server.secure(router);

	//login
	router.post('/login', function(req, res, next){
		if(!req.session) return next();
		if(!req.session.username){

			var pass = false;
			//TBI: find record and compare login
			
			if(pass){
				req.session.username = ''; //TBI
				req.session.permission = []; //TBI
				return res.json({msg: 'user logged in', username: req.session.username});
			}
			return res.status(401).json({msg: 'user id or password incorrect...'});

		}
		return res.json({msg: 'user already logged in', username: req.session.username});

	});
	
	//logout
	router.post('/logout', function(req, res, next){
		if(!req.session || !req.session.username) return next();

		var username = req.session.username;
		req.session.destroy();
		//TBI: update record - last logged in

		return res.json({msg: 'user logged out', username: username});
	});
	
	//touch (data + cookie)
	router.get('/touch', router.token('debug'), function(req, res, next){
		if(!req.session) return next();
		return req.session.username ? res.json(req.session) : res.status(401).json({msg: 'no user session yet...'});
	});

};