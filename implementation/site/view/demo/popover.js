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
	                    'Cras justo odio',
	                '</li>',
	               	'<li class="list-group-item">',
	                    '<span class="badge">2</span>',
	                    'Dapibus ac facilisis in',
	                '</li>',
	                '<li class="list-group-item">',
	                    '<span class="badge">1</span>',
	                    'Morbi leo risus',
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
			'<div style="position:fixed;left:0;top:50%;-webkit-transform:translateY(-50%);transform:translateY(-50%);"><div id="flipped_left" class="btn btn-success">Flipped Left</div></div>',
			'<div style="position:fixed;right:0;top:50%;-webkit-transform:translateY(-50%);transform:translateY(-50%);"><div id="flipped_right" class="btn btn-info">Flipped Right</div></div>',
			//'<div style="position:fixed;top:0;left:50%;-webkit-transform:translateX(-50%);transform:translateX(-50%);"><div id="flipped_top" class="btn btn-warning">Flipped Top</div></div>',
			'<div style="position:fixed;bottom:0;left:50%;-webkit-transform:translateX(-50%);transform:translateX(-50%);"><div id="flipped_bottom" class="btn btn-primary">Flipped Bottom</div></div>',
			//regular
			'<div style="position: fixed;top: 50%;left: 50%;-webkit-transform: translate(-50%, -50%);transform: translate(-50%, -50%);">',
				'<div id="left_anchor" class="btn btn-success">Popover Left</div>',
				'<div id="top_anchor" class="btn btn-warning">Popover Top</div>',
				'<div id="bottom_anchor" class="btn btn-primary">Popover Bottom</div>',
				'<div id="right_anchor" class="btn btn-info">Popover Right</div>',
			'</div>',
		],
		onShow: function(){
			(new PopLeft()).popover($('#left_anchor'), 'left');
			(new PopRight()).popover(document.getElementById('right_anchor'), 'right');
			(new PopTop()).popover($('#top_anchor'), 'top');
			(new PopBottom()).popover(document.getElementById('bottom_anchor'), 'bottom');
			//flipped popovers
			(new PopLeft()).popover($('#flipped_left'), 'left');
			(new PopRight()).popover($('#flipped_right'), 'right');
			//(new PopTop()).popover($('#flipped_top'), 'top');
			(new PopBottom()).popover($('#flipped_bottom'), 'bottom');
		}
		/*actions: {
			popover: function(self, event){
				//this.getRegion('pop').show(new Popover());
				(new Popover()).popover($('#test1'), 'top');
				(new Popover()).popover(document.getElementById('test2'), 'left');
			}
		}*/
	});

})(Application);