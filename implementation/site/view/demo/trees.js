;(function(app){

	var treeDataTpl = {
		'data|5-5': [{
			'val': 'item@INCREMENT(1)',
			'otherAttr': '@INTEGER(20,50)',
			'children|1-4': [{
				'val': 'sub-1-item@INCREMENT(1)',
				'otherAttr': '@INTEGER(20,50)',
				'children|1-3': [{
					'val': 'sub-2-item@INCREMENT(1)',
					'otherAttr': '@INTEGER(20,50)',
					//  'children|2-6': [{
					// 	'val': 'sub-item@INCREMENT(1)',
					// }]
				}]
			}]
		}]
	};

	var data = Mock.mock(treeDataTpl).data;

	app.view('Demo.Trees', {
		className: 'container',
	    template: [
	    	'<p class="alert alert-info"><strong>Note:</strong> Bootstrap 3 has removed multi-level dropdown-menu support...</p>',
	    	'<div class="row wrapper">',
		    	'<div region="left" class="col-md-4"></div>',
		    	'<div class="col-md-4">',
		    		'<div region="mid"></div>',
		    		//'<div region="mid2"></div>',
		    	'</div>',
		    	'<div region="right" class="col-md-4"></div>',
	    	'</div>'
	    ],
	    onShow: function(){
	    	//1. normal tree (minimum)
	    	this.left.trigger('region:load-view', 'Tree', {
	    		data: data,
	    		onSelected: function(meta, $el, e){
	    			e.preventDefault();
	    			app.debug(meta);
	    		}
	    	});

	    	//2. used in dropdown
	    	this.mid.show(app.view({
	    		className: 'dropdown', 
	    		template: [
  					'<button class="btn dropdown-toggle" type="button" id="dropdownMenu1" data-toggle="dropdown">',
						'Dropdown ',
						'<span class="caret"></span>',
  					'</button>',
  					'<ul region="tree" class="dropdown-menu"></ul>',
  				],
  				onShow: function(){
  					var tree = app.widget('Tree', {
	    				data: data,
	    				el: this.tree.$el[0],
			    		node: {
			    			template: [
								'<a href="#"><i class="{{icon}}"></i> {{{val}}}</a>',
								'<ul class="dropdown-menu"></ul>'
							]
			    		}
  					});
  					// tree.onDataRendered = function(){
  					// 	app.debug('ready');
  					// }
  					this.tree.show(tree);
  				}
	    	}));

	    	//3. accordion (with nodes collapsed first)
	    	this.right.show(app.view({
	    		type: 'CollectionView',
	    		forceViewType: true,
	    		initialize: function(){
	    			this.activeClass = 'panel-primary';
	    			this.collection = app.collection(data);
	    			this.listenTo(this, 'itemview:toggle', function(view){
	    				this.$el.find('.panel ').removeClass(this.activeClass);
	    				view.$el.addClass(this.activeClass);
	    				this.$el.find('.panel-body').slideUp();
	    				view.body.$el.slideDown();
	    			});
	    		},
	    		itemView: app.view({
	    			className: 'panel panel-default',
	    			template: [
	    				'<div class="panel-heading" action="toggle">',
	    					'<h4 class="panel-title">{{val}}</h4>',
	    				'</div>',
	    				'<div class="panel-body" region="body"></div>',
	    			],
	    			onShow: function(){
	    				this.$el.css({
	    					'marginBottom': '5px',
	    					'cursor': 'pointer'
	    				});
	    				this.body.trigger('region:load-view', 'Tree', {
	    					data: this.model.get('children'),
	    					onSelected: function(meta, $el, e){
								e.preventDefault();
								app.debug(meta.view.model, $el);
	    					}
	    				}).$el.hide();
	    			},
	    			actions: {
	    				toggle: function($btn){
	    					this.trigger('toggle');
	    				}
	    			}
	    		})
	    	}));
	    }

	});

})(Application);