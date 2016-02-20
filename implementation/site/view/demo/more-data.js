;(function(app){

	app.view('Demo.MoreData', {

		template: [
			'<div>Scroll down to add more icons below</div>',
			'<div region="items"></div>'
		],

		onShow: function(){
			this.more('items', ['bluetooth', 'edge', 'shopping-basket'], app.view({
				tagName: 'span',
				template: '<i class="fa fa-{{value}}" style="margin:1em;"></i>'
			}));
		}

	});

})(Application);