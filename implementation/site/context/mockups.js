(function(app){

	app.context('Mockups', {
		
		className: 'wrapper-full container-fluid',
		template: ' ',

		mockups: [

			//breadcrumb
			{tpl: 'breadcrumb.html'},

			//navbars
			{tpl: 'nav-bar.html', className: 'navbar-default'},
			{tpl: 'nav-bar.html', className: 'navbar-inverse'},

			//boxes
			{tpl: 'boxes.html', onReady: function(){
				if(Modernizr.chrome){
					this.$el.find('[warning="chrome"]').removeClass('hidden');
				}
			}},

			//containers
			{tpl: 'containers.html'},			

			//buttons
			{tpl: 'buttons.html',},

			//typography
			{tpl: 'typography.html'},

			//indicators (alert, lable, badge and progress bar)
			{tpl: 'indicators.html'},

			//navigators
			{tpl: 'navs.html'},

			//popups & dialogs
			{tpl: 'dialogs.html', onReady: function(){
				this.$el.find('[data-toggle="popover"]').popover();
				this.$el.find('[data-toggle="tooltip"]').tooltip();
			}},

			//table
			{tpl: 'table.html'},

			//forms
			{tpl: 'forms.html'},

			//copyright of the mockup collections above
			{tpl: 'copyright.html'}

		],

		onReady: function(){
			_.each(this.mockups, function(m){
				var view = app.view({
					className: 'wrapper-full',
					template: '@mockups/' + m.tpl,
					onRender: function(){
						this.$el.find('> div').addClass(m.className);
					},
					onReady: function(){
						if(m.onReady) m.onReady.call(this);
					}
				}, true);
				this.$el.append(view.render().el);
				view.trigger('view:show');

			}, this);
		}

	});

})(Application);