;(function(app){

	app.view('Demo.Effect',{
		className: 'wrapper row',
		template: [
			'<div class="col-md-4">',
				'<div style="text-align:center;">',
					'<div class="btn btn-primary" action="show_1">Show View1</div>',
					'<div class="btn btn-warning" action="close_1">Close View1</div>',
				'</div>',
				'<div region="effect1" effect="fade"></div>',
			'</div>',
			'<div class="col-md-4">',
				'<div style="text-align:center;">',
					'<div class="btn btn-success" action="show_2">Show View2</div>',
					'<div class="btn btn-danger" action="close_2">Close View2</div>',
				'</div>',
				'<div region="effect2"></div>',
			'</div>',
			'<div class="col-md-4">',
				'<div style="text-align:center;">',
					'<div class="btn btn-default" action="show_3">Show View3</div>',
					'<div class="btn btn-white" action="close_3">Close View3</div>',
				'</div>',
				'<div region="effect3"></div>',
			'</div>',
		],
		onReady: function(){
			this.show('effect1', new Effect1());
			this.show('effect2', new Effect2());
			this.show('effect3', new Effect3());
		},
		actions: {
			show_1: function(){
				this.show('effect1', 'Effect1');
			},
			close_1: function(){
				this.close('effect1');

			},
			show_2: function(){
				this.show('effect2', Effect2);	
			},
			close_2: function(){
				this.close('effect2');
			},
			show_3: function(){
				this.show('effect3', new Effect3());	
			},
			close_3: function(){
				this.close('effect3');
			}
		}
	});

	var Effect1 = app.view({
		name: 'Effect1',
		className: 'wrapper',
		template: [
			'<div style="height:30em;border: 1px solid #999;">',
				'<div style="width:90%;position:relative;top:50%;left:50%;transform:translate(-50%,-50%);color:#626262;">',
					'<div>You can define the effect by write the "effect=" attribute in the region definition.</div>',
					'<div><br></div>',
					'<div>&lt;div region="..." effect="fade" &gt;</div>',
				'</div>',
			'</div>',
		]
	});

	var Effect2 = app.view({
		name: 'Effect2',
		className: 'wrapper',
		template: [
			'<div style="height:30em;border: 1px solid #999;">',
				'<div style="width:90%;position:relative;top:50%;left:50%;transform:translate(-50%,-50%);color:#626262;">',
					'<div>You can embed the effects in view\'s definition.</div>',
					'<div><br></div>',
					'<div>Application.view({',
						'<br>&nbsp;&nbsp;&nbsp;&nbsp; template: \'...\'',
						'<br>&nbsp;&nbsp;&nbsp;&nbsp; ...',
						'<br>&nbsp;&nbsp;&nbsp;&nbsp; effect: \'roll\' ',
					'<br>})</div>',
				'</div>',
			'</div>',
		],
		effect: 'roll'
	});

	var Effect3 = app.view({
		name: 'Effect3',
		className: 'wrapper',
		template: [
			'<div style="height:30em;border: 1px solid #999;">',
				'<div style="width:90%;position:relative;top:50%;left:50%;transform:translate(-50%,-50%);color:#626262;">',
					'<div>You can also specified the individual effect for entering and exiting.</div>',
					'<div><br></div>',
					'<div>Application.view({',
						'<br>&nbsp;&nbsp;&nbsp;&nbsp; template: \'...\'',
						'<br>&nbsp;&nbsp;&nbsp;&nbsp; ...',
						'<br>&nbsp;&nbsp;&nbsp;&nbsp; effect: {',
							'<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; enter: \'tada\'',
							'<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; exit: \'flipOutX\'',
						'<br>&nbsp;&nbsp;&nbsp;&nbsp;}',
					'<br>})</div>',
				'</div>',
			'</div>',
		],
		effect: {
			enter: 'tada',
			exit: 'flipOutX'
		}
	});

})(Application);