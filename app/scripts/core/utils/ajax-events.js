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
			Application.success('Operation Successful', '|', settings.type, settings.url.split('?')[0]);
	});

	$(document).ajaxError(function(event, jqxhr, settings, exception){
		if(settings.notify === false) return;
		try{
			var errorStr = $.parseJSON(jqxhr.responseText).error;
		}catch(e){
			var errorStr = errorStr || exception;
		}
		Application.error(errorStr, '|', settings.type, settings.url.split('?')[0]);
	});

	$(document).ajaxStart(function() {
		NProgress.start();
	});

	$(document).ajaxStop(function() {
		NProgress.done();
	});
	


})();