(function(app){

	app.context('Mockups', {
		
		className: 'wrapper-full container-fluid',
		template: '<div region="mockups"></div>',

		data: {
			mockups: [

				//breadcrumb
				{tpl: 'breadcrumb.html'},

				//navbars
				{tpl: 'nav-bar.html', className: 'navbar-default'},
				{tpl: 'nav-bar.html', className: 'navbar-inverse'},

				//boxes
				{tpl: 'boxes.html', onReady: function(){
					if(app.detect('chrome')){
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

				//tooltips/popovers & modal
				{tpl: 'dialogs.html'},

				//table
				{tpl: 'table.html'},

				//forms
				{tpl: 'forms.html'},

				//copyright of the mockup collections above
				{tpl: 'copyright.html'}

		]},

		onReady: function(){
			_.each(this.get('mockups'), function(m){
				/////////////////////////////////////////////////////////////////////////
				///Manually managed view life cycle..without this.show('region',...)..///
				/////////////////////////////////////////////////////////////////////////
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
				this.getRegion('mockups').$el.append(view.render().el);
				//3. connect the view life-cycle event seq: --render--[[show]]--ready 
				view.triggerMethod('show'); 
				//4. tell the views to close themselves upon parent view close
				view.listenTo(this, 'close', function(){
					view.close();
				});
				//(ref: /lib+-/marionette/view.js, we refined the seq and added a ready e.)
			}, this);
		}

	});

})(Application);