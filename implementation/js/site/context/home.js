;(function(app){

	function minH(){
		var h = app.screenSize.h;
		//if(h > 640) 
			return h;
		//return 640;
	}

	app.context('Home', {

		template: [
			//very very important to have overflow:hidden for svg powered background
			'<div overflow="hidden" region="bg" view="Home.BG" style="position:absolute;left:0;right:0;top:0;bottom:0;"></div>',
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

		data: {local: true}, //local data for testing navi-to and ready timing.
		//data: 'static/resource/en-US/i18n.json',

		coop: ['window-resized'],

		onBeforeNavigateTo:function(){
			app.debug('before navi to', this.name);
			$('body').css('overflow', 'hidden');
			return true;
		},

		onNavigateTo:function(path, vcfg){
			app.debug('Home navi to', path, vcfg);
		},

		onNavigateAway: function(){
			app.debug('before navi away from', this.name);
			$('body').css({
				'overflowX': 'hidden',
				'overflowY': 'auto'
			});
		},

		onWindowResized: function(){
			var bgv = this.getViewIn('bg');
			bgv && bgv.trigger('view:draw');
			var titlev = this.getViewIn('title');
			titlev && titlev.trigger('view:move-to-center');
		},

		onReady: function(){
			app.debug('Home ready');
			//title + short desc
			this.title.show(app.view({
				tooltip: true,
				template: [
					'<i class="project-title" style="margin-bottom:20px;"></i>',
					app.markdown([
						/////////////////Intro/////////////////
						'Learned Backbone? Tried Marionette? Still searching for a complete **single-page** web application **workflow**? ',
						'Look no further...\n',
						'With our thiner and flattened **architecture**, intuitive **api** and handy **tooling**, you can direct your next application like a play on stage.\n',
						'Enjoy!',
						/////////////////Intro/////////////////
						
						/////////////////Test//////////////////
						// '```javascript',
						// 'var a = b;',
						// '```',
						// '<span class="label label-success">123</span>'
						/////////////////Test//////////////////
						
					].join('\n'), {marked: {sanitize: false}}),
					'<p>',
						'<a href="https://github.com/bluekvirus/Stage.js/releases"><img src="http://img.shields.io/bower/v/stage.js.svg?style=flat-square" alt="Framework Version"></img></a> ', //version badge
						'<a href="https://www.npmjs.org/package/stage-devtools"><img src="http://img.shields.io/npm/v/stage-devtools.svg?style=flat-square" alt="DevTools Version"></img></a> ', //version badge
						'<a href="http://cordova.apache.org/"><img src="http://img.shields.io/badge/supports-Cordova-3B4854.svg?style=flat-square" alt="Supports Cordova"></img></a>', //cordova badge
					'</p>',
					'<p>',
						'Supported Browsers: ',
						'<i class="fa fa-firefox cursor-hand" data-toggle="tooltip" data-placement="bottom" title="Firefox Latest"></i> ',
						'<i class="fa fa-chrome cursor-hand" data-toggle="tooltip" data-placement="bottom" title="Chrome Latest"></i> ',
						'<i class="fa fa-edge cursor-hand" data-toggle="tooltip" data-placement="bottom" title="IE Edge/11+"></i> ',
						'<i class="fa fa-safari cursor-hand" data-toggle="tooltip" data-placement="bottom" title="Safari (experimental)"></i> ',
						'<i class="fa fa-opera cursor-hand" data-toggle="tooltip" data-placement="bottom" title="Opera (experimental)"></i> ',
					'<p>'
				],
		
				onReady: function(){
					this.trigger('view:move-to-center');
				},
				onMoveToCenter: function(){
					this.$el.height(minH()*0.44).css('marginTop', minH()*0.06);
				}
			}));

			//navi links
			this.menu.show(app.view({
				tagName: 'ul',
				className: 'text-right list-unstyled',
				template: [
					'{{#each items}}',
						'<li><a href={{href}} class="home-navi-link">{{#icon}}<i class="{{.}}"></i> {{/icon}}{{uppercase name}}</a></li>',
					'{{/each}}'
				],
				data:[
					//{name: 'Edge Build', icon: 'fa fa-download', href:'static/resource/default/download/stagejs-edge.tar.gz'},
					{name: 'Starter Kit', icon: 'fa fa-download', href:'static/resource/default/download/stagejs-starter-kit.tar.gz'},
					{name: 'Change Log', href:'https://github.com/bluekvirus/Stage.js/releases'},
					{name: 'Document', href:'#navigate/Document'},
					{name: 'Templates', href:'#navigate/Mockups'},
					{name: 'Demo', href:'#navigate/Demo/Demo.Notify'}
				]
			}));
		}

	});

	app.view('Home.Footer', {
		template: [
			'<span class="pull-right github-link"><a href="https://github.com/bluekvirus/Stage.js/"><i class="fa fa-github"></i>View on Github</a></span>',	
			'<span>Super-powered by Stage.js © 2013 - 2016</span> ',		
			'<p>Code licensed under The <a href="http://opensource.org/licenses/MIT">MIT</a> License. Documentation licensed under <a href="http://creativecommons.org/licenses/by/3.0/">CC BY 3.0</a>.</p>',
		]
	});

	app.view('Home.BG', {
		//template: ' ', //might need exception as .editors configured views.
		svg: true,
		data: 'static/resource/en-US/i18n.json', //a test, not used in view
		//data: {local: true}, //a test, not used in view
		
		onReady: function(){
			app.debug('Hidden (Home) svg data:', this.get());
			this.trigger('view:draw');
		},

		//expose drawBg to view:draw.
		onDraw: function(){
			this.drawBg();
		},

		drawBg: function(){
			this.paper.clear();
			var size = {
				h: this.paper.height,
				w: this.paper.width
			};

			var start = {
				x: size.w * 0.46,
				y: size.h * 0.44
			};
			this.paper.path(['M', start.x, ',', 0, 'V', size.h, 'L', size.w, ',', 0].join('')).attr({stroke: '#222'}); //none close

			//green followspot
			var g = this.paper.path(['M', 0, ',', 0, 'L', size.w, ',', size.h, 'V', start.y, 'z'].join('')).attr({stroke: 'none'});
			var gMesh = g.clone();

			g.attr({fill: '0-rgba(63,182,24)-rgba(39,117,29):25-rgba(27,87,31)'});
			$(g.node).css('fill-opacity', 0.6);

			gMesh.attr({fill: '0-rgba(255,255,255,0)-rgba(189,187,176,.5):15-rgba(72,66,36)'});
			$(gMesh.node).css('fill-opacity', 0.25);			

			//blue followspot
			var b = this.paper.path(['M', start.x, ',', 0, 'L', 0, ',', start.y, 'V', size.h, 'z'].join('')).attr({stroke: 'none'});
			var bMesh = b.clone();

			b.attr({fill:'180-#007FFF-rgba(16,73,126):25-#183044'});
			$(b.node).css('fill-opacity', 0.8);

			bMesh.attr({fill: '0-rgba(255,255,255,0)-rgba(189,187,176,.5):15-rgba(72,66,36)'});
			$(bMesh.node).css('fill-opacity', 0.3);	

			//red followspot
			var r = this.paper.path(['M', size.w, ',', start.y, 'L', 0, ',', size.h, 'V', start.y, 'z'].join('')).attr({stroke: 'none'});
			var rMesh = r.clone();

			r.attr({fill:'180-#FF0039-rgba(139,17,41,.5):45-#5B1823'});
			$(r.node).css({
				'opacity': 0.6
			});

			rMesh.attr({fill: '0-rgba(255,255,255,0)-rgba(189,187,176,.5):15-rgba(72,66,36)'});
			$(rMesh.node).css({
				opacity: 0.25,
				'fill-opacity': 0.25
			});			
				
		}		
	});

})(Application);