;(function(app){

	 app.view('Demo.Templating', {
		className: 'row',
		template: [
			'<div class="col-md-8 wrapper">',
				'<div style="text-align:center;"><h3>Nesting</h3></div>',
				'<div id="left"  style="border:1px solid #999;height:100%;">',
					'<div class="row" style="height:100%;">',
						'<div class="col-md-6" style="height:50%;"><div class="wrapper-full" style="height:100%;"><div style="height:100%;border:1px solid #999;" region="nest-view1" view="demo/viewInTemplate"></div></div></div>',
						'<div class="col-md-6" style="height:50%;"><div class="wrapper-full" style="height:100%;"><div style="height:100%;border:1px solid #999;" region="nest-view2"></div></div></div>',
						'<div class="col-md-6 col-md-offset-3" style="height:50%;"><div class="wrapper-full" style="height:100%;"><div style="height:100%;border:1px solid #999;" region="nest-view3">',
							'<div view="@remoteview.html"></div>',
						'</div></div></div>',
					'</div>',
				'</div>',
			'</div>',
			'<div class="col-md-4">',
				'<div style="text-align:center;"><h3>Template</h3></div>',
				'<div id="right" class="row">',
					'<div class="col-md-12 wrapper"><div style="height:8em;border:1px solid #999;" region="view1" view="demo/viewInTemplate"></div></div>',
					'<div class="col-md-12 wrapper"><div style="height:8em;border:1px solid #999;" region="view2"></div></div>',
					'<div class="col-md-12 wrapper">',
						'<div style="height:8em;border:1px solid #999;" region="view3">',
							'<div view="@remoteview.html"></div>',
						'</div>',
					'</div>',
				'</div>',
			'</div>',
		],
		onShow: function(){
			//match the height for both sides
			var $el = this.$el,
				height = $el.find('#right').innerHeight(),
				$elem = $el.find('[view="@remoteview.html"]');
			$el.find('#left').height(height);
			//show view2
			this.getRegion('view2').show(new View2());
			this.getRegion('nest-view2').show(new View2());
			//style for view3
			$elem.css({height: '100%', width: '100%'});	
			$($elem[0].firstChild).css({height: '100%', width: '70%', position:'relative', left:'50%', transform:'translateX(-50%)'});
			$($elem[1].firstChild).css({height: '100%', width: '70%', position:'relative', left:'50%', transform:'translateX(-50%)'});
		},
	});

	var View2 = app.view({
		className: 'view2-holder',
		template: [
			'<div style="text-align:center;position:relative;top:50%;transform:translateY(-50%);">',
				'<div class="text-info">',
					'<div>&lt;div region="someRegion" &gt;</div>',
					'<div>this.getRegion("someRegion").show(...);</div>',
				'</div>',
			'</div>',
		],
		onShow: function(){
			$('.view2-holder').css({height: '100%', width: '100%'});
		}
	});

})(Application);