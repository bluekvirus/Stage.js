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
			var url = options.url || $el.attr('md') || $el.data('md');
			$.get(url).done(function(res){
				$el.html(marked(res, options.marked)).addClass('md-content');
				theme($el, options);
				options.cb && options.cb($el);
			});
		});
	}



})(jQuery);