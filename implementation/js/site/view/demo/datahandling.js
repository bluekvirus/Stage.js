;(function(app){

	app.view('Demo.Datahandling', {
		className: 'row wrapper-2x',
		template: [
			'<div class="col-md-6">',
				'<div style="text-align:center"><h3>Use Data Attribute</h3></div>',
				'<div region="view1" style="border:1px #999 solid;"></div>',
			'</div>',
			'<div class="col-md-6">',
				'<div style="text-align:center"><h3>Use Parent Data</h3></div>',
				'<div region="view2" style="border:1px #999 solid;"></div>',
			'</div>',
			'<div class="col-md-12">',
				'<div style="text-align:center"><h3>Hookup RESTful APIs</h3></div>',
				'<div region="view3" style="border:1px #999 solid;"></div>',
			'</div>',
		],
		onReady: function(){
			this.getRegion('view1').show(new View1());
			this.getRegion('view2').show(new View2());
			this.getRegion('view3').show(new View3());
		},
	});

	var View1 = app.view({
		template: [
			'<div region="real"></div>',
			'<div region="mock"></div>'
		],
		onReady: function(){
			//real json data
			this.getRegion('real').show(app.view({
				template: [
					'<div class="wrapper-full">',
						'<div style="color:#626262;">data: "/realdata"</div>',
						'<div style="color:#626262;">"realdata.json" is found, so fetched directly.</div>',
						'<table class="table table-striped table-hover table-condensed table-bordered">',
							'<col width="40%">',
							'<col width="60%">',
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
			}));
			//mock js data
			this.getRegion('mock').show(app.view({
				template: [
					'<div class="wrapper-full">',
						'<div style="color:#626262;">data: "/mockdata"</div>',
						'<div style="color:#626262;">"mockdata.json" is not found, so fetch "mockdata.mock.js" instead.</div>',
						'<table class="table table-striped table-hover table-condensed table-bordered">',
							'<col width="40%">',
							'<col width="60%">',
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
			}));
		}
	});

	var View2 = app.view({
		template: [
			'<div region="parent1"></div>',
			'<div region="parent2"></div>'
		],
		data: '/mockdata',
		onReady: function(){
			this.getRegion('parent1').show(app.view({
				template: [
					'<div class="wrapper-full">',
						'<div style="color:#626262;">In child view: useParentData: "...",</div>',
						'<div style="color:#626262;">"..." should be the key desired from parent\'s data(e.g. "ip")</div>',
						'<table class="table table-striped table-hover table-condensed table-bordered">',
							'<col width="40%">',
							'<col width="60%">',
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
			}));
			this.getRegion('parent2').show(new Parent2({data: this.get()}));
		}
	});

	var Parent2 = app.view({
		template: [
			'<div class="wrapper-full">',
				'<div style="color:#626262;">Pass in data as options.</div>',
				'<div style="color:#626262;">Parent: this.getRegion(\'...\').show(new View({data: ... }))</div>',
				'<table class="table table-striped table-hover table-condensed table-bordered">',
					'<col width="40%">',
					'<col width="60%">',
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
		className: 'wrapper-full',
		template: [
			'<div>GET:</div>',
			'<div style="color:#626262;">',
				'Application.remote(\'url\');',
				'<div style="color:grey;">or</div>',
				'Application.remote({ <br>&nbsp;&nbsp;&nbsp;&nbsp;url: \'...\'<br> });',
			'</div>',
			'<br>',
			'<div>GET: /user/details?id=1</div>',
			'<div style="color:#626262;">',
				'Application.remote(\'user/details?id=1\');',
				'<div style="color:grey;">or</div>',
				'Application.remote(\'user/details\', null, {querys: {id: 1}});',
			'</div>',
			'<br>',
			'<div>GET: /abc?x=1&y=2</div>',
			'<div style="color:#626262;">',
				'Application.remote(\'abc\', null, {params/querys: {x: 1, y: 2}});',
				'<div style="color:grey;">or</div>',
				'Application.remote({',
					'<br>&nbsp;&nbsp;&nbsp;&nbsp;url: \'abc\'',
					'<br>&nbsp;&nbsp;&nbsp;&nbsp;params/querys: {',
					'<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; x: 1,',
					'<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; y: 2',
					'<br>&nbsp;&nbsp;&nbsp;&nbsp;}',
				'<br>',
				'});',
			'</div>',
			'<br>',
			'<div>POST: /user</div>',
			'<div style="color:#626262;">',
				'Application.remote(\'user\', {payload w/o id});',
				'<div style="color:grey;">or</div>',
				'Application.remote({<br>&nbsp;&nbsp;&nbsp;&nbsp;url: \'user\'<br>&nbsp;&nbsp;&nbsp;&nbsp;//without id<br>&nbsp;&nbsp;&nbsp;&nbsp;payload: {...}<br> });',
			'</div>',
			'<br>',
			'<div>PUT: /user?id=1</div>',
			'<div style="color:#626262;">',
				'Application.remote(\'user\', {payload w/ id});',
				'<div style="color:grey;">or</div>',
				'Application.remote({<br>&nbsp;&nbsp;&nbsp;&nbsp;url: \'user\'<br>&nbsp;&nbsp;&nbsp;&nbsp;//non-empty & with id<br>&nbsp;&nbsp;&nbsp;&nbsp;payload: {id: 1, ...}<br> });',
			'</div>',
			'<br>',
			'<div>DELETE: /user?id=1</div>',
			'<div style="color:#626262;">',
				'Application.remote(\'user\', {just id: 1});',
				'<div style="color:grey;">or</div>',
				'Application.remote({<br>&nbsp;&nbsp;&nbsp;&nbsp;url: \'user\'<br>&nbsp;&nbsp;&nbsp;&nbsp;//only id<br>&nbsp;&nbsp;&nbsp;&nbsp;payload: {id: 1}<br> });',
			'</div>',
		],
	});

})(Application);