(function(app){

	app.context('Canvas', {

		template: [
			'<div ui="preview" style="position: absolute; bottom: 394px; left: 0; right: 0; top: 0;"></div>',
			//toolbar
			'<div style="position:absolute; bottom: 350px; left: 0; right: 0; height: 44px; background: #eee;">',
				'<div ui="status" style="position:absolute; left:0; top: 0; bottom: 0; right: 550px; padding: 0.6em;">',//svg data
					//empty
				'</div>',
				'<div style="position:absolute; width:550px; top: 0; right: 0; bottom: 0;">',//data toolbar
					'<div editor="remote" style="width: 550px; display: inline-block;"></div>',
					//'<span style="position:absolute; right: .5em; top: .5em;">Remote Data</span>',
				'</div>',
			'</div>',
			//svg js editor
			'<div style="position: absolute; bottom: 0; left: 0; right: 550px; height: 350px;">',
				'<div id="svg-editor" style="position: absolute; bottom: 0; left: 0; right: 0; top: 0;"></div>',
				'<span ui="svg-label" class="label label-primary" style="position: absolute; top: 0; right: 0; z-index: 1">SVG (Javascript)</span>',
			'</div>',
			//data json editor
			'<div style="position: absolute; bottom: 0; right: 0; width: 550px; height: 350px;">',
				'<div id="data-editor" style="position: absolute; bottom: 0; left: 0; right: 0; top: 0;"></div>',
				'<span ui="data-label" class="label label-info" style="position: absolute; top: 0; right: 0; z-index: 1">Data (JSON)</span>',
			'</div>',
		],

		editors: {
			'remote': {
				placeholder: 'Type remote data url...',
			},
		},

		onReady: function(){
			//init svg code editor
			this._createCodePad('svg-editor', {
				theme: 'monokai',
				mode: 'javascript'
			});

			//init data json editor
			this._createCodePad('data-editor', {
				theme: 'github',
				mode: 'json'
			});
		},

		onPadChanged: function(pad, name){
			this.ui.status.empty();

			switch(name){
				case 'svg-editor':
					window.onerror = _.bind(function(e){
						this.ui.status.html('<p class="text-danger">' + e + '</p>');
					}, this);
					var code = new Function('paper', pad.getValue());
					this.spray(this.ui.preview, code).once('show', _.bind(function(){
						this.ui.status.html('<p class="text-success">Canvas rendered.</p>');
					}, this));
				break;
				case 'data-editor':
					//TBI
				break;
				default:
				break;
			}
		},

		_createCodePad: function(domID, options){
			this.codepads = this.codepads || {};
			var pad = ace.edit(domID);
			//config
			pad.setTheme(options.theme && ('ace/theme/' + options.theme));
			pad.setFontSize(options.fontsize || 14);
			pad.getSession().setMode(options.mode && ('ace/mode/' + options.mode));
			this.codepads[domID] = pad;
			//wire
			var that = this;
			pad.getSession().on('change', function(e){
				app.debounce(function(){
					that.trigger('view:pad-changed', pad, domID);
				}, 600)();
			});
			return pad;
		}

	});
	
})(Application);