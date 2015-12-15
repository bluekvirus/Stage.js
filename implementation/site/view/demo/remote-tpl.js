;(function(app){

	app.regional('Demo.RemoteTpl', {
		overlay: true,
		template: '@test-ct.html',
		className: 'wrapper-full-2x border border-full',
		navRegion: 'nav',
		effect: {
			enter: 'fadeInDown',
			exit: 'fadeOutDown'
		}
	});

})(Application);