;(function(app){

	app.view('Demo.Layout', {
		template: [
			'<div class="col-md-6 wrapper-full" region="split-view1"></div>',
			'<div class="col-md-6 wrapper-full" region="split-view2"></div>',
			'<div class="col-md-6 wrapper-full" style="height:25em;"><div id="div-split1" style="border: 1px solid black;"></div></div>',
			'<div class="col-md-6 wrapper-full" style="height:25em;"><div id="div-split2" style="border: 1px solid black;"></div></div>',
			'<div class="col-md-6 wrapper-full" region="split-nested"></div>',
			'<div class="col-md-6 wrapper-full" style="height:25em;"><div id="div-split3" style="border: 1px solid black;"></div></div>',
			'<div class="col-md-6 wrapper-full" region="test"></div>',
			'<div class="col-md-6 wrapper-full" style="height:25em;"><div id="test-layout" style="height:100%;border: 1px solid black;"></div></div>'
		],
		onReady: function(){
			//
			this.$el.find('[region="test"]').css({height: '25em'});
			this.getRegion('test').show(new Test());
		// 	//
		 	this.$el.find('[region="split-view1"]').css({height: '25em'});
			this.$el.find('[region="split-view2"]').css({height: '25em'});
			this.$el.find('[region="split-nested"]').css({height: '25em'});
		 	this.getRegion('split-view1').show(new View1());
			this.getRegion('split-view2').show(new View2());
			this.getRegion('split-nested').show(new View3());
			//for div-split1
			this.$el.find('#div-split1').flexlayout(['1:r1', '2:r2', '50px:r3'], {
				dir: 'h',
				adjust: true,
			});
			this.$el.find('[region="r1"]').html('<div style="color:#626262;">You can simply use the flexlayout plugin in any div.</div>');
			this.$el.find('[region="r2"]').html(			
				'<div style="color:#626262;">'+
					'<div>$SomeDiv.flexlayout(["1:r1", "2:r2", "50px:r3"], {</div>'+
					'<div>&nbsp;&nbsp;&nbsp;&nbsp; dir: \'h\'</div>'+
					'<div>&nbsp;&nbsp;&nbsp;&nbsp; adjust: true,</div>'+
					'<div>}</div>'+
				'</div>'
			);
			this.$el.find('[region="r3"]').html('<div style="color:#626262;">If a region has a fixed px/em width/height, it cannot be adjusted even if adjust is true.</div>');
			//for div-split2
			this.$el.find('#div-split2').flexlayout(['1:sample-region-1', '3:sample-region-2'], {
				dir: 'v',
				adjust: true,
			});
			this.$el.find('[region="sample-region-1"]').html('<div style="color:#626262;">You can simply use the flexlayout plugin in any div.</div>');
			this.$el.find('[region="sample-region-2"]').html(			
				'<div style="color:#626262;">'+
					'<div>$SomeDiv.flexlayout([\'1:sample-region-1\', \'3:sample-region-2\'], {</div>'+
					'<div>&nbsp;&nbsp;&nbsp;&nbsp; dir: \'v\'</div>'+
					'<div>&nbsp;&nbsp;&nbsp;&nbsp; adjust: true,</div>'+
					'<div>}</div>'+
				'</div>'
			);
			//for div-split3
			this.$el.find('#div-split3').flexlayout([
					['1:dom-nested-1:', ['1:dom-nested-1-1:','2:dom-nested-1-2:']],
					['2:dom-nested-2:', ['30em:dom-nested-2-1:','1:dom-nested-1-2:']],
				], {
				adjust: true,
				bars: { flex: '0 0 3px', 'background-color': '#CCC'}
			});
			this.$el.find('[region="dom-nested-2-1"]').html(			
				'<div style="color:#626262;">'+
					'<div>You can also use two 2-dimension layout on DOM elements.</div>'+
					'<div>$SomeDiv.flexlayout([</div>'+
					'<div>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; [\'1:nested-1:\', [\'1:nested-1-1:\',\'2:View-3-2:\']],</div>'+
					'<div>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; [\'2:nested-2\', [\'30em:nested-2-1:\',\'1:nested-1-2:\']],</div>'+
					'<div>&nbsp;&nbsp;&nbsp;&nbsp; ], {</div>'+
					'<div>&nbsp;&nbsp;&nbsp;&nbsp; adjust: true,</div>'+
					'<div>&nbsp;&nbsp;&nbsp;&nbsp; bars: { flex: \'0 0 3px\', \'background-color\': "#CCC"}</div>'+
					'<div>}</div>'+
				'</div>'
			);
			//test-layout
			this.$el.find('#test-layout').html(
				'<div style="color:#626262;">'+
					'<div>You can also pass array directly in layout configuration.<br></div>'+
					'<div><br>The layout configuration for the view on the left side is simply: </div>'+
					'<div><br>layout: <br>[\'1:#top\', [\'5\', [[\'1:left\', [\'1:#left-top\', \'2:#left-bottom\']], \'4:center\', \'1:right\']], \'1:.bottom .bottom2 .bottom3\'],</div>'+
				'</div>'
			);
		}
	});

	var View1 = app.view({
		template: '',
		name: 'split-view1',
		layout: {
			split: ['1:region-1-1:@test.md', '2:region-1-2'],
		},
		onReady: function(){
			//set height
			this.$el.css({height: '100%', border: '1px solid black'});
			//show first view
			// this.getRegion('region-1-1').show(app.view({
			// 	template: '<div style="color:#626262;">This is a simply horizontally divided view, which contains two regions. <br>You can load any view to the regions as you like during the onReady event.</div>'
			// }, true));
			//show second view
			this.getRegion('region-1-2').show(app.view({
				template: [
					'<div style="color:white;">',
						'<div>layout: {</div>',
						'<div>&nbsp;&nbsp;&nbsp;&nbsp; split: [\'1:region-1-1\', \'2:region-1-2\'],</div>',
						'<div>}</div>',
					'</div>'
				]
			}, true));
			//color background
			this.$el.find('[region="region-1-2"]').addClass('bg-primary');
		}
	});

	var View2 = app.view({
		name: 'split-view2',
		template: '', 
		layout: {
			split: ['1:region-3-1', '1:View-3-2', '3:region-3-3'],
			dir: 'v',
			adjust: true,
			bars: 'split-vbar'
		},
		onReady: function(){
			this.$el.css({height: '100%', border: '1px solid black'});
			this.getRegion('region-3-1').show(app.view({
				template: '<div style="color:#626262;">You can also divide view vertically. This is a vertically divided view and it can also be adjusted.</div>'
			}, true));
			this.getRegion('region-3-3').show(app.view({
				template: [
					'<div style="color:#626262;">The parent view is divided into three columns.',
						'<div>layout: {</div>',
						'<div>&nbsp;&nbsp;&nbsp;&nbsp; split: [&nbsp;&nbsp;\' 2:region-3-1\',&nbsp;&nbsp; \'2:View-3-2\',&nbsp;&nbsp; \'3:region-3-3\'<br>&nbsp;&nbsp;&nbsp;&nbsp;],</div>',
						'<div>&nbsp;&nbsp;&nbsp;&nbsp; adjust: true</div>',
						'<div>&nbsp;&nbsp;&nbsp;&nbsp; bars: \'split-vbar\'</div>',
						'<div>}</div>',
					'</div>'
				],
			}, true));
			//color background
			this.$el.find('[view="View-3-2"]').addClass('bg-primary');
			this.$el.find('#view-3-2').css({color: 'white'});
		}
	});

	var Temp = app.view({
		name: 'View-3-2',
		template: '<div id="view-3-2" style="color:#626262;">This is a view<br>loaded by using<br>2:View-3-2</div>',
	});

	var View3 = app.view({
		template: '',
		name: 'split-nested',
		layout: {
			split: [
				['1:nested-1:', ['1:nested-1-1:','2:View-3-2:']],
				['2:nested-2:', ['30em:nested-2-1:','1:nested-1-2:']],
			],
			adjust: true,
			bars: { flex: '0 0 3px', 'background-color': "#CCC"}
		},
		onReady: function(){
			this.$el.css({height: '100%', border: '1px solid black'});
			this.getRegion('nested-2-1').show(app.view({
				template: [
					'<div style="color:#626262;">You can simply create a 2-dimension layout by passing an object as split parameter.',
						'<div>layout: {</div>',
						'<div>&nbsp;&nbsp;&nbsp;&nbsp; split: [</div>',
						'<div>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; [\'1:nested-1:\', [\'1:nested-1-1:\',\'2:View-3-2:\']],</div>',
						'<div>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; [\'2:nested-2\', [\'30em:nested-2-1:\',\'1:nested-1-2:\']],</div>',
						'<div>&nbsp;&nbsp;&nbsp;&nbsp; ]</div>',
						'<div>&nbsp;&nbsp;&nbsp;&nbsp; adjust: true</div>',
						'<div>&nbsp;&nbsp;&nbsp;&nbsp; bars: { flex: \'0 0 3px\', \'background-color\': "#CCC"},</div>'+
						'<div>}</div>',
					'</div>'
				]
			}, true));
		}
	});

	var Test = app.view({
		template: '',
		layout: {
			split: ['1:#top', ['5', [['1:left', ['1:#left-top', ['2', ['1:.bg-primary', '1:#left-bottom']]]], '4:center', '1:right']], '1:.bottom .bottom2 .bottom3'],
			bars: false
		},
		onReady: function(){
			var $this = this.$el;
			$this.css({height: '100%', border: '1px solid black'});
			//color the regions
			$this.find('#top').addClass('bg-primary');
			$this.find('[region="right"]').addClass('bg-success');
			$this.find('#left-top').addClass('bg-warning');
			$this.find('#left-bottom').addClass('bg-info');
			$this.find('.bottom').addClass('bg-danger');
		}
	});

})(Application);