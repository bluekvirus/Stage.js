;(function(app){

	app.regional('Demo.Split', {
		template: [
			'<div class="col-md-6 wrapper-full" region="split-view1"></div>',
			'<div class="col-md-6 wrapper-full" region="split-view2"></div>',
			'<div class="col-md-6 wrapper-full" region="split-view3"></div>',
			//'<div class="col-md-6 wrapper-full" region="split-view4"></div>',
			'<div class="col-md-6 wrapper-full" style="height:25em;"><div id="test" style="border: 1px solid black;"></div></div>',
		],
		onShow: function(){
			this.$el.find('[region="split-view1"]').css({height: '25em'});
			this.$el.find('[region="split-view2"]').css({height: '25em'});
			this.$el.find('[region="split-view3"]').css({height: '25em'});
			//this.$el.find('[region="split-view4"]').css({height: '25em'});
			this.getRegion('split-view1').show(new View1());
			this.getRegion('split-view2').show(new View2());
			this.getRegion('split-view3').show(new View3());
			//this.getRegion('split-view4').show(new View4());
			//for test
			this.$el.find('#test').split({
				split: ['1:sample-region-1', '2:sample-region-2'],
				direction: 'v',
				adjustable: true,
			});
			this.$el.find('[region="sample-region-1"]').html('<div style="color:#626262;">You can simply use the split plugin in any div.</div>');
			this.$el.find('[region="sample-region-2"]').html(			
				'<div style="color:#626262;">'+
					'<div>$SomeDiv.split({</div>'+
					'<div>&nbsp;&nbsp;&nbsp;&nbsp; direction: \'h\'</div>'+
					'<div>&nbsp;&nbsp;&nbsp;&nbsp; split: [\'1:sample-region-1\', \'2:sample-region-2\'],</div>'+
					'<div>&nbsp;&nbsp;&nbsp;&nbsp; options: {</div>'+
					'<div>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; adjustable: true,</div>'+
					'<div>&nbsp;&nbsp;&nbsp;&nbsp; });</div>'+
				'</div>'
			);

		}
	});

	var View1 = app.view({
		template: ' ',
		name: 'split-view1',
		layout: {
			direction: 'h',
			split: ['1:region-1-1', '2:region-1-2'],
			options: {
				adjustable: false,
			}
		},
		onShow: function(){
			this.$el.css({height: '100%', border: '1px solid black'});
			this.$el.find('[region="region-1-1"]').html('<div style="color:#626262;">This is a FREE horizontally divided view, which contains two regions. <br>You can load any view to the regions as you like during the onShow event.</div>');
			this.$el.find('[region="region-1-2"]').html(			
				'<div style="color:#626262;">'+
					'<div>layout: {</div>'+
					'<div>&nbsp;&nbsp;&nbsp;&nbsp; direction: \'h\'</div>'+
					'<div>&nbsp;&nbsp;&nbsp;&nbsp; split: [\'1:region-1-1\', \'2:region-1-2\'],</div>'+
					'<div>&nbsp;&nbsp;&nbsp;&nbsp; options: {</div>'+
					'<div>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; adjustable: false,</div>'+
					'<div>&nbsp;&nbsp;&nbsp;&nbsp; }</div>'+
				'</div>'
			);
		}
	});

	var View2 = app.view({
		name: 'split-view2',
		template: ' ',
		layout: {
			direction: 'v',
			split: ['3:region-2-1', '2:region-2-2', '25px:region-fixed', '3:region-2-3', '1:region-2-4'],
			adjustable: true,
			min: 10
		},
		onShow: function(){
			this.$el.css({height: '100%', border: '1px solid black'});
			this.$el.find('[region="region-2-1"]').html('<div style="color:#626262;">This is a FREE vertically divided view, which contains 3 regions, 1 View, and a fixed width column.</div>');
			this.$el.find('[region="region-2-2"]').html('<div style="color:#626262;">The right one is a fixed width column, so you cannot change its width even though adjustable is true.</div>');
			this.$el.find('[region="region-2-3"]').html(
				'<div style="color:#626262;">'+
					'<div>layout: {</div>'+
					'<div>&nbsp;&nbsp;&nbsp;&nbsp; direction: \'h\'</div>'+
					'<div>&nbsp;&nbsp;&nbsp;&nbsp; split: [\'3:region-2-1\', \'2:region-2-2\', \'25px\', \'3:region-2-4\', \'1:\']</div>'+
					'<div>&nbsp;&nbsp;&nbsp;&nbsp; adjustable: true,</div>'+
					'<div>&nbsp;&nbsp;&nbsp;&nbsp; min: 10</div>'+
					'<div>&nbsp;&nbsp;&nbsp;&nbsp; }</div>'+
				'</div>'
			);
		}
	});

	var View3 = app.view({
		name: 'split-view3',
		template: ' ', 
		layout: {
			direction: 'h',
			split: ['xs-12:region-3-1', 'xs-6:region-3-2', 'md-2:region-3-3'],
			type: 'bootstrap'
		},
		onShow: function(){
			this.$el.css({height: '100%', border: '1px solid black'});
			this.$el.find('[region="region-3-1"]').prepend($('<div style="color:#626262;">You can also divide by using bootstrap layout to divide view.</div>'));
			this.$el.find('[region="region-3-2"]').prepend($('<div style="color:#626262;">This is a view divided into three bootstrap rows.'+
				'<div>layout: {</div>'+
				'<div>&nbsp;&nbsp;&nbsp;&nbsp; direction: \'h\'</div>'+
				'<div>&nbsp;&nbsp;&nbsp;&nbsp; split: [\'xs-12:region-3-1\', \'xs-6:region-3-2\', \'md-2:region-3-3\'],</div>'+
				'<div>&nbsp;&nbsp;&nbsp;&nbsp; type: bootstrap</div>'+
				'</div>'
			));
			this.$el.find('[region="region-3-3"]').prepend($('<div style="color:#626262;">Note that when divide horizontally with bootstrap, it will NOT hornor the column class.</div>'));
		}
	});

/*	var View4 = app.view({
		name: 'split-view4',
		template: ' ', 
		layout: {
			direction: 'v',
			split: ['xs-12:region-4-1', 'xs-6:region-4-2', 'md-6:region-4-3'],
			type: 'bootstrap'
		},
		onShow: function(){
			this.$el.css({height: '100%', border: '1px solid black'});
			this.$el.find('[region="region-4-1"]').prepend($('<div style="color:#626262;">Similar for vertically bootstrap dividing.</div>'));
			this.$el.find('[region="region-4-2"]').prepend($('<div style="color:#626262;">'+
				'<div>layout: {</div>'+
				'<div>&nbsp;&nbsp;&nbsp;&nbsp; direction: \'v\'</div>'+
				'<div>&nbsp;&nbsp;&nbsp;&nbsp; split: [\'xs-12:region-4-1\', \'xs-6:region-4-2\', \'md-6:region-4-3\'],</div>'+
				'<div>&nbsp;&nbsp;&nbsp;&nbsp; type: bootstrap</div>'+
				'</div>'
			));
			this.$el.find('[region="region-4-3"]').prepend($('<div style="color:#626262;">Note that when divide vertically with bootstrap, it will hornor the column class.</div>'));
		}
	});*/

})(Application);