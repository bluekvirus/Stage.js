;(function(app){


	//custom message bus view (a collection of the alerts)
	var MsgBus = app.view({
		type: 'CollectionView',
		itemView: '#dynamic#',
		coop: ['test-coop'],
		buildItemView: function(item, ItemViewType, itemViewOptions){
			// build the final list of options for the item view type
			var options = _.extend({model: item}, itemViewOptions);
			// create the item view instance
			var MsgItem = MsgTypes[item.get('type')];
			var view = new MsgItem(options);

			view.onClose = function(){
				//remove msg from bus? TBI
			};
			// return it
			return view;
		},
		onShow: function(){
			var that = this;
			//rewire app:error, app:success, app:info, app:warning
			_.each(['error', 'success', 'info', 'warning'], function(type){
				app['on' + _.string.classify(type)] = function(msg){
					that.trigger('view:msg', {type: type, msg: msg});
					console.log(msg);
				};
			});
		},
		onMsg: function(msg){
			if(!this.collection) this.trigger('view:render-data', []);
			this.collection.add(msg);
		},
		onTestCoop: function(options){
			console.log(this.isInDOM(), options);
		}	
	});

	//custom view as error, success, info and warning alerts
	var MsgTypes = {
		error: app.view({
			template: [
				'<div class="alert alert-dismissable alert-danger">',
				 	'<button type="button" class="close" data-dismiss="alert">×</button>',
				 	'{{#unless msg}}',
						'<strong>Oh snap!</strong> <a href="#" class="alert-link">Change a few things up</a> and try submitting again.',
					'{{else}}',
						'{{msg.errorThrown}}',
					'{{/unless}}',
				'</div>'
			]
		}),

		success: app.view({
			template: [
				'<div class="alert alert-dismissable alert-success">',
					'<button type="button" class="close" data-dismiss="alert">×</button>',
					'<strong>Well done!</strong> You successfully read <a href="#" class="alert-link">this important alert message</a>.',
				'</div>'
			]
		}),

		info: app.view({
			template: [
				'<div class="alert alert-dismissable alert-info">',
  					'<button type="button" class="close" data-dismiss="alert">×</button>',
  					'<strong>Heads up!</strong> This <a href="#" class="alert-link">alert needs your attention</a>, but it\'s not super important.',
				'</div>'
			]
		}),

		warning: app.view({
			template: [
				'<div class="alert alert-dismissable alert-warning">',
				'  <button type="button" class="close" data-dismiss="alert">×</button>',
				'  <h4>Warning!</h4>',
				'  <p>Best check yo self, you\'re not looking too good. <a href="#" class="alert-link">vel scelerisque nisl consectetur et</a>.</p>',
				'</div>',
			]
		})
	};

	//custom view as overlay
	var Overlay = app.view({
		overlay: true,
		type: 'Layout',
		template: [
		  '<div class="modal-dialog text-left">',
		    '<div class="modal-content">',
		      '<div class="modal-header">',
		        '<button type="button" class="close" data-dismiss="modal" aria-hidden="true" action="close">×</button>',
		        '<h4 class="modal-title">Modal title</h4>',
		      '</div>',
		      '<div class="modal-body" region="body" >', //view="OverlayBody"
		      '</div>',
		      '<div class="modal-footer">',
		        '<button type="button" class="btn btn-default" data-dismiss="modal" action="close">Close</button>',
		        '<button type="button" class="btn btn-primary">Save changes</button>',
		      '</div>',
		    '</div>',
		  '</div>'
		],
		actions: {
			close: function(){
				this.close();
			}
		},
		onShow: function(){
			this.body.trigger('region:load-view', 'OverlayBody');
		}

	});
	app.view({
		name: 'OverlayBody',
		template: '<p>One fine body…</p>' 
	});

	app.regional('Notify', {
		template: [
			'<h1>Notification Examples</h1>',
			'<hr/>',
			'<div style="position:relative">',
				'<span class="btn btn-small btn-primary" action="overlay">Overlay</span> ',
				'<span class="btn btn-small btn-danger" action="msg" type="error">Critical</span> ',
				'<span class="btn btn-small btn-success" action="msg" type="success">Success</span> ',
				'<span class="btn btn-small btn-warning" action="msg" type="warning">Warning</span> ',
				'<span class="btn btn-small btn-info" action="msg" type="info">Information</span> ',
				'<div region="msg-bus" style="position:absolute;right:0;top:0;width:360px;"></div>',
			'</div>'
		],
		effect: 'roll',
		onShow: function(){
			this.getRegion('msg-bus').show(new MsgBus());
		},
		actions: {
			overlay: function(){
				(new Overlay()).overlay();
			},

			msg: function($btn, e){
				app.trigger('app:' + $btn.attr('type'));
			}
		}

	});

})(Application);