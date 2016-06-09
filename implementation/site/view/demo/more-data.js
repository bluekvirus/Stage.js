;(function(app){

	app.view('Demo.MoreData', {
		template: [
			'<div>Scroll down to add more icons below</div>',
			'<div region="items" action-scroll="track" action-scroll-top="notify-top" action-scroll-bottom="get-more-items" style="height:12em;margin:1em 0;overflow-y:auto;" class="border border-full"></div>',
			'<div><span class="btn btn-default btn-xs btn-outline" action="reset">Reset</span></div>'
		],
		onReady: function(){
			this.more('items', ['bluetooth', 'edge', 'shopping-basket', 'bluetooth', 'edge', 'shopping-basket'], app.view({
				template: '<i class="fa fa-{{value}}" style="margin:1em;"></i>'
			}));
		},
		actions: {
			'track': app.throttle(function($el, e){
				app.debug('track', e.type);
			}),
			'notify-top': function($el, e){
				app.notify('action-scroll-top', 'Scrolled to top...', 'warning');
			},
			'get-more-items': function($el, e){
				app.debug('bottom', e.type);
				this.more('items', ['bluetooth', 'edge', 'shopping-basket']);
			},
			reset: function(){
				this.more('items', ['bluetooth', 'edge', 'shopping-basket', 'bluetooth', 'edge', 'shopping-basket'], true);
			}
		}

	});

})(Application);