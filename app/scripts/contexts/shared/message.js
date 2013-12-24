/**
 * This is the Shared.Notify module which renders the Application Error/Critical Messages array as well as Prompts.
 *
 * @author Tim.Liu
 * @create 2013.12.22
 */

;(function(app){

	var context = app.Context.Shared;
	var module = context.module('Notify');

	_.extend(module, {

		View: {

			MessageCount: Backbone.Marionette.ItemView.extend({
				template: '#custom-module-shared-notify-message-count-tpl',
				className: 'message-count-ui',
				tagName: 'a',
				initialize: function(options){
					this.enableActionTags('Shared.Notify.MessageCount');
					this.autoDetectUIs();
					this.msgQ = app.getMessages();
					this.listenTo(app, 'app:message', function(opt){
						this.previewMessage(opt);
						this.countMessages();
					});
					this.listenTo(this.msgQ, 'remove reset', this.countMessages);
				},

				onRender: function(){
					this.countMessages();
				},

				previewMessage: function(opt){
					if(!this.ui.msg) return;
					this.ui.msg.html(_.string.prune(opt.data.text, 50));
					this.ui.msg.finish().fadeIn().delay(5*1000).fadeOut(); //use finish() to cleanup the animation Q
				},

				countMessages: function(){
					if(!this.ui.count) return;
					if(this.msgQ.size() === 0) this.ui.count.hide();
					else {
						this.ui.count.html(this.msgQ.size());
						this.ui.count.show();
					}
				},

				actions: {
					showMessageBox: function(){
						console.log('TBI');
					}
				}
			}),

			// MessageBox: Backbone.Marionette.CollectionView.extend({
			// 	itemView: Backbone.Marionette.ItemView.extend({
			// 		template: '#custom-module-shared-notify-message-box-item-tpl'
			// 		tag
			// 	}),


			// })

		}

	});

})(Application);

Template.extend(
	'custom-module-shared-notify-message-count-tpl',
	[
		'<span ui="msg" class="preview hide" style=""></span> ',
		'<span action="showMessageBox" style="cursor:pointer;">',
			'<i class="icon-envelope"></i> Message ',
			'<i ui="count" class="count img-circle"></i>',
		'</span>'
	]
);

Template.extend(
	'custom-module-shared-notify-message-box-item-tpl',
	[
		' '
	]
);
