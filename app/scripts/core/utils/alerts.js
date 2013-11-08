/**
 * ======================================
 * Message & Notifycations:
 * 1. console log, error...
 * 2. app.err, success, inform, prompt...
 * 3. ajax err, success, unauth...
 *
 * 
 * @author Tim.Liu
 * @created 2013.04.01
 * @updated 2013.11.08
 * ======================================
 */
;(function(){

	console = window.console || {log:function(){},error:function(){}};

	if(noty){
		if(window.error) console.log('!!WARNING::error notification function conflict!!');
		/**
		 * Notify the user about application error.
		 *
		 * @arguments Error Type
		 * @arguments Messages ,...,
		 */
		Application.error = function(){
			arguments = _.toArray(arguments);
			var cb = arguments.pop();
			if(!_.isFunction(cb)){
				arguments.push(cb);
				cb = undefined;
			} 
			noty({
				text: '<span class="label label-inverse">'+arguments[0]+'</span> '+arguments.slice(1).join(' '),
				type: 'error',
				layout: 'bottom',
				dismissQueue: true,
				callback: {
					afterClose: cb || $.noop
				}
			});
		};

		/** 
		 * Notify the user about successful data submission.
		 */
		Application.success = function(msg, cb){
			if(_.isFunction(msg)){
				cb = msg;
				msg = undefined;
			}
			noty({
				text: '<span>' + (msg || 'Operation Complete' ) + '</span>',
				type: 'success',
				layout: 'center',
				timeout: 800,
				dismissQueue: true,
				callback: {
					afterClose: cb || $.noop
				}				
			});
		};

		/**
		 * Prompt the user if they are sure about this...
		 */
		Application.prompt = function(question, type, okCb, cancelCb, closeCb){

			//TODO:: Mask/Disable user interactions first.

			noty({
				text: question,
				type: type,
				layout: 'center',
				buttons: [
					{addClass: 'btn btn-primary', text: 'Yes', onClick:function($noty){
						$noty.close();
						okCb();
					}},
					{addClass: 'btn', text: 'Cancel', onClick:function($noty){
						$noty.close();
						if(cancelCb)
							cancelCb();
					}}
				],
				callback: {
					afterClose: closeCb || $.noop
				}
			});
		};

		/**
		 * Special information
		 */
		Application.inform = function(){
			arguments = _.toArray(arguments);
			noty({
				text: '<span class="label label-inverse">'+arguments[0]+'</span> '+arguments.slice(1).join(' '),
				type: 'information',
				layout: 'center',
				timeout: 5000,
				dismissQueue: true,				
			});
		};


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
	}

})();