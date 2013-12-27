/**
 * This is the Shared.Prompt module that renders a dialog(modal or window div) on screen upon app:prompt event.
 * Pre-defined dialogs are:
 * 1. confirm - with a text/html/view as question and Yes/No buttons; - $.overlay()
 * 2. alert - with a text/html/view as content and Close button; - $.overlay()
 * 3. window - with html/view as content; - jquery ui dialog can move around
 *
 * Confirm (opt.data)
 * -------
 * $container: ($('body'))
 * icon: icon class string (icon-question-sign)
 * question: string or html or el or a function() that returns them. (Are you sure about this?)
 * ok: ok callback
 * cancel: cancel callback
 * context: callback function context
 *
 * Alert (opt.data)
 * -----
 * $container: ($('body'))
 * title:  
 * icon: 
 * message: string or html or el or a function() that returns them.
 * buttons: $.overlay buttons options
 *
 * Window (opt.data)
 * -----
 * $container: ($('body'))
 * move: true
 * all other $.overlay options
 * 
 * @author Tim.Liu
 * @create 2013.12.25
 */

;(function(app){

	var context = app.Context.Shared;
	var module = context.module('Prompt');

	//dispatch various 
	module.listenTo(app, 'app:prompt', function(opt){
		var config;
		opt.data = opt.data || {};
		if(!opt.data.$container) opt.data.$container = 'body';
		if(_.isString(opt.data.$container)) opt.data.$container = $('body');

		switch(opt.type){
			case 'confirm':
				//default overlay config for confirm.
				config = {
					title: opt.data.question || 'Are you sure about this?',
					titleIcon: 'icon-question-sign',
					hrCSS: false,
					buttons: [{
						title: 'Ok',
						icon: 'icon-ok',
						fn: opt.data.ok,
						context: opt.data.context
					},{
						title: 'Cancel',
						icon: 'icon-remove',
						fn: opt.data.cancel || function($el){$el.overlay(false)},
						context: opt.data.context
					}]					
				};
				opt.data.$container.overlay(config);
			break;
			case 'alert':
				//default overlay config for alert.
				
			break;
			case 'window':
			break;
			default: 
			break;
		}
	})

	_.extend(module, {

		View: {

		}

	});

})(Application);

Template.extend(
	//non-modal/alert
	'custom-module-shared-notify-prompt-confirm-tpl',
	[
		' '
	]
);

Template.extend(
	//modal/alert - overlay - static
	'custom-module-shared-notify-prompt-alert-tpl',
	[
		' '
	]	
);

Template.extend(
	//modal/alert - overlay - movable ?
	'custom-module-shared-notify-prompt-dialog-tpl',
	[
		' '
	]
);