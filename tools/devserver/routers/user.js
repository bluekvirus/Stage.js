/**
 * The User router
 *
 * @author Tim Lauv
 * @created 2013.10.26
 * @updated 2015.09.29
 */

module.exports = function(server){

	var router = server.mount(this),
	profile = server.get('profile');
	server.secure(router);

	//login
	router.post('/login', function(req, res, next){
		if(!req.session) return next();
		if(!req.session.username){

			//Warning: No password hashing...not for production use.
			var pass = profile.auth.users[req.body.username] && (profile.auth.users[req.body.username].password === req.body.password);
			
			if(pass){
				req.session.username = req.body.username;
				req.session.permissions = profile.auth.users[req.session.username].permissions;
				return res.json({msg: 'user logged in', username: req.session.username});
			}
			return res.status(401).json({msg: 'user id or password incorrect...'});

		}
		return res.json({msg: 'user already logged in', username: req.session.username});

	});
	
	//logout
	router.post('/logout', function(req, res, next){
		if(!req.session) return next();

		var username = req.session.username;

		if(username){
			req.session.destroy();
			return res.json({msg: 'user logged out', username: username});
		}

		return res.json({msg: 'no user session found...'});
	});
	
	//touch
	router.get('/touch', function(req, res, next){
		if(!req.session) return next();
		return req.session.username ? res.json(req.session) : res.status(401).json({msg: 'no user session yet...'});
	});

};