;(function(app){

	app.page('Home', {

		template: [

		],

		svg: true,

		initialize: function(){
			this.listenTo(app, 'app:resized', function(){
				this.trigger('view:track-full-screen');
			});
		},
		onTrackFullScreen: function(){
			this.$el.height($window.height());
			this.trigger('view:fit-paper');
			if(this.paper) this.drawBg();
		},
		onPaperReady: function(){
			this.trigger('view:track-full-screen');
		},
		drawBg: function(){
			this.paper.clear();
			var size = {
				h: this.paper.height,
				w: this.paper.width
			};
			//bg line top-down 45% width
			//bg line top-right down 45% width
			var start = {
				x: size.w * .45,
				y: size.h * .45
			};
			this.paper.path(['M', start.x, ',', 0, 'V', size.h, 'L', size.w, ',', 0].join('')).attr({stroke: '#222', opacity: .4}); //none close

			//green followspot
			this.paper.path(['M', 0, ',', 0, 'L', size.w, ',', size.h, 'V', size.h * .45, 'z'].join('')).attr({stroke: 'none', fill:'0-#3FB218-#2B4F21', 'fill-opacity': .5});

			//blue followspot
			this.paper.path(['M', start.x, ',', 0, 'L', 0, ',', start.y, 'V', size.h, 'z'].join('')).attr({stroke: 'none', fill:'180-#007FFF-#183044', 'fill-opacity': .5});

			//red followspot
			this.paper.path(['M', size.w, ',', start.y, 'L', 0, ',', size.h, 'V', start.y, 'z'].join('')).attr({stroke: 'none', fill:'180-#FF0039-#5B1823', 'fill-opacity': .5});
		}

	});

})(Application);