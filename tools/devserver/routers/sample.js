/**
 * Sample express.router() code
 *
 * @author Tim.Liu
 * @created 2014.04.18
 */

module.exports = function(server){

	var router = server.mount(this);

	router.get('/', function(req, res, next){
		res.json('{hello: true}');
	});

}