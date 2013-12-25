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
					this.listenTo(app, 'view:resized', function(){
						this.adjustMsgBoxPosition();
					});
				},

				onRender: function(){
					this.countMessages();
					//prepare msg box
					if(this.box) this.box.close();
					else this.box = new module.View.MessageBox();
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
					if(!this.box) return;
					if($anchor) {
						this.box.$anchor = $anchor;
					}
					this.box.flyTo({
						my: 'center top',
						at: 'center bottom+20',
						of: this.box.$anchor
					});
				},

				actions: {
					showMessageBox: function($action){
						this.adjustMsgBoxPosition($action);
					}
				}
			}),

			MessageBox: Backbone.Marionette.CollectionView.extend({
				className: 'message-box-ui',
				itemView: Backbone.Marionette.ItemView.extend({
					template: '#custom-module-shared-notify-message-box-item-tpl',
					className: 'item'
				}),
				initialize: function(options){
					this.collection = app.getMessages();
				},

				flyTo: function(options){
					if(!this.$el){
						$('body').append(this.render().el);
						this.$el.hide();				
					}
					this.$el.show();
					this.$el.position(options);
				},

				hide: function(){
					this.$el.hide();
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
		'<i class="icon-{{type}}"></i> <span>{{data.text}}</span>'
	]
);
