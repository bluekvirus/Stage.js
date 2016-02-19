;(function(app){

	app.regional('Demo.Split', {
		template: [
			'<div class="col-md-6 wrapper-full" region="split-view1"></div>',
			'<div class="col-md-6 wrapper-full" region="split-view2"></div>',
			'<div class="col-md-6 wrapper-full" style="height:25em;"><div id="div-split1" style="border: 1px solid black;"></div></div>',
			'<div class="col-md-6 wrapper-full" style="height:25em;"><div id="div-split2" style="border: 1px solid black;"></div></div>',
		],
		onShow: function(){
			this.$el.find('[region="split-view1"]').css({height: '25em'});
			this.$el.find('[region="split-view2"]').css({height: '25em'});
			this.getRegion('split-view1').show(new View1());
			this.getRegion('split-view2').show(new View2());
			//for div-split1
			this.$el.find('#div-split1').split({
				split: ['1:r1', '2:r2', '50px:r3'],
				direction: 'h',
				adjustable: true,
			});
			this.$el.find('[region="r1"]').html('<div style="color:#626262;">You can simply use the split plugin in any div.</div>');
			this.$el.find('[region="r2"]').html(			
				'<div style="color:#626262;">'+
					'<div>$SomeDiv.split({</div>'+
					'<div>&nbsp;&nbsp;&nbsp;&nbsp; direction: \'h\'</div>'+
					'<div>&nbsp;&nbsp;&nbsp;&nbsp; split: [\'1:r1\', \'2:r2\', \'50px:r3\'],</div>'+
					'<div>&nbsp;&nbsp;&nbsp;&nbsp; adjustable: true,</div>'+
					'<div>}</div>'+
				'</div>'
			);
			this.$el.find('[region="r3"]').html('<div style="color:#626262;">If a region has a fixed px/em width/height, it cannot be adjusted even if adjustable is true.</div>');
			//for div-split2
			this.$el.find('#div-split2').split({
				split: ['1:sample-region-1', '2:sample-region-2'],
				direction: 'v',
				adjustable: true,
			});
			this.$el.find('[region="sample-region-1"]').html('<div style="color:#626262;">You can simply use the split plugin in any div.</div>');
			this.$el.find('[region="sample-region-2"]').html(			
				'<div style="color:#626262;">'+
					'<div>$SomeDiv.split({</div>'+
					'<div>&nbsp;&nbsp;&nbsp;&nbsp; direction: \'v\'</div>'+
					'<div>&nbsp;&nbsp;&nbsp;&nbsp; split: [\'1:sample-region-1\', \'2:sample-region-2\'],</div>'+
					'<div>&nbsp;&nbsp;&nbsp;&nbsp; adjustable: true,</div>'+
					'<div>}</div>'+
				'</div>'
			);
		}
	});

	var View1 = app.view({
		template: '',
		name: 'split-view1',
		layout: {
			split: ['1:region-1-1', '2:region-1-2'],
		},
		onShow: function(){
			//set height
			this.$el.css({height: '100%', border: '1px solid black'});
			//show first view
			this.getRegion('region-1-1').show(app.view({
				template: '<div style="color:#626262;">This is a simply horizontally divided view, which contains two regions. <br>You can load any view to the regions as you like during the onShow event.</div>'
			},true));
			//show second view
			this.getRegion('region-1-2').show(app.view({
				template: [
					'<div style="color:#626262;">',
						'<div>layout: {</div>',
						'<div>&nbsp;&nbsp;&nbsp;&nbsp; split: [\'1:region-1-1\', \'2:region-1-2\'],</div>',
						'<div>}</div>',
					'</div>'
				]
			},true));
		}
	});

	var View2 = app.view({
		name: 'split-view3',
		template: '', 
		layout: {
			split: ['2:region-3-1', '2:View-3-2', '3:region-3-3'],
			direction: 'v',
			adjustable: true,
		},
		onShow: function(){
			this.$el.css({height: '100%', border: '1px solid black'});
			this.getRegion('region-3-1').show(app.view({
				template: '<div style="color:#626262;">You can also divide view vertically. This is a vertically divided view and it can also be adjusted.</div>'
			}, true));
			this.getRegion('region-3-3').show(app.view({
				template: [
					'<div style="color:#626262;">The parent view is divided into three columns.',
						'<div>layout: {</div>',
						'<div>&nbsp;&nbsp;&nbsp;&nbsp; split: [<br>&nbsp;&nbsp;\' 2:region-3-1\',<br>&nbsp;&nbsp; \'2:View-3-2\',<br>&nbsp;&nbsp; \'3:region-3-3\'<br>&nbsp;&nbsp;&nbsp;&nbsp;],</div>',
						'<div>&nbsp;&nbsp;&nbsp;&nbsp; adjustable: true</div>',
						'<div>}</div>',
					'</div>'
				],
			},true));
		}
	});

	var Temp = app.view({
		name: 'View-3-2',
		template: '<div style="color:#626262;">This is a view<br>loaded by using<br>2:View-3-2</div>',
	});

})(Application);