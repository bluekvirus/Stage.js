/**
 * The Table of Content Widget
 *
 * Options
 * -------
 * 1. title - [optional] the title above the root <ul/>
 * 2. template - [optional] the item template holding topic string
 * 3. toc - the object or url that loads the toc metadata "Topic" --> "Markdown.md".
 *
 * 		{
 * 			"1_topic A": "a.md",
 * 		 	"2_topic B": {
 * 			 	"a_overview": "b/-intro.md",
 * 			  	"b_topic B.1": "b/b-1.md",
 * 			   	"c_topic B.2": "b/b-2.md",
 * 			    ...
 * 		     },
 * 		     ...
 * 		},
 * 		
 * 4. onReady - [optional] what to do when the ToC view is ready
 *
 * Note
 * ----
 * Use "<number>_" or "<alphabetics>_" to indicate your topic order.
 * You can use non empty view data:{} to reset toc. 
 * There is an activation group called 'toc' for all the topic <li>, when clicked, emitting a global event 'load-topic-file' with file path.
 * 
 *
 * @author Tim Lauv
 * @created 2017.08.28
 */

(function(app){

	app.widget('ToC', function(){

		var UI = app.view({

			defaults: {
				//default configure
				title: 'Table of Content',
				template: '<a>{{.}}</a>',
				toc: {
					'1_Topic A': 'a.md',
					'2_Topic B': {
						'a_Overview': 'b/b-intro.md',
						'b_Topic B-1': 'b/b-1.md',
						'c_Topic B-2': 'b/b-2.md',
						'd_Topic B-3': {
							'1_Topic B-3-1': 'b/b-3/3.md',
							'1_Topic B-3-2': 'b/b-3/2.md',
						},
					},
					'3_Topic C': 'c.md',
				}

			},

			onBeforeRender: function(){
				//change the presentation after data loading but before render again
				var tocCfgObj = _.extend({}, this.defaults, this.options); //can override title, template, toc with init options
				tocCfgObj.toc = _.size(this.get())? this.get() : tocCfgObj.toc; //can override toc with data
				this.template = '<h3>' + tocCfgObj.title + '</h3>' + helper(tocCfgObj.toc, _.partial(Marionette.Renderer.render, tocCfgObj.template));
			},

			onItemActivated: function($item, group){
				switch(group){
					case 'toc':
						app.coop('load-topic-file', $item.attr('file'));
					break;
					default:
					break;
				}
			}

		});

		function helper(tocPartialObj, itemTplFn){
			var result = '<ul>';
			_.each(tocPartialObj, function(mdFileStr, topicStr){
				topicStr = topicStr.split('_')[1]; //removing the ordering bit before '_'
				if(!_.isPlainObject(mdFileStr))
					result += '<li activate="toc" file="' + mdFileStr + '">' + itemTplFn(topicStr) + '</li>';
				else
					result += '<li>' + itemTplFn(topicStr) + helper(mdFileStr, itemTplFn) + '</li>';
			})
			return result + '</ul>';
		}

		return UI;

	});

})(Application);