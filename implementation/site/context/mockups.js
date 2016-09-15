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
				//////////////////////////////////////////////////
				///Absolute manually managed view life cycle...///
				//////////////////////////////////////////////////
				//1. create it
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
				//2. render and insert it into DOM
				this.$el.append(view.render().el);
				//3. connect the view life-cycle event seq: --render--[[show]]--ready 
				view.triggerMethod('show'); 
				//(ref: /lib+-/marionette/view.js, we refined the seq and added the ready e though.)

			}, this);
		}

	});

})(Application);