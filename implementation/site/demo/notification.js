;(function(app){

	//rewire app:error, app:success, app:info, app:warning
	app.onError = function(error){
		console.log(error);
	}

	//custom view as overlay
	var Overlay = app.view({
		overlay: true,
		template: [
		  '<div class="modal-dialog text-left">',
		    '<div class="modal-content">',
		      '<div class="modal-header">',
		        '<button type="button" class="close" data-dismiss="modal" aria-hidden="true" action="close">×</button>',
		        '<h4 class="modal-title">Modal title</h4>',
		      '</div>',
		      '<div class="modal-body">',
		        '<p>One fine body…</p>',
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
		}

	});

	app.regional('Notify', {
		className: 'container',
		template: [
			'<h1>Notification Examples</h1>',
			'<hr/>',
			'<span class="btn btn-small btn-primary" action="overlay">Overlay</span> ',
			'<span class="btn btn-small btn-danger" action="msg" type="error">Critical</span> ',
			'<span class="btn btn-small btn-success" action="msg" type="success">Success</span> ',
			'<span class="btn btn-small btn-warning" action="msg" type="warning">Warning</span> ',
			'<span class="btn btn-small btn-info" action="msg" type="info">Information</span> '
		],
		actions: {
			overlay: function(){
				(new Overlay).overlay();
			},

			msg: function($btn, e){
				app.trigger('app:' + $btn.attr('type'));
			}
		}

	});

})(Application);