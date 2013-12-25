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
						this.previewMessage(opt, _.bind(this.countMessages, this));
					});
					this.listenTo(this.msgQ, 'remove reset', this.countMessages);
					this.box = new module.View.MessageBox();
					this.listenTo(app, 'view:resized', function(){
						if(this.box.shown) this.adjustMsgBoxPosition();
					});						
				},

				onRender: function(){
					this.countMessages();
				},

				previewMessage: function(opt, complete){
					if(!this.ui.msg) return;
					this.ui.msg.html(_.string.prune(opt.data.text, 50));
					if(opt.type === 'error'){ //we only highlight error msg in red.
						this.ui.msg.addClass('text-error');
					}else{
						this.ui.msg.removeClass('text-error');
					}
					this.ui.msg.finish().fadeIn().delay(4*1000).fadeOut({complete: complete}); //use finish() to cleanup the animation Q
				},

				countMessages: function(){
					if(!this.ui.count) return;
					if(this.msgQ.size() === 0) this.ui.count.hide();
					else {
						this.ui.count.html(this.msgQ.size());
						this.ui.count.show();
					}
				},

				adjustMsgBoxPosition: function($anchor){
					if($anchor) {
						this.box.$anchor = $anchor;
					}
					this.box.flyTo({
						my: 'center top',
						at: 'center bottom+10',
						of: this.box.$anchor,
						collision: 'fit'
					});
				},

				actions: {
					showMessageBox: function($action){
						if(!this.box.shown)
							this.adjustMsgBoxPosition($action);
						else
							this.box.hide();
					}
				}
			}),

			MessageBox: Backbone.Marionette.CollectionView.extend({
				className: 'message-box-ui',
				itemView: Backbone.Marionette.ItemView.extend({
					template: '#custom-module-shared-notify-message-box-item-tpl',
					className: 'item',
					onRender: function(){
						this.$el.data('entry', this.model);
					}
				}),
				initialize: function(options){
					this.collection = app.getMessages();
					this.enableFreeFlow();
					this.enableActionTags('Shared.Message.MsgBox');
				},

				actions: {
					remove: function($action){
						$action.parent().data('entry').destroy();
					}
				}
			})

		}

	});

})(Application);

Template.extend(
	'custom-module-shared-notify-message-count-tpl',
	[
		'<span ui="msg" class="preview hide" style=""></span> ',
		'<span ui="msg-box-trigger" action="showMessageBox" style="cursor:pointer;position:relative;">',
			'<i class="icon-envelope"></i> Message ',
			'<i ui="count" class="count img-circle"></i>',
		'</span>'
	]
);

Template.extend(
	'custom-module-shared-notify-message-box-item-tpl',
	[
		'<i class="icon-{{type}}"></i> <span {{#is type "error"}}class="text-error"{{/is}}>{{data.text}}</span> <span class="pull-right remove" action="remove"><i class="icon-remove"></i></span>'
	]
);
