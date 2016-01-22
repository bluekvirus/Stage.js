;(function(app){

	var PopLeft = app.view({
		popover: true,
		template: [
			'<div action="alert">I am popover LEFT!</div>'
		],
		actions: {
			alert: function(){
				alert('alert from popover view');
			}
		}
	});

	var PopRight = app.view({
		popover: true,
		template: [
			'<div class="row form-horizontal">',
				'<div class="col-md-12">',
					'<div editor="holder"></div>',
				'</div>',
			'</div>',
		],
		editors: {
			holder: {
				label: 'Label',
				type: 'text',
				value: 'I am popover RIGHT!',
				layout: {
					label: 'col-md-3',
					field: 'col-md-9'
				}
			}
		}
	});

	var PopTop = app.view({
		popover: true,
		template: [
			'<div class="wrapper-full">',
	            '<ul class="list-group">',
	                '<li class="list-group-item">',
	                    '<span class="badge">14</span>',
	                    'ACTION',
	                '</li>',
	               	'<li class="list-group-item">',
	                    '<span class="badge">2</span>',
	                    'DID NOT',
	                '</li>',
	                '<li class="list-group-item">',
	                    '<span class="badge">1</span>',
	                    'CLOSE ME',
	                '</li>',
	            '</ul>',
	        '</div>',
		],
	});

	var PopBottom = app.view({
		popover: true,
		template: [
			'<div class="wrapper">',
            	'<button type="button" class="btn btn-default rounded rounded-lg">Default</button>',
            	'<button type="button" class="btn btn-primary">Primary</button>',
            	'<button type="button" class="btn btn-success rounded">Success</button>',
            	'<button type="button" class="btn btn-info">Info</button>',
            	'<button type="button" class="btn btn-warning rounded rounded-sm">Warning</button>',
            	'<button type="button" class="btn btn-danger">Danger</button>',
            	'<button type="button" class="btn btn-link">Link</button>',
            	'<button type="button" class="btn btn-white">White</button>',
        	'</div>',
		],
	});

	app.regional('Demo.Popover', {
		template: [
			//flipped
			'<div style="position:fixed;left:0;top:50%;-webkit-transform:translateY(-50%);transform:translateY(-50%);"><div action="flipped_left" id="flipped_left" class="btn btn-success" data-container="body" data-placement="left">Flipped Left</div></div>',
			'<div style="position:fixed;right:0;top:50%;-webkit-transform:translateY(-50%);transform:translateY(-50%);"><div action="flipped_right" id="flipped_right" class="btn btn-info">Flipped Right</div></div>',
			'<div style="position:fixed;bottom:0;left:50%;-webkit-transform:translateX(-50%);transform:translateX(-50%);"><div action="flipped_bottom" id="flipped_bottom" class="btn btn-primary" data-placement="bottom">Flipped Bottom</div></div>',
			//regular
			'<div style="position: fixed;top: 50%;left: 50%;-webkit-transform: translate(-50%, -50%);transform: translate(-50%, -50%);">',
				'<div action="left" id="left_anchor" class="btn btn-success" data-placement="left" data-content="I have overwritten the view and animated! YAY!">Popover Left</div>',
				'<div action="top" id="top_anchor" class="btn btn-warning">Popover Top</div>',
				'<div action="bottom" id="bottom_anchor" class="btn btn-primary" data-placement="bottom">Popover Bottom</div>',
				'<div action="right" id="right_anchor" class="btn btn-info">Popover Right</div>',
			'</div>',
		],
		actions: {
			'flipped_left': function(self){
				//check whether already displayed
				if( self.attr('aria-describedby') )
					//being displayed
					self.popover('destroy');
				else
					//not displayed
					(new PopLeft()).popover(self, {bond: this});
			},
			'flipped_right': function(self){
				(new PopRight()).popover($('#flipped_right'), {animation: true, placement: 'right', content:'I have overwritten the view and action did not close me :D!', bond: this});
			},
			'flipped_bottom': function(self){
				//check whether already displayed
				if( self.attr('aria-describedby') )
					//being displayed
					self.popover('destroy');
				else
					//not displayed
					(new PopBottom()).popover(document.getElementById('flipped_bottom'), {bond: this});
			},
			left: function(self){
				//check whether already displayed
				if( self.attr('aria-describedby') )
					//being displayed
					self.popover('destroy');
				else
					//not displayed
					(new PopLeft()).popover(self, {'animation': true, bond: this});
			},
			right: function(self){
				//check whether already displayed
				if( self.attr('aria-describedby') )
					//being displayed
					self.popover('destroy');
				else
					//not displayed
					(new PopRight()).popover(document.getElementById('right_anchor'), {placement: 'right', bond: this});
			},
			top: function(self){
				(new PopTop()).popover(self, {placement: 'auto top', animation: true, bond: this});
			},
			bottom: function(self){
				//check whether already displayed
				if( self.attr('aria-describedby') )
					//being displayed
					self.popover('destroy');
				else
					//not displayed
					(new PopBottom()).popover(self, {placement: 'bottom', bond: this});
			}
		}
	});

})(Application);