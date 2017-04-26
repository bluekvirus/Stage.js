;(function(app){

	app.view('Demo.Coop', {
		className: 'row',
		template: [
			'<div style="margin-top:5em;">',
				'<div class="col-md-6">',
					'<div style="text-align:center"><h4>View 1</h4></div>',
					'<div region="view-left" style="width:100%;height:25em;border:1px #999 solid;"></div>',
				'</div>',
				'<div class="col-md-6">',
					'<div style="text-align:center"><h4>View 2</h4></div>',
					'<div region="view-right" style="width:100%;height:25em;border:1px #999 solid;"></div>',
				'</div>',
			'</div>',
		],
		onReady: function(){
			this.show('view-left', ViewLeft);
			this.show('view-right', ViewRight);
		},
		onUpdateLeft: function(options){
			this.getViewIn('view-left').getRegion('temp').show(app.view({
				template: [
					'<div class="wrapper">nav/breadcrumb/'+options.text+'</div>',
					'<div class="wrapper" id="fakebody" style="height:7em;color:white;background-color:'+options.color+'">content for '+options.text+' view',
						'<div>onUpdateLeft: function(options){...}</div>',
					'</div>',
				],
			}, true));
		}
	});

	var ViewLeft = app.view({
		className: 'coop-left',
		template: [
			'<div style="height:50%;width:100%;">',
				'<div class="form-horizontal" style="position:relative;top:50%;transform:translateY(-50%);">',
					'<div editor="editor1"></div>',
				'</div>',
			'</div>',
			'<div style="top:50%;width:100%;border-top:1px solid #999;"></div>',
			'<div style="height:50%;width:100%;top:51%;">',
				'<div region="temp"></div>',
			'</div>',
		],
		editors: {
			editor1: {
				type: 'text',
				label: 'Input',
				placeholder: 'type something and see..',
				help: "app.coop('update-right', text)",
				layout: {
					label: 'col-md-4',
					field: 'col-md-6',
				}
			}
		},
		onReady: function(){
			//make view height 100%
			$('.coop-left').css({height: '100%'});
			//trigger coop when editor has changed
			$('input[type="text"]').on('keyup', function(){
				app.coop('update-right', $(this).val());
			});
		},
	});

	var ViewRight = app.view({
		className: 'coop-right',
		template: [
			'<div style="height:50%;width:100%;">',
				'<div class="form-horizontal" style="position:relative;top:50%;transform:translateY(-50%);">',
					//'<div class="wrapper-2x">Below is the text from view 1: </div>',
					'<div editor="editor2"></div>',
				'</div>',
			'</div>',
			'<div style="top:50%;width:100%;border-top:1px solid #999;"></div>',
			'<div style="height:50%;width:100%;top:51%;">',
				'<div style="width:77%;position:relative;top: 50%;left: 50%;transform: translate(-50%, -50%);">',
					'<div action="info" class="btn btn-info">Click Me & See!</div>',
					'<div action="warning" class="btn btn-warning">Click Me & See!</div>',
					'<div action="success" class="btn btn-success">Click Me & See!</div>',
					'<div style="text-align:center;color:#626262;">this.coop("update-left", {options});</div>',
				'</div>',
			'</div>',
		],
		coop: ['update-right'],
		editors: {
			editor2: {
				type: 'text',
				label: 'Output',
				placeholder: 'wait and see..',
				help: "onUpdateRight: function(text){...}",
				layout: {
					label: 'col-md-4',
					field: 'col-md-6',
				}
			}
		},
		actions: {
			info: function(){
				this.coop('update-left',{
					text: 'info',
					color: '#7E3F9D'
				});
			},
			success: function(){
				this.coop('update-left',{
					text: 'success',
					color: '#E45C00',
				});
			},
			warning: function(){
				this.coop('update-left',{
					text: 'warning',
					color: '#2F8912',
				});
			}
		},
		onUpdateRight: function(text){
			this.getEditor('editor2').setVal(text);
			
		},
		onReady: function(){
			//make view height 100%
			$('.coop-right').css({height: '100%'});
		}
	});

})(Application);