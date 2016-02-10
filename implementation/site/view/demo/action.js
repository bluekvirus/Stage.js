;(function(app){

	app.view('Demo.Action',{
		className: 'row wrapper',
		template: [
			'<div class="col-md-3">',
				'<div style="height:16em;" region="default"></div>',
			'</div>',
			'<div class="col-md-3">',
				'<div style="height:16em;" region="click">click</div>',
			'</div>',
			'<div class="col-md-3">',
				'<div style="height:16em;" region="contextmenu">contextmenu</div>',
			'</div>',
			'<div class="col-md-3">',
				'<div style="height:16em;" region="mousedown">mousedown</div>',
			'</div>',
			'<div class="col-md-3">',
				'<div style="height:16em;" region="mousemove">mousemove</div>',
			'</div>',
			'<div class="col-md-3">',
				'<div style="height:16em;" region="mouseup">mouseup</div>',
			'</div>',
			'<div class="col-md-3">',
				'<div style="height:16em;" region="mouseenter">mouseenter</div>',
			'</div>',
			'<div class="col-md-3">',
				'<div style="height:16em;" region="mouseover">mouseover</div>',
			'</div>',
			'<div class="col-md-3">',
				'<div style="height:18em;" region="focus">focus</div>',
			'</div>',
			'<div class="col-md-3">',
				'<div style="height:18em;" region="key">key</div>',
			'</div>',
			'<div class="col-md-6">',
				'<div style="height:18em;" region="inputs">key</div>',
			'</div>'
		],
		onShow: function(){
			this.default.show(new Default());
			this.click.show(new Click());
			this.contextmenu.show(new Contextmenu());
			this.mousedown.show(new Mousedown());
			this.mousemove.show(new Mousemove());
			this.mouseup.show(new Mouseup());
			this.mouseenter.show(new Mouseenter());
			this.mouseover.show(new Mouseover());
			this.focus.show(new Focus());
			this.key.show(new Key());
			this.inputs.show(new Inputs());
			//adjust height for the views
			$('.action-demo-view').css({height: '100%', width:'100%'});
		}
	});

	var Default = app.view({
		className: 'action-demo-view wrapper',
		template: [
			'<div style="height:100%;width:100%;border:1px solid #999;">',
				'<div style="position:relative;top:50%;left:50%;transform:translate(-50%, -50%);width:85%;text-align:center;color:#626262;">',
					'<div>The default action trigger is click.</div>',
					'<div>&lt;div ... action="..." &gt;</div>',
					'<div><br></div>',
					'<div class="btn btn-sm btn-info" action="try-default">Try Me!</div>',
				'</div>',
			'</div>',
		],
		actions: {
			'try-default': function(){
				 app.notify('Action triggered!', 'Default action!');
			}
		}
	});

	var Click = app.view({
		className: 'action-demo-view wrapper',
		template: [
			'<div style="height:100%;width:100%;border:1px solid #999;">',
				'<div style="position:relative;top:50%;left:50%;transform:translate(-50%, -50%);width:85%;text-align:center;color:#626262;">',
					'<div>Action triggered by click.</div>',
					'<div>&lt;div ... action-click="..." &gt;</div>',
					'<div><br></div>',
					'<div class="btn btn-sm btn-success" action-click="try-click">Click Me!</div>',
				'</div>',
			'</div>',
		],
		actions: {
			'try-click': function(){
				 app.notify('Action triggered!', 'Click action!', 'success');
			}
		}
	});

	var Contextmenu = app.view({
		className: 'action-demo-view wrapper',
		template: [
			'<div style="height:100%;width:100%;border:1px solid #999;">',
				'<div style="position:relative;top:50%;left:50%;transform:translate(-50%, -50%);width:85%;text-align:center;color:#626262;">',
					'<div>Action triggered by right click.</div>',
					'<div>&lt;div action-contextmenu="..." &gt;</div>',
					'<div><br></div>',
					'<div class="btn btn-sm btn-warning" action-contextmenu="right-click">Right-Click Me!</div>',
				'</div>',
				'<ul id="temp-list" class="list-group hidden">',
					'<li class="list-group-item">Cras justo odio</li>',
					'<li class="list-group-item">Dapibus ac facilisis in</li>',
				  	'<li class="list-group-item">Morbi leo risus</li>',
				  	'<li class="list-group-item">Porta ac consectetur ac</li>',
			  		'<li class="list-group-item">Vestibulum at eros</li>',
				'</ul>',
			'</div>',
		],
		onShow: function(){
			var $el = this.$el.find('#temp-list');
			$window.on('click', function(){
				if( !$el.hasClass('hidden') )
					$el.addClass('hidden');
			});
		},
		actions: {
			'right-click': function($el, e){
				var that = this;
				e.preventDefault();
				this.$el.find("#temp-list").css({position: 'fixed',left: e.pageX, top: e.pageY, 'z-index': 999}).removeClass('hidden');
				app.notify('Action triggered!', 'Right-Click action!', 'warning');
			}
		}
	});

	var Mousedown = app.view({
		className: 'action-demo-view wrapper',
		template: [
			'<div style="height:100%;width:100%;border:1px solid #999;">',
				'<div style="position:relative;top:50%;left:50%;transform:translate(-50%, -50%);width:85%;text-align:center;color:#626262;">',
					'<div>Action triggered by mousedown.</div>',
					'<div>&lt;div action-mousedown="..." &gt;</div>',
					'<div><br></div>',
					'<div class="btn btn-sm btn-danger" action-mousedown="mouse-down">Mousedown Me!</div>',
				'</div>',
			'</div>',
		],
		actions: {
			'mouse-down': function(){
				 app.notify('Action triggered!', 'Mousedown action!', 'danger');
			}
		}
	});

	var Mousemove = app.view({
		className: 'action-demo-view wrapper',
		template: [
			'<div style="height:100%;width:100%;border:1px solid #999;">',
				'<div style="position:relative;top:50%;left:50%;transform:translate(-50%, -50%);width:85%;text-align:center;color:#626262;">',
					'<div>Action triggered by mousemove.</div>',
					'<div>&lt;div action-mousemove="..." &gt;</div>',
					'<div><br></div>',
					'<div class="btn btn-sm btn-info" action-mousemove="mouse-move">Move on Me!</div>',
				'</div>',
			'</div>',
		],
		actions: {
			'mouse-move': function(){
				 app.notify('Action triggered!', 'Mousedown action!', 'info');
			}
		}
	});

	var Mouseup = app.view({
		className: 'action-demo-view wrapper',
		template: [
			'<div style="height:100%;width:100%;border:1px solid #999;">',
				'<div style="position:relative;top:50%;left:50%;transform:translate(-50%, -50%);width:85%;text-align:center;color:#626262;">',
					'<div>Action triggered by mouseup.</div>',
					'<div>&lt;div action-mouseup="..." &gt;</div>',
					'<div><br></div>',
					'<div class="btn btn-sm btn-success" action-mouseup="mouse-up">Mouseup Me!</div>',
				'</div>',
			'</div>',
		],
		actions: {
			'mouse-up': function(){
				 app.notify('Action triggered!', 'Mouseup action!', 'success');
			}
		}
	});

	var Mouseenter = app.view({
		className: 'action-demo-view wrapper',
		template: [
			'<div style="height:100%;width:100%;border:1px solid #999;">',
				'<div style="position:relative;top:50%;left:50%;transform:translate(-50%, -50%);width:85%;text-align:center;color:#626262;">',
					'<div>Action triggered by mouseenter.</div>',
					'<div>&lt;div action-mouseenter="..." &gt;</div>',
					'<div><br></div>',
					'<div class="btn btn-sm btn-warning" action-mouseenter="mouse-enter">Mouse-enter Me!</div>',
				'</div>',
			'</div>',
		],
		actions: {
			'mouse-enter': function(){
				 app.notify('Action triggered!', 'Mouse-enter action!', 'warning');
			}
		}
	});

	var Mouseover = app.view({
		className: 'action-demo-view wrapper',
		template: [
			'<div style="height:100%;width:100%;border:1px solid #999;">',
				'<div style="position:relative;top:50%;left:50%;transform:translate(-50%, -50%);width:85%;text-align:center;color:#626262;">',
					'<div>Action triggered by mouseover.</div>',
					'<div>&lt;div action-mouseover="..." &gt;</div>',
					'<div><br></div>',
					'<div class="btn btn-sm btn-danger" action-mouseover="mouse-over">Mouseover Me!</div>',
				'</div>',
			'</div>',
		],
		actions: {
			'mouse-over': function(){
				 app.notify('Action triggered!', 'Mouseover action!', 'danger');
			}
		}
	});

	var Focus = app.view({
		className: 'action-demo-view wrapper',
		template: [
			'<div style="height:100%;width:100%;border:1px solid #999;">',
				'<div style="position:relative;top:50%;left:50%;transform:translate(-50%, -50%);width:90%;text-align:center;color:#626262;">',
					'<div>Actions triggered by focus events.</div>',
					'<div>&lt;div action-focusin="..." &gt;</div>',
					'<div class="form-horizontal"><div editor="focusin" action-focusin="focusin"></div></div>',
					'<div>&lt;div action-focusout="..." &gt;</div>',
					'<div class="form-horizontal"><div editor="focusout" action-focusout="focusout"></div></div>',
				'</div>',
			'</div>',
		],
		actions: {
			'focusin': function(){
				 app.notify('Action triggered!', 'Focusin action!', 'info');
			},
			'focusout': function(){
				 app.notify('Action triggered!', 'Focusout action!', 'success');
			}
		},
		editors: {
			focusin: {
				type: 'text',
				label: 'Focusin',
				placeholder: 'focus on me!',
				layout: {
					label: 'col-md-4',
					field: 'col-md-8',
				}
			},
			focusout: {
				type: 'text',
				label: 'Focusout',
				placeholder: 'don\'t focus on me!',
				layout: {
					label: 'col-md-4',
					field: 'col-md-8',
				}
			}
		}
	});

	var Key = app.view({
		className: 'action-demo-view wrapper',
		template: [
			'<div style="height:100%;width:100%;border:1px solid #999;">',
				'<div style="position:relative;top:50%;left:50%;transform:translate(-50%, -50%);width:90%;text-align:center;color:#626262;">',
					'<div>Actions triggered by key events.</div>',
					'<div>&lt;div ... action-keyup="..." &gt;</div>',
					'<div class="form-horizontal"><div editor="keyup" action-keyup="keyup"></div></div>',
					'<div>&lt;div ... action-keydown="..." &gt;</div>',
					'<div class="form-horizontal"><div editor="keydown" action-keydown="keydown"></div></div>',
				'</div>',
			'</div>',
		],
		actions: {
			'keyup': function(){
				 app.notify('Action triggered!', 'Keyup action!', 'warning');
			},
			'keydown': function(){
				 app.notify('Action triggered!', 'Keydown action!', 'danger');
			}
		},
		editors: {
			keyup: {
				type: 'text',
				label: 'Keyup',
				placeholder: 'Type something!',
				layout: {
					label: 'col-md-4',
					field: 'col-md-8',
				}
			},
			keydown: {
				type: 'text',
				label: 'Keydown',
				placeholder: 'Type something!',
				layout: {
					label: 'col-md-4',
					field: 'col-md-8',
				}
			}
		}
	});

	var Inputs = app.view({
		className: 'action-demo-view wrapper',
		template: [
			'<div style="height:100%;width:100%;border:1px solid #999;">',
				'<div  class="row" style="position:relative;top:50%;left:50%;transform:translate(-50%, -50%);text-align:center;color:#626262;">',
					'<div><br></div>',
					'<div>Actions triggered by event on inputs.</div>',
					'<div class="col-md-6">',
						'<div>&lt;div ... action-change="..." &gt;</div>',
						'<div class="form-horizontal"><div editor="change" action-change="change"></div></div>',
					'</div>',
					'<div class="col-md-6">',
						'<div>&lt;form ... action-submit="..." &gt;</div>',
						'<form action-submit="submit"><input type="submit"></form>',
					'</div>',
					'<div class="col-md-10 col-md-offset-1">',
						'<div>&lt;div ... action-select="..." &gt;</div>',
						'<div class="form-horizontal"><div editor="select" action-select="select"></div></div>',
					'</div>',
				'</div>',
			'</div>',
		],
		onShow: function(){
			this.$el.find('textarea').attr('rows', '2');
		},
		actions: {
			change: function(){
				 app.notify('Action triggered!', 'Change action!', 'danger');
			},
			submit: function(){
				app.notify('Action triggered!', 'submit action!', 'info');
			},
			select: function(){
				app.notify('Action triggered!', 'submit action!', 'warning');
			}
		},
		editors: {
			change: {
				type: 'text',
				label: 'Change',
				placeholder: 'Type something!',
				layout: {
					label: 'col-md-4',
					field: 'col-md-8',
				}
			},
			select: {
				type: 'textarea',
				label: 'Select',
				layout: {
					label: 'col-md-2',
					field: 'col-md-9',
				},
				value: 'Here is some text. Select some texts to trigger the select event.',
			}
		}
	});

	
})(Application);