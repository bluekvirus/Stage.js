;(function(app){

	app.view('Demo.Lock',{
		className: 'row',
		template: [
			'<div class="col-md-6 col-md-offset-3" region="view-lock" view="View-lock"></div>',
			'<div class="col-md-6 col-md-offset-2">',
				'<div class="btn btn-info" style="position:relative;left:50%;transform:translateX(-50%);" action="lock-icon">click me to lock by icon</div>',
				'<div class="btn btn-primary" style="position:relative;left:50%;transform:translateX(-50%);" action="lock-view">click me to lock by view</div>',
			'</div>',
		],
		flag: false,//for demo purpose
		actions: {
			'lock-icon': function(){
				this.flag = !this.flag;
				this.lock('view-lock', this.flag, 'fa fa-spinner fa-spin fa-3x');
			},
			'lock-view': function(){
				this.flag = !this.flag;
				this.lock('view-lock', this.flag, Test);
			}
		}
	});

	app.view('View-lock', {
		template: [
			'<div style="height:25em;border:1px solid #999;">',
				'<div style=";position:relative;top:50%;transform:translateY(-50%);">',
					'<div style="text-align:center;color:#626262">Someview.lock(\'region-name\', \'flag\',\'spin-view\');</div>',
				'</div>',
			'</div>',
		]
	});

	var Test = app.view({
		template: '<div style="color:red;"><strong>I am the locker view, who is passed in use View.lock().</strong></div>',
	});

})(Application);