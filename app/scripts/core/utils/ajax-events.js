/**
 * The AJAX Global Events Listeners - for errors, success, start, stop event notification/progress bar
 *
 * @author Tim.Liu
 * @create 2013.12.19
 */

;(function(){

	/**
	 * Default SUCCESS/ERROR reporting on ajax op globally.
	 * Success Notify will only appear if ajax options.notify = true
	 */
	$(document).ajaxSuccess(function(event, jqxhr, settings){
		if(settings.notify)
			Application.success();
	});

	$(document).ajaxError(function(event, jqxhr, settings, exception){
		if(settings.notify === false) return;
		try{
			var errorStr = $.parseJSON(jqxhr.responseText).error;
		}catch(e){
			var errorStr = errorStr || exception;
		}
		var cb = '';
		if(exception === 'Unauthorized'){
			cb = function(){
				window.location.reload();
			}
		}
			Application.error('Server Error', settings.type, settings.url.split('?')[0], '|', errorStr, cb);
	});

	$(document).ajaxStart(function() {
		NProgress.start();
	});

	$(document).ajaxStop(function() {
		NProgress.done();
	});
	


})();