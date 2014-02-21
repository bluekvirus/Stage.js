/**
 * This is the Shared.Prompt module that renders a dialog(modal or window div) on screen upon app:prompt event.
 * Pre-defined dialogs are:
 * 1. confirm - with a text/html/view as question and Yes/No buttons; - $.overlay()
 * 2. alert - with a text/html/view as content and optional action/decision buttons; - $.overlay()
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
					titleIcon: opt.data.icon || 'icon-question-sign',
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
					}],
					buttonsAlign: 'center'					
				};				
			break;
			case 'alert':
				//default overlay config for alert.
				config = {
					content: opt.data.message || 'This is an alert!',
				}
				_.extend(config, _.pick(opt.data, 'buttons', 'buttonsAlign'));
			break;
			case 'window':
				config = _.extend(opt.data, {move: true, resize: true});
			break;
			default: 
				//hook up your prompt dispatcher(type->view) here or override the above common ones.
			break;
		}

		if(config) opt.data.$container.overlay(config);
	})

	// _.extend(module, {
	// 	View: {
	// 		--define your common overlay content view to be prompted here--
	// 	}
	// });

})(Application);

//To be refined in your own project as the content view tpl for common confirm alert and dialog/window 
// Template.extend(
// 	//non-modal/alert
// 	'custom-module-shared-notify-prompt-confirm-tpl',
// 	[
// 		' '
// 	]
// );

// Template.extend(
// 	//modal/alert - overlay - static
// 	'custom-module-shared-notify-prompt-alert-tpl',
// 	[
// 		' '
// 	]	
// );

// Template.extend(
// 	//modal/alert - overlay - movable ?
// 	'custom-module-shared-notify-prompt-dialog-tpl',
// 	[
// 		' '
// 	]
// );