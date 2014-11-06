/**
 * (depends on a specific db middleware)
 */
module.exports = function(server){
	var m = server.model(this, {});

	m.on('read', function(){
		console.log('read');
	});

	return m;
};