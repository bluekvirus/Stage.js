(function(app){

	app.context('_Mockups', {
		
		className: 'wrapper-full container-fluid',

		mockups: [

			//headings
			{tpl: 'heading.html', className: 'heading'},

			//boxes
			{tpl: 'boxes.html', className:'row'},

			//containers
			{tpl: 'containers.html'},			

			//navbars
			{tpl: 'nav-bar.html', className: 'navbar-default'},
			{tpl: 'nav-bar.html', className: 'navbar-inverse'},

			//buttons
			{tpl: 'buttons.html',},

			//typography
			{tpl: 'typography.html'},

			//indicators (alert, lable, badge and progress bar)
			{tpl: 'indicators.html'},

			//navigators
			{tpl: 'navs.html'},

			//popups & dialogs
			{tpl: 'dialogs.html', onShow: function(){
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

		onShow: function(){
			_.each(this.mockups, function(m){
				var view = app.view({
					className: 'wrapper-full',
					template: '@mockups/' + m.tpl,
					onRender: function(){
						this.$el.find('> div').addClass(m.className);
					},
					onShow: function(){
						if(m.onShow) m.onShow.call(this);
					}
				}, true);
				this.$el.append(view.render().el);
				view.trigger('view:show');

			}, this);
		}

	});

})(Application);