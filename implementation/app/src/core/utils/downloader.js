/**
 * ================================
 * Application universal downloader
 *
 *
 * @author Tim.Liu
 * @created 2013.04.01
 * @updated 2013.11.08
 * ================================
 */
;(function(){

	var _downloader = function(server, ticket){
	    var drone = $('#hiddenframe');
	    if(drone.length > 0){
	    }else{
	        $('body').append('<iframe id="hiddenframe" style="display:none"></iframe>');
	        drone = $('#hiddenframe');
	    }
	    drone.attr('src', (ticket.url || server)+'?name='+ticket.name+'&file='+ticket.file+'&type='+ticket.type);
	};

	Application.downloader = function(ticket){
		return _downloader('/download', ticket);
	}

})();