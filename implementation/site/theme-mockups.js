(function(app){

	app.context('_Mockups', {
		
		className: 'wrapper-full container-fluid',

		mockups: [
			//navbars
			{tpl: 'nav-bar.html', className: 'navbar-default'},
			{tpl: 'nav-bar.html', className: 'navbar-inverse'},

			//headings
			{tpl: 'heading.html', className: 'heading'},

			//boxes
			{tpl: 'boxes.html', className:'row'},

			//buttons
			{tpl: 'buttons.html',}

		],

		onShow: function(){
			_.each(this.mockups, function(m){

				this.$el.append(app.view({
					className: 'wrapper-full',
					template: '@mockups/' + m.tpl,
					onRender: function(){
						this.$el.find('> div').addClass(m.className);
					}
				}, true).render().el);

			}, this);
		}

	});

})(Application);