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
 * $.toc({
 * 	ignoreRoot: false | true - whether to ignore h1
 *  headerHTML: html before ul (sibling) - experimental
 * })
 * ```
 *
 * the $(tag) you used to call .md() can have md="..." or data-md="..." attribute to indicate md file url.
 *
 * Note
 * ====
 * Use $.load() if you just want to load html content instead of md coded content into $(tag)
 *
 * Dependency
 * ----------
 * jQuery, Underscore, Underscore.String [, Highlight.js]
 *
 * Document format
 * ---------------
 * h1 -- book title
 * h2 -- chapters
 * h3 -- sections
 * ...
 *
 * @author Tim.Liu
 * @created 2013.11.05
 * @updated 2014.03.02
 */

(function($){

	/*===============the util functions================*/

	//support bootstrap theme + hilight.js theme.
	function theme($el, options){
		$el.find('h1 + p').addClass('text-info');
		if(hljs){
			hljs.configure(options && options.hljs);
			$el.find('pre code').each(function(){

				//TBI: detect class:lang-xxxx and color the code block accordingly
				
				hljs.highlightBlock(this);
			});
		}
	}

	//build ul/li table-of-content listing
	var order = {};
	for (var i = 1; i <= 6; i++) {
		order['h' + i] = order['H' + i] = i;
	};
	function toc($el, options){
		//default options
		options = _.extend({

			ignoreRoot: false,
			headerHTML: '<h3><i class="fa fa-book"></i> Table of Content</h3>'

		}, options);

		//statistical registry
		var offsets = [];

		//traverse the document tree
		var $root = $('<div></div>').append(options.headerHTML).append('<ul></ul>');
		$root.$children = $root.find('> ul');
		var $index = $root;
		var level = options.ignoreRoot ? 1 : 0;
		$el.find((options.ignoreRoot?'':'h1,') + 'h2,h3,h4,h5,h6').each(function(){

			var $this = $(this);
			var tag = $this.context.localName; //or tagName which will be uppercased
			var title = $this.html();
			var id = $this.attr('id');
			var offset = $this.offset().top;
			$this.data({
				title: title,
				id: id,
				offset: offset
			});
			offsets.push({ offset: offset, id: id, title: title});

			var $node = $('<li><a href="#" data-id="' + id + '" action="goto">' + title + '</a><ul></ul></li>'); //like <li> <a>me</a> <ul>children[]</ul> </li>
			$node.data({
				title: title,
				id: id
			});
			switch(tag){
				case 'h2': case 'H2':
				$node.addClass('chapter');
				break;
				case 'h3': case 'H3':
				$node.addClass('section');
				break;
				default:
				break;
			}
			$node.$children = $node.find('> ul');

			var gap = order[tag] - level;

			if(gap > 0) { //drilling in (always 1 lvl down)
				$node.$parent = $index;
				$index.$children.append($node);
				level ++;
			}else if (gap === 0) {
				//back to same level ul (parent li's ul)
				$node.$parent = $index.$parent;
				$index.$parent.$children.append($node);
			}else {
				while (gap < 0){
					gap ++;
					$index = $index.$parent; //back to parent li one lvl up
					level --;
				}
				//now $index points to the targeting level node
				$node.$parent = $index.$parent;
				$index.$parent.$children.append($node); //insert a same level node besides the found targeting level node
			}
			$index = $node; //point $index to this new node
			//link the document $header elements.
			$this.data('parent', $node.$parent && $node.$parent.data());
			
		});
		$el.data('toc', {
			html: '<div class="md-toc">' + $root.html() + '</div>',
			offsets: offsets, //offsets array calculator - to use with $window.scrollTop()
		});
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

	//store table-of-content listing in data-toc
	$.fn.toc = function(options){
		return this.each(function(index, el){
			var $el = $(el);
			toc($el, options);
		});
	}

})(jQuery);