;(function(app){

	app.regional('RemoteTpl', {
		className: 'container',
		template: '@test-ct.html',
		onShow: function(){
			this.getRegion('left').show(app.view({
				template: '@test.html'
			}, true));

			this.getRegion('right').show(app.view({
				template: '@test.html' //same template will be cached and will not trigger a re-fetch.
			}, true));

			this.getRegion('bottom').show(app.view({
				template: '@test2.html' //cached template in all.json will not trigger a re-fetch either.
			}, true));
		}
	});

})(Application);