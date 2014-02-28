/**
 * This is the jquery plugin that fetch and show static .md contents through markd js lib
 *
 * Usage
 * =====
 * ```
 * $.md({
 * 	url: ... 
 * 		or 
 * 	file: a.b.c (=> /static/md/a/b/c.md)	
 * 	
 * 	callback: function($el)...
 * 	marked: marked options see [https://github.com/chjj/marked]	
 * })
 * ```
 *
 * @author Tim.Liu
 * @created 2013.11.05
 */

(function($){

	/*===============the util functions================*/
	function load(target, cb){
		var url = target.url || ('/static/md/' + target.dottedPath.split('.').join('/') + '.md');
		$.ajax({
			url: url,
			type: 'GET',
			success: function(res){
				cb(res);
			}
		});
	}
	/*===============the plugin================*/
	$.fn.md = function(options){
		var that = this;
		if(_.isString(options)) {
			if(/\.md$/.test(options)) options = { url: options };
			else options = { file: options };
		}
		load({
			url: options.url,
			dottedPath: options.file
		}, function(md){
			return that.each(function(index, el){
				var $el = $(this);
				$el.html(marked(md, options.marked)).addClass('md-content');
				options.callback && options.callback($el);
			});
		});
	}

})(jQuery);