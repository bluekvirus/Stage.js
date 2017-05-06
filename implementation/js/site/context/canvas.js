(function(app){

	app.context('Canvas', {

		_cacheKeyPrefix: 'Canvas-',

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
			//init data json editor
			this._createCodePad('data-editor', {
				theme: 'github',
				mode: 'json'
			});

			//init svg code editor
			this._createCodePad('svg-editor', {
				theme: 'monokai',
				mode: 'javascript'
			});
		},

		onEditorKeyup: app.debounce(function(name, editor){
			switch(name){
				case 'remote':
					this._fetchRemoteUrl();
				break;
				default:
				break;
			}
		}, 600),

		onPadChanged: function(pad, name){
			switch(name){
				case 'svg-editor':
					window.onerror = _.bind(function(e){
						this.ui.status.html('<p class="text-danger">' + e + '</p>');
					}, this);
					var svgFn = new Function('paper', pad.getValue());
					this.spray(this.ui.preview, svgFn, {
						data: this.codepads['data-editor'].getJSONVal(),
					}).once('ready', _.bind(function(){
						this.ui.status.html('<p class="text-success">Canvas rendered.</p>');
					}, this));
				break;
				case 'data-editor':
					var svgView = this.ui.preview.data('region') && this.ui.preview.data('region').currentView;
					if(svgView){
						//svgView.set(JSON.parse(pad.getValue()), {override: true, unset: true});//deep model only
						svgView.set(pad.getJSONVal(), {reset: true});//works on both types of models (flat/deep)
						this.ui.status.html('<p class="text-success">Canvas rendered...again.</p>');
					}
				break;
				default:
				break;
			}
		},

		_fetchRemoteUrl: function(){
			var url = _.string.trim(this.getEditor('remote').get());
			if(_.string.startsWith('ws://')){
				//websocket (we might not need this one yet, skipping atm...)
			} else {
				//http(s)
				var that = this;
				app.remote(url).done(function(data){
					that.codepads['data-editor'].setValue(JSON.stringify(data, '\t', 3));
					that.ui.status.html('<p class="text-success">Remote data loaded from ' + url + '</p>');
				}).fail(function(jqXHR, settings, e){
					that.ui.status.html('<p class="text-danger">Remote data ' + url + ' ' + e + '</p>');
				});
			}
		},

		_createCodePad: function(domID, options){
			this.codepads = this.codepads || {};
			var pad = ace.edit(domID);
			var cacheKey = this._cacheKeyPrefix + domID + '-cache';
			//config
			pad.setTheme(options.theme && ('ace/theme/' + options.theme));
			pad.setFontSize(options.fontsize || 14);
			pad.getSession().setMode(options.mode && ('ace/mode/' + options.mode));
			pad.$blockScrolling = Infinity;
			this.codepads[domID] = pad;
			//wire
			var that = this;
			pad.getSession().on('change', function(e){
				app.debounce(function(canvas, pad, cacheKey, domID){
					var cache = pad.getValue();
					app.store.set(cacheKey, cache);
					canvas.trigger('view:pad-changed', pad, domID);
				}, 600, domID)(that, pad, cacheKey, domID); //use cached debounce wrapper fn.
															//(can't use `this` and any upper scope var in cached fn impl, they will be cached)
			});
			//restore
			pad.setValue(app.store.get(cacheKey, ''), 1); //set code text and move cursor to the end (-1 for start)
			//patch
			pad.getJSONVal = function(){
				try {
					return JSON.parse(this.getValue());
				} catch (e) {
					return {};
				}
			}
			return pad;
		}

	});
	
})(Application);