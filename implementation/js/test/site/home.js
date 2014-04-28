;(function(app){

	function minH(){
		var h = $window.height();
		//if(h > 640) 
			return h;
		//return 640;
	}

	app.page('Home', {

		template: [
			//very very important to have overflow:hidden for svg powered background
			'<div style="position:absolute;width:100%;overflow:hidden;" region="bg" view="Home.BG"></div>',
			'<div class="container-fluid">',
				'<div class="row">',
					'<div class="col-sm-offset-6 col-sm-4" region="title"></div>',
				'</div>',
				'<div class="row">',
					'<div class="col-sm-5" region="menu"></div>',
				'</div>',
			'</div>',
			'<div style="position:absolute;bottom:0;width:100%" region="footer" view="Home.Footer"></div>'
		],

		onShow: function(){
			//title + short desc
			this.title.show(app.area({
				template: [
					'<img src="themes/' + Application.currentTheme + '/img/logo/text-black" alt="Stage.js"></img>',
					'<p>'+Random.paragraph(2)+'</p>'
				],
				initialize: function(){
					this.listenTo(app, 'app:resized', function(){
						this.trigger('view:track-full-screen');
					});
				},				
				onShow: function(){
					this.trigger('view:track-full-screen');
				},
				onTrackFullScreen: function(){
					this.$el.height(minH()*.44).css('marginTop', minH()*.06);
				}
			}));

			//navi links
			this.menu.show(app.area({
				type: 'CollectionView',
				className: 'text-right',
				itemView: app.view({
					template: '<a href={{href}} class="home-navi-link">{{uppercase name}}</a>'
				}),
				initialize: function(){
					this.collection = app.collection([
						{name: 'Download Latest Version', href:'static/resource/default/download/stagejs-edge.tar.gz'},
						{name: 'Download Project Kit', href:'static/resource/default/download/stagejs-starter-kit.tar.gz'},
						{name: 'Document', href:'#navigate/Document'},
						{name: 'Demo', href:'#navigate/Demo'}
					]);
				}
			}))
		}

	});

	app.area('Home.Footer', {
		template: [
			'<span class="pull-right github-link"><a href="https://github.com/bluekvirus/Stage.js/"><i class="fa fa-github"></i>View on Github</a></span>',
			'<p>Super-powered by Stage.js ©2013-2014</p>',
			'<p>Code licensed under the The <a href="http://opensource.org/licenses/MIT">MIT</a> License. Documentation licensed under <a href="http://creativecommons.org/licenses/by/3.0/">CC BY 3.0</a>.</p>',
		]
	});

	app.area('Home.BG', {
		svg: true,

		initialize: function(){
			this.listenTo(app, 'app:resized', function(screenSize){
				this.trigger('view:fit-and-draw');
			});
		},

		onShow: function(){
			if(this.paper){
				//delay 10ms for re-draw - for the scrollbars to recover(disappear)
				var that = this;
				setTimeout(function(){that.trigger('view:fit-and-draw')}, app.config.rapidEventDebounce/20);
			}else {
				this.onPaperReady = function(){
					this.trigger('view:fit-and-draw');
				}		
			}
		},

		onFitAndDraw: function(){
			this.$el.height(minH());
			this.trigger('view:fit-paper');

		},
		onPaperResized: function(){
			this.drawBg();
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
				x: size.w * .46,
				y: size.h * .44
			};
			this.paper.path(['M', start.x, ',', 0, 'V', size.h, 'L', size.w, ',', 0].join('')).attr({stroke: '#222'}); //none close

			//green followspot
			var g = this.paper.path(['M', 0, ',', 0, 'L', size.w, ',', size.h, 'V', start.y, 'z'].join('')).attr({stroke: 'none'});
			var gMesh = g.clone();

			g.attr({fill: '0-rgba(63,182,24)-rgba(39,117,29):25-rgba(27,87,31)'});
			$(g.node).css('fill-opacity', .6);

			gMesh.attr({fill: '0-rgba(255,255,255,0)-rgba(189,187,176,.5):15-rgba(72,66,36)'});
			$(gMesh.node).css('fill-opacity', .25);			

			//blue followspot
			var b = this.paper.path(['M', start.x, ',', 0, 'L', 0, ',', start.y, 'V', size.h, 'z'].join('')).attr({stroke: 'none'});
			var bMesh = b.clone();

			b.attr({fill:'180-#007FFF-rgba(16,73,126):25-#183044'});
			$(b.node).css('fill-opacity', .8);

			bMesh.attr({fill: '0-rgba(255,255,255,0)-rgba(189,187,176,.5):15-rgba(72,66,36)'});
			$(bMesh.node).css('fill-opacity', .3);	

			//red followspot
			var r = this.paper.path(['M', size.w, ',', start.y, 'L', 0, ',', size.h, 'V', start.y, 'z'].join('')).attr({stroke: 'none'});
			var rMesh = r.clone();

			r.attr({fill:'180-#FF0039-rgba(139,17,41,.5):45-#5B1823'});
			$(r.node).css({
				'opacity': .6
			});

			rMesh.attr({fill: '0-rgba(255,255,255,0)-rgba(189,187,176,.5):15-rgba(72,66,36)'});
			$(rMesh.node).css({
				opacity: .25,
				'fill-opacity': .25
			});			
				
		}		
	});

})(Application);