/**
 * i18n loading file
 * dependencies: jQuery, underscore, store.js
 *
 * =====
 * Usage
 * =====
 * 1. load this i18n.js before any of your modules/widgets
 * 2. use '...string...'.i18n() instead of just '...string...',
 * 3. use {{i18n vars/paths or '...string...'}} in templates, {{{...}}} for un-escaped.
 * 4. use $.i18n(options) to translate html tags with [data-i18n-key] [data-i18n-module] data attributes. 
 * 
 * @author Yan Zhu (yanzhu@fortinet.com), Tim Liu (zhiyuanliu@fortinet.com)
 * @date 2013-08-26
 */
;(function($, _) {
	
	var resources_path = 'static/resources/';
	
	function getParams(url) {
		var params = {};
		var start = url.indexOf('?');
		if (start >= 0) {
			var stop = url.indexOf('#');
			if (stop === -1) {
				stop = url.length;
			}
			start += 1;
			var paramString = url.substring(start, stop);
			var paramArray = paramString.split('&');
			_.each(paramArray, function(paramPair, index) {
				var paramKV = paramPair.split('=');
				params[paramKV[0]] = paramKV[1];
			});
		}
		return params;
	}
	
	var params = getParams(window.location.toString());
	var locale = params.locale;
	var localizer = params.localizer;
	
	var resources;
	
	if (locale) {
		// load resources from file
		/**
		 * {locale}.json
		 * {
		 * 	locale: {locale},
		 *  trans: {
		 * 	 key: "" | {
		 * 	  "_default": "",
		 *    {ns}: ""
		 *   }
		 *  }
		 * }
		 */
		$.ajax({
			url: [resources_path, locale, '.json'].join(''),
			async: false,
			success: function(data, textStatus, jqXHR) {
				resources = data.trans;
			},
			error: function(jqXHR, textStatus, errorThrown) {
				console.log('Get resources error', errorThrown);
			}
		});

		resources = resources || {};
		
		// if localizer, merge resources with localStorage
		if (localizer) {
			var resources_cache_key = ['resources_', locale].join('');
			var cached_resources = store.get(resources_cache_key);
			if (cached_resources) {
				resources = _.extend(resources, cached_resources);
			}
		}
	}
	
	/**
	 * =============================================================
	 * String Object plugin
	 * options:
	 * 	module - the module/namespace ref-ed translation of the key.
	 * =============================================================
	 */
	String.prototype.i18n = function(options) {
		var key = $.trim(this);
		
		if (!locale || !key) {
			//console.log('locale', locale, 'is falsy');
			return key;
		}
		
		var translation = resources[key];
		if (typeof(translation) === 'undefined') {
			//console.log('translation', translation, 'is undefined');
			// report this key
			resources[key] = '';
			cacheResources();
			return key;
		} else if (typeof(translation) === 'object') {
			console.log('translation', translation, 'is object');
			var ns = (options && options.module) || '_default';
			translation = translation[ns];
			if (typeof(translation) === 'undefined') {
				//console.log('translation', translation, 'is undefined');
				// report this namespace
				resources[key][ns] = '';
				cacheResources();
				return key;
			}
		}
		translation = new String(translation);
		if (translation.trim() === '') {
			return key;
		}
		return translation;
	};
	
	function cacheResources() {
		//console.log('cacheResources', 'localizer', localizer);
		if (localizer) {
			store.set(resources_cache_key, resources);
		}
	}

	function getResourceProperties() {
		var formatted = [];

		function makeNSLine(ns) {
			formatted.push('## module: ');
			formatted.push(ns);
			formatted.push(' ##');
			formatted.push('\n');
		}

		function makeLine(key, value) {
			key = new String(key);
			value = new String(value);
			formatted.push('"');
			formatted.push(key.replace(/"/g, '\\"'));
			formatted.push('"');
			formatted.push('=');
			formatted.push(value);
			formatted.push('\n');
		}

		_.each(resources, function(value, key) {
			if (typeof(value) === 'object') {
				_.each(value, function(translation, ns) {
					if (ns !== '_default') {
						makeNSLine(ns);
					}
					makeLine(key, translation);
				});
			} else {
				makeLine(key, value);
			}
		});

		var result = formatted.join('');
		// console.log(result);
		// TODO: write result to file
		return result;
	}

	function getResourceJSON() {
		return JSON.stringify({
			locale: locale,
			trans: resources
		});
	}

	window.getResourceProperties = getResourceProperties;
	window.getResourceJSON = getResourceJSON;

	/**
	 * =============================================================
	 * Handlebars helper(s) for displaying text in i18n environment.
	 * =============================================================
	 */
	if(Handlebars){
		Handlebars.registerHelper('i18n', function(key, ns, options) {
	  		return String(key).i18n(ns && {module:ns});
		});
	}

	/**
	 * =============================================================
	 * Jquery plugin for linking html tags with i18n environment.
	 * 
	 * data-i18n-key = '*' to use everything in between the selected dom object tag.
	 * <span data-i18n-key="*">abcd...</span> means to use abcd... as the key.
	 *
	 * data-i18n-module = '...' to specify the module/namespace.
	 *
	 * options:
	 * 	1. search, whether or not to use find() to locate i18n tags.
	 * =============================================================
	 */
	function _i18nIterator(index, el) {
		var $el = $(el);
		var key = $el.data('i18nKey');
		var ns = $el.data('i18nModule');
		if(key === '*') key = $.trim($el.html());
		$el.html(key.i18n({module:ns}));
	}
	$.fn.i18n = function(options){
		options = _.extend({
			//defaults
			search: false
		}, options)

		if(!options.search)
			return this.filter('[data-i18n-key]').each(_i18nIterator);
		else {
			this.find('[data-i18n-key]').each(_i18nIterator);
			return this;
		}
	}


})(jQuery, _);
