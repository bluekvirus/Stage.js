/**
 * Application universal downloader
 *
 * Usage
 * -----
 * app.download(url, {params:{...}})
 * 	
 * 	or
 * 
 * app.download({
 * 	 url:
 * 	 params: {...}
 * })
 *
 * @author Tim Lauv
 * @created 2013.04.01
 * @updated 2013.11.08
 * @updated 2014.03.04
 * @updated 2016.12.14
 */
;(function(app){

	function downloader(ticket, options){
	    var drone = $('#hidden-download-iframe');
	    if(drone.length > 0){
	    }else{
	        $('body').append('<iframe id="hidden-download-iframe" style="display:none"></iframe>');
	        drone = $('#hidden-download-iframe');
	    }
	    
	    //backward compatible ({url: ..., reset of keys as query params directly} still works)
	    if(_.isPlainObject(ticket))
	    	ticket.params = _.extend({}, ticket.params, ticket.querys, _.omit(ticket, 'url', 'params', 'querys'));

	    if(_.isString(ticket)){
	    	ticket = {url: ticket};
	    	_.extend(ticket, options);
	    }

	    drone.attr('src', (app.uri(ticket.url || '/').addQuery(ticket.params)).toString());
	}

	app.Util.download = downloader;

})(Application);