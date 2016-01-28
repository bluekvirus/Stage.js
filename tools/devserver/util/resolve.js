/**
 * The server file path resolve helper
 *
 * @author Tim Lauv
 * @created 2016.01.27
 */

var path = require('path');

module.exports = function(server){

	var profile = server.get('profile');

	///////////////////use this to resolve all server file path/////////////////// 
	server.resolve = function(filePath){
		var relative = filePath.match(/^\//) ? '/' : profile.root;
		return path.resolve(path.join(relative, filePath));
	};

};