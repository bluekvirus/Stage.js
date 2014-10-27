/**
 * The User router (entity) - including roles, depends on the db middleware.
 *
 * +data scheme (validators - joi)
 * +space rule
 * +mutex rules
 *
 * @author Tim Liu
 * @created 2014.10.26
 */

module.exports = function(server){

	var router = server.mount(this);
	server.secure(router, 'read', 'modify', 'debug', 'role.manage');

	//- /
		//login
	
		//logout
	
		//session (info)
		
		//create/read/update/delete
	
	//- /role/
		//map (api-token-map)
		//create/read/update/delete
};