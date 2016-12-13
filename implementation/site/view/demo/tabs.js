;(function(app){

	app.view('Demo.Tabs', {
		className: 'row wrapper',
		data: {
			tabs: ['first', 'second', 'third', 'forth', 'fifth', 'sixth', 'seventh']
		},
		template: [
			'<h4>Single activation (click):</h4>',
			'<span class="badge pull-right">.nav nav-tabs</span>',
			'<ul class="nav nav-tabs">',
				'{{#tabs}}<li activate="single" tabId="{{.}}"><a>{{.}}</a></li>{{/tabs}}',
			'</ul>',
			'<div region="tabs"></div>'
		],
		onItemActivated: function($item){
			var tabId = $item.attr('tabId');
			this.tab('tabs', '<h3>This is tab-' + tabId + ' content...</h3>' + new Date(), tabId); 
		},
		onItemDeactivated: function(){
			console.log('deactivated', arguments);
		},
		onTabAdded: function(id){
			console.log('tab++', id);
		},
		onTabActivated: function(id){
			console.log('*tab*', id);
		},
		onTabRemoved: function(id){
			console.log('tab--', id);
		}
	});

})(Application);