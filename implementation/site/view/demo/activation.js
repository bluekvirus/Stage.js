;(function(app){

	app.view('Demo.Activation', {
		className: 'row wrapper',
		data: {
			tabs: ['first', 'second', 'third', 'forth']
		},
		template: [
			'<h4>Single activation (click):</h4>',
			'<span class="badge pull-right">.nav nav-tabs</span>',
			'<ul class="nav nav-tabs">',
				'{{#tabs}}<li activate="single"><a>{{.}}</a></li>{{/tabs}}',
			'</ul>',

			'<h4>Multi activation/deactivation (double-click):</h4>',
			'<span class="badge pull-right">.nav nav-pills</span>',
			'<ul class="nav nav-pills">',
				'{{#tabs}}<li activate-dblclick="*multi" deactivate-dblclick="*multi"><a>{{.}}</a></li>{{/tabs}}',
			'</ul>',

			'<h4>Compound Single activation (click) with (over/out):</h4>',
			'<span class="badge pull-right">.list-group</span>',
			'<ul class="list-group" style="margin-top:2.5em;">',
				'{{#tabs}}<li class="list-group-item" activate="menu" activate-mouseover="over-n-out:list-group-item-info" deactivate-mouseout="over-n-out"><a>{{.}} <small>.list-group-item</small></a></li>{{/tabs}}',
			'</ul>',
		],
		onItemActivated: function(){
			console.log('activated:', arguments);
		},
		onItemDeactivated: function(){
			console.log('deactivated', arguments);
		}
	});

})(Application);