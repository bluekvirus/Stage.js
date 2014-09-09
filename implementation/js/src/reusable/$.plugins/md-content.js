/**
 * This is the jquery plugin that fetch and show static .md contents through markd js lib
 * (If you have highlight.js, the code block will be themed for you...)
 *
 * Usage
 * =====
 * ```
 * $.md({
 * 	url: ...
 * 	marked: marked options see [https://github.com/chjj/marked]
 * 	hljs: highlight js configure (e.g languages, classPrefix...)
 *  cb: function($el)...
 * })
 *
 * the $(tag) you used to call .md() can have md="..." or data-md="..." attribute to indicate md file url.
 * ```
 *
 * Note
 * ====
 * Use $.load() if you just want to load html content instead of md coded content into $(tag)
 *
 * Dependency
 * ----------
 * jQuery, Underscore [, Highlight.js]
 *
 *
 * @author Tim.Liu
 * @created 2013.11.05
 * @updated 2014.03.02
 * @updated 2014.05.27 (added md data caching)
 */

(function($){

	/*===============the util functions================*/

	//support bootstrap theme + hilight.js theme.
	function theme($el, options){

		var hljs = window.hljs;
		if(hljs){
			hljs.configure(options && options.hljs);
			$el.find('pre code').each(function(){

				//TBI: detect class:lang-xxxx and color the code block accordingly
				
				hljs.highlightBlock(this);
			});
		}
	}


	/*===============the plugin================*/
	$.fn.md = function(options){
		var that = this;
		if(_.isString(options)) options = { url: options };
		options = options || {};

		return this.each(function(index, el){
			var $el = $(el);
			var config = $el.data();
			var url = options.url || config.url;
			$.get(url).done(function(res){
				var content;
				if(config.md && config.md.data === res) {
					content = config.md.content;
				}else {
					content = marked(res, options.marked);
					//cache the md data and calculation
					$el.data('md', {
						data: res,
						content: content
					});
				}

				_.defer(function(){
					$el.html(content).addClass('md-content');
					theme($el, options);
					if(options.cb) options.cb($el);
				});

			});
		});
	};



})(jQuery);