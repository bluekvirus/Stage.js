/**
 * The Role router, depends on a db middleware (req.db).
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

	//var collection = server.get('db').collection(router.meta.entity);

	//map (api-token-map)
	router.get('/api-token-map', router.token('create'), function(req, res, next){
		if(!req.session) return next();
		return res.json(server.get('api-token-map'));
	});
		
	//crud
	server.crud(router);
};