(function(app){

	app.context('_Mockups', {
		
		className: 'wrapper-full container-fluid',

		mockups: [

			//headings
			{tpl: 'heading.html', className: 'heading'},

			//boxes
			{tpl: 'boxes.html', className:'row'},

			//navbars
			{tpl: 'nav-bar.html', className: 'navbar-default'},
			{tpl: 'nav-bar.html', className: 'navbar-inverse'},

			//buttons
			{tpl: 'buttons.html',},

			//typography
			{tpl: 'typography.html'},

			//indicators (alert, lable, badge and progress bar)
			{tpl: 'indicators.html'}

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