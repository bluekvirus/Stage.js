(function(app){

	app.context('_Mockups', {

		mockups: [
			'nav-bar.html'
		],
		onShow: function(){
			_.each(this.mockups, function(name){

				this.$el.append(app.view({
					template: '@mockups/' + name
				}, true).render().el);

			}, this);
		}

	});

})(Application);