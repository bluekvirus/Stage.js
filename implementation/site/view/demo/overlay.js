;(function(app){

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

	app.view('Demo.Overlay', {
		template: [
			'<div class="row">',
				'<div class="col-md-4" style="margin-top:15em;">',
					'<div class="row">',
						'<div class="col-md-6">',
							'<span class="btn btn-small btn-primary" action="overlay-body">overlay on body.</span>',
							'<div style="color:#999;">(new View()).overlay()</div>',
						'</div>',
					'</div>',
				'</div>',
				'<div class="col-md-8" style="margin-top:4.5em;>',
					'<div class="row">',
						'<div class="col-md-6">',
							'<div id="anchor" style="width:42em;height:25em;border:1px solid #999;position:relative;">',
								'<div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:18em;">',
									'<span class="btn btn-small btn-info" action="overlay-anchor">overlay on an element.</span>',
									'<div style="color:#999;">(new View()).overlay({anchor: $("...")})</div>',
								'</div>',
							'</div>',
						'</div>',
					'</div>',
				'</div>',
			'</div>',
		],
		actions: {
			'overlay-body': function(){
				(new Overlay()).overlay();
			},
			'overlay-anchor': function(){
				//(new Overlay()).overlay(document.getElementById('anchor'));
				(new Overlay()).overlay('#anchor');
				//(new Overlay()).overlay($('#anchor'));
				// (new Overlay()).overlay({
				// 	anchor: '#anchor'
				// });
			}
		}
	});

})(Application);