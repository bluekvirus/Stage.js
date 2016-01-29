;(function(app){

	app.regional('Demo.Datahandling',{
		className: 'row wrapper-2x',
		template: [
			'<div class="col-md-6">',
				'<div style="text-align:center"><h3>Use Data Directly</h3></div>',
				'<div region="view1" style="border:1px #999 solid;"></div>',
			'</div>',
			'<div class="col-md-6">',
				'<div style="text-align:center"><h3>Use Parent Data</h3></div>',
				'<div region="view2" style="border:1px #999 solid;"></div>',
			'</div>',
			'<div class="col-md-6 col-md-offset-3">',
				'<div style="text-align:center;"><h3>Remote APIs</h3></div>',
				'<div region="view3" style="border:1px #999 solid;"></div>',
			'</div>',
		],
		onShow: function(){
			this.getRegion('view1').show(new View1());
			this.getRegion('view2').show(new View2());
			this.getRegion('view3').show(new View3());
			//adjust view 3 height
			/*var $elem = this.$el,
				tempHeight = $elem.find('[region="view2"]').height();
			console.log(tempHeight);
			$elem.find('[region="view3"]').css({height: tempHeight});*/
		},
	});

	var View1 = app.view({
		template: [
			'<div region="real"></div>',
			'<div region="mock"></div>'
		],
		onShow: function(){
			//real json data
			this.getRegion('real').show(app.view({
				template: [
					'<div class="wrapper-full">',
						'<div style="text-align:center;color:#626262;">data: "/realdata"</div>',
						'<div style="text-align:center;color:#626262;">"realdata.json" is found, so fetched directly.</div>',
						'<table class="table table-striped table-hover table-condensed table-bordered">',
							'<thead>',
								'<tr>',
									'<td>User</td>',
									'<td>IP Address</td>',
								'</tr>',
							'</thead>',
							'<tbody>',
								'{{#items}}',
									'<tr>',
										'<td>{{id}}</td>',
										'<td>{{ip}}</td>',
									'</tr>',
								'{{/items}}', 
							'</tbody>',
						'</table>',
					'</div>',
				],
				data: '/realdata',
			}, true));
			//mock js data
			this.getRegion('mock').show(app.view({
				template: [
					'<div class="wrapper-full">',
						'<div style="text-align:center;color:#626262;">data: "/mockdata"</div>',
						'<div style="text-align:center;color:#626262;">"mockdata.json" is not found, <br>fetch "mockdata.mock.js" instead.</div>',
						'<table class="table table-striped table-hover table-condensed table-bordered">',
							'<thead>',
								'<tr>',
									'<td>User</td>',
									'<td>IP Address</td>',
								'</tr>',
							'</thead>',
							'<tbody>',
								'{{#items}}',
									'<tr>',
										'<td>{{id}}</td>',
										'<td>{{ip}}</td>',
									'</tr>',
								'{{/items}}', 
							'</tbody>',
						'</table>',
					'</div>',
				],
				data: '/mockdata',
			}, true));
		}
	});

	var View2 = app.view({
		template: [
			'<div region="parent1"></div>',
			'<div region="parent2"></div>'
		],
		data: '/mockdata',
		onDataRendered: function(){
			this.getRegion('parent1').show(app.view({
				template: [
					'<div class="wrapper-full">',
						'<div style="text-align:center;color:#626262;">useParentData: "...",</div>',
						'<div style="text-align:center;color:#626262;">"..." should be the key desired from parent\'s data</div>',
						'<table class="table table-striped table-hover table-condensed table-bordered">',
							'<thead>',
								'<tr>',
									'<td>User</td>',
									'<td>IP Address</td>',
								'</tr>',
							'</thead>',
							'<tbody>',
								'{{#items}}',
									'<tr>',
										'<td>{{id}}</td>',
										'<td>{{ip}}</td>',
									'</tr>',
								'{{/items}}', 
							'</tbody>',
						'</table>',
					'</div>',
				],
				useParentData: 'items'
			},true));

			this.getRegion('parent2').show(new Parent2({data: this.data}));
		}
	});

	var Parent2 = app.view({
		initilize: function(options){
			this.data = options.data;
		},
		template: [
			'<div class="wrapper-full">',
				'<div style="text-align:center;color:#626262;">Pass in data as options.</div>',
				'<div style="text-align:center;color:#626262;">Child, initilize: function(options){this.data = options.data;}</div>',
				'<div style="text-align:center;color:#626262;">Parent, this.getRegion(\'...\').show(new View({data:this.data}))</div>',
				'<table class="table table-striped table-hover table-condensed table-bordered">',
					'<thead>',
						'<tr>',
							'<td>User</td>',
							'<td>IP Address</td>',
						'</tr>',
					'</thead>',
					'<tbody>',
						'{{#items}}',
							'<tr>',
								'<td>{{id}}</td>',
								'<td>{{ip}}</td>',
							'</tr>',
						'{{/items}}', 
					'</tbody>',
				'</table>',
			'</div>',
		]
	});

	var View3 = app.view({
		className:'wrapper-full',
		template:[
			'<div>GET:</div>',
			'<div style="color:#626262;">',
				'Application.remote(\'...\')<br>',
				'Application.remote({ <br>&nbsp;&nbsp;&nbsp;&nbsp;url: \'...\'<br> });',
			'</div>',
			'<br>',
			'<div>GET: /user/1/details</div>',
			'<div style="color:#626262;">',
				'Application.remote(\'user/1/details\');<br>',
				'Application.remote(\'user\', null, {_id: 1, _method: \'details\'});',
			'</div>',
			'<br>',
			'<div>POST:</div>',
			'<div style="color:#626262;">',
				'Application.remote({<br>&nbsp;&nbsp;&nbsp;&nbsp;url: \'...\'<br>&nbsp;&nbsp;&nbsp;&nbsp;//without _id<br>&nbsp;&nbsp;&nbsp;&nbsp;paylod: {...}<br> });',
			'</div>',
			'<br>',
			'<div>PUT: /user/1</div>',
			'<div style="color:#626262;">',
				'Application.remote({<br>&nbsp;&nbsp;&nbsp;&nbsp;url: \'user\'<br>&nbsp;&nbsp;&nbsp;&nbsp;//non-empty & with _id<br>&nbsp;&nbsp;&nbsp;&nbsp;paylod: {_id: 1, ...}<br> });',
			'</div>',
			'<br>',
			'<div>DELETE: /user/1</div>',
			'<div style="color:#626262;">',
				'Application.remote({<br>&nbsp;&nbsp;&nbsp;&nbsp;url: \'user\'<br>&nbsp;&nbsp;&nbsp;&nbsp;//only _id<br>&nbsp;&nbsp;&nbsp;&nbsp;paylod: {_id: 1}<br> });',
			'</div>',
		],
	});

})(Application);