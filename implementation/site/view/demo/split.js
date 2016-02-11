;(function(app){

	app.regional('Demo.Split', {
		className: 'row',
		template: [
			'<div class="col-md-6 wrapper-full" region="split-view1"></div>',
			'<div class="col-md-6 wrapper-full" region="split-view2"></div>',
			'<div class="col-md-6 col-md-offset-3 wrapper-full" region="split-view3"></div>',
		],
		onShow: function(){
			this.$el.find('[region="split-view1"]').css({height: '25em'});
			this.$el.find('[region="split-view2"]').css({height: '25em'});
			this.$el.find('[region="split-view3"]').css({height: '25em'});
			this.getRegion('split-view1').show(new View1());
			this.getRegion('split-view2').show(new View2());
			this.getRegion('split-view3').show(new View3());
		}
	});

	var View1 = app.view({
		name: 'split-view1',
		template: [
			'<div style="color:#626262;">This is a horizontally divided view.</div>',
			'<div style="color:#626262;">',
				'<div>layout: {</div>',
				'<div>&nbsp;&nbsp;&nbsp;&nbsp; direction: \'h\'</div>',
				'<div>&nbsp;&nbsp;&nbsp;&nbsp; split: 1</div>',
				'<div>&nbsp;&nbsp;&nbsp;&nbsp; options: {</div>',
				'<div>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; adjustable: false,</div>',
				'<div>&nbsp;&nbsp;&nbsp;&nbsp; }</div>',
				'<div></div>',
			'</div>',
		],
		layout: {
			direction: 'h',
			split: 1,
			options: {
				adjustable: false,
			}
		},
		onRender: function(){
			this.$el.css({height: '100%', border: '1px solid black'});
		}
	});

	var View2 = app.view({
		name: 'split-view2',
		template: [
			'<div style="color:#626262;">This is a vertically divided view.</div>',
			'<div style="color:#626262;">',
				'<div>layout: {</div>',
				'<div>&nbsp;&nbsp;&nbsp;&nbsp; direction: \'h\'</div>',
				'<div>&nbsp;&nbsp;&nbsp;&nbsp; split: [2,3,1]</div>',
				'<div>&nbsp;&nbsp;&nbsp;&nbsp; options: {</div>',
				'<div>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; adjustable: true,</div>',
				'<div>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; buffer: 60</div>',
				'<div>&nbsp;&nbsp;&nbsp;&nbsp; }</div>',
			'</div>',
			'<div></div>',
		],
		layout: {
			direction: 'v',
			split: [2,3,1],
			options: {
				adjustable: true,
				buffer: 60
			}
		},
		onRender: function(){
			this.$el.css({height: '100%', border: '1px solid black'});
		}
	});

	var View3 = app.view({
		name: 'split-view3',
		template: [
			'<div style="color:#626262;">This is a nested divided view.</div>',
			'<div style="color:#626262;">',
				'<div>layout: {</div>',
				'<div>&nbsp;&nbsp;&nbsp;&nbsp; direction: \'h\'</div>',
				'<div>&nbsp;&nbsp;&nbsp;&nbsp; split: [2,3,1]</div>',
				'<div>&nbsp;&nbsp;&nbsp;&nbsp; options: {</div>',
				'<div>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; adjustable: true,</div>',
				'<div>&nbsp;&nbsp;&nbsp;&nbsp; }</div>',
			'</div>',
			'<div region="nested"></div>',
		],
		layout: {
			direction: 'v',
			split: [2,3,1],
			options: {
				adjustable: true
			}
		},
		onRender: function(){
			this.$el.css({height: '100%',border: '1px solid black'});
			this.getRegion('nested').show(app.view({
				template:[
					'<div></div>',
					'<div></div>',
				],
				layout: {
					direction: 'h',
					split: [5],
					options: {
						adjustable: true
					}
				},
				onRender: function(){
					this.$el.css({height: '100%'});
				}
			}, true));
		}
	});

})(Application);