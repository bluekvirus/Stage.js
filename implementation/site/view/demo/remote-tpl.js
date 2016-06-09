;(function(app){

	app.view('Demo.RemoteTpl', {
		overlay: true,
		template: '@test-ct.html',
		className: 'wrapper-full-2x border border-full',
		navRegion: 'nav',
		effect: {
			enter: 'fadeInDown',
			exit: 'fadeOutDown'
		},
		onReady: function(){
			this.getRegion('left').show(app.view({
				template: '@test/test2.html' //nested template path, != @test2.html
			}));

			this.getRegion('right').show(app.view({
				template: '@test.html' //same template will be cached and will not trigger a re-fetch.
			}));
			
			this.getRegion('nav').show(app.view({
				template: '@test2.html' //cached template in all.json will not trigger a re-fetch either.
			}));
		}
	});

})(Application);