;(function(app){

	app.view('Demo.MoreData', {

		template: [
			'<div>Scroll down to add more icons below</div>',
			'<div region="items" action-scroll="track" action-scroll-top="notify-top" action-scroll-bottom="get-more-items" style="height:8em;margin:1em;" class="border border-full"></div>'
		],

		onShow: function(){
			this.more('items', ['bluetooth', 'edge', 'shopping-basket', 'bluetooth', 'edge', 'shopping-basket'], app.view({
				template: '<i class="fa fa-{{value}}" style="margin:1em;"></i>'
			}));
		},

		actions: {
			'track': app.throttle(function($el, e){
				console.log('track', e.type);
			}),
			'notify-top': function($el, e){
				this.more('items', ['bluetooth', 'edge', 'shopping-basket'], true);
			},
			'get-more-items': function($el, e){
				console.log('bottom', e.type);
				this.more('items', ['bluetooth', 'edge', 'shopping-basket']);
			}
		}

	});

})(Application);