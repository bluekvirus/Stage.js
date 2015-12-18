;(function(app){

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

	app.regional('Demo.Notify', {
		template: [
			'<h1>Notification Examples</h1>',
			'<hr/>',
			'<div style="position:relative">',
				'<span class="btn btn-small btn-primary" action="overlay">Overlay</span> ',
				'<span class="btn btn-small btn-danger" action="msg" data-type="danger">Critical</span> ',
				'<span class="btn btn-small btn-success" action="msg" data-type="success">Success</span> ',
				'<span class="btn btn-small btn-warning" action="msg" data-type="warning">Warning</span> ',
				'<span class="btn btn-small btn-info" action="msg" data-type="info">Information</span> ',
				'<span class="btn btn-small btn-default" action="msg" data-type="ok"><i class="fa fa-fort-awesome"></i> OK</span> ',
				'<span class="btn btn-small btn-default" action="msg" data-type="error"><i class="fa fa-reddit-alien"></i> Error</span> ',
			'</div>'
		],
		effect: 'roll',
		data: {
			//default notification (theme custom)
			danger: {title: 'Oh snap!', msg: '<a href="#" class="alert-link">Change a few things up</a> and try submitting again.'},
			success: {title: 'Well done!', msg: 'You successfully read <a href="#" class="alert-link">this important alert message</a>.'},
			warning: {title: 'Warning!', msg: 'Best check yo self, you\'re not looking too good. <a href="#" class="alert-link">vel scelerisque nisl consectetur et</a>.'},
			info: {title: 'Heads up!', msg: 'This <a href="#" class="alert-link">alert needs your attention</a>, but it\'s not super important.'},
			
			//icon notification (theme awesome)
			ok: {title: 'Your Download is Ready!', msg: '1.4 GB', icon: 'fa fa-fort-awesome', more: 'my_birthday.mp4'},
			error: {title: 'Your Download is Blocked!', msg: '1.4 GB', icon: 'fa fa-reddit-alien', more: 'my_birthday.mp4'}
		},
		actions: {
			overlay: function(){
				(new Overlay()).overlay();
			},

			msg: function($btn, e){
				var note = this.get($btn.data('type'));
				app.notify(note.title, note.msg, $btn.data('type'), {more: note.more, icon: note.icon});
			}
		}

	});

})(Application);