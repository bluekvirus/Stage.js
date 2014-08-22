/**
 * i18n loading file
 * dependencies: jQuery, underscore, store.js, [Handlebars]
 *
 * ======
 * Config
 * ======
 * I18N.configure(options) - change the resource folder path or key-trans file name per locale.
 * 	options:
 * 		resourcePath: ... - resource folder path without locale
 * 		translationFile: ... - the file name that holds the key trans pairs for a certain locale.
 *
 * =====
 * APIs
 * =====
 * .getResourceProperties(flag) -- get all i18n keys and trans rendered in the app in "key" = "val" format;
 * .getResourceJSON(flag) -- get the above listing in JSON format;
 *
 * use flag = true in the above functions if you only want to get un-translated entries;
 * 
 * =====
 * Usage
 * =====
 * 1. load this i18n.js before any of your modules/widgets
 * 2. use '...string...'.i18n() instead of just '...string...',
 * 3. use {{i18n vars/paths or '...string...'}} in templates, {{{...}}} for un-escaped.
 * 4. use $.i18n(options) to translate html tags with [data-i18n-key] [data-i18n-module] data attributes. 
 *
 * 
 * @author Yan Zhu, Tim Liu
 * @created 2013-08-26
 * @updated 2014-08-06
 * 
 */
var I18N = {};
;(function($, _, URI) {
	
	//----------------configure utils------------------
	var configure = {
		resourcePath: 'static/resource',
		translationFile: 'i18n.json'
	};

	var params = URI(window.location.toString()).search(true);
	var locale = params.locale;
	var localizer = params.localizer;
	
	var resources;	
	I18N.configure = function(options){
		_.extend(configure, options);
		if (locale) {
			// load resources from file
			/**
			 * {locale}.json or {locale}/{translationFile}
			 * {
			 * 	locale: {locale},
			 *  trans: {
			 * 	 key: "" or {
			 * 	  "_default": "",
			 *    {ns}: ""
			 *   }
			 *  }
			 * }
			 */
			$.ajax({
				url: [configure.resourcePath, (configure.translationFile.contains('{locale}')?configure.translationFile.replace('{locale}', locale):[locale, configure.translationFile].join('/'))].join('/'),
				async: false,
				success: function(data, textStatus, jqXHR) {
					if(!data || !data.trans) throw new Error('RUNTIME::i18n::Malformed ' + locale + ' data...');
					resources = data.trans;
				},
				error: function(jqXHR, textStatus, errorThrown) {
					throw new Error('RUNTIME::i18n::' + errorThrown);
				}
			});

			resources = resources || {};
			
			//Localizer mode, merge resources with localStorage, cache is modified upon localizer's DnD action (modified property file).
			if (localizer) {
				var resources_cache_key = ['resources_', locale].join('');
				var cached_resources = store.get(resources_cache_key);
				if (cached_resources) {
					_.each(cached_resources, function(trans, key){
						//favor cached_ over loaded resources.
						if(!trans) return;
						if(!resources[key]) {
							resources[key] = trans;
							return;
						}
						//if we had a string trans, let cache (object/string) override resource.
						if(_.isString(resources[key])) resources[key] = trans;
						//if we had a trans object(with ns), only extend if cached is a trans object.
						else if(_.isObject(resources[key]) && _.isObject(trans)) _.extend(resources[key], trans);
					});
				}
			}
		}		
		return this;
	};
	//-------------------------------------------------
	
	
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
			//console.log('translation', translation, 'is object');
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
		translation = String(translation);
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

	function getResourceProperties(untransedOnly) {
		var formatted = [];

		function makeNSLine(ns) {
			formatted.push('## module: ');
			formatted.push(ns);
			formatted.push(' ##');
			formatted.push('\n');
		}

		function makeLine(key, value) {
			key = String(key);
			value = String(value);
			formatted.push('"');
			formatted.push(key.replace(/"/g, '\\"'));
			formatted.push('"');
			formatted.push('=');
			formatted.push(value);
			formatted.push('\n');
		}

		_.each(resources, function(value, key) {
			if(untransedOnly && !value) return;

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

	function getResourceJSON(untransedOnly) {
		var res = resources;
		if(untransedOnly){
			res = _.reject(resources, function(trans, key){
				if(trans) return true; return false;
			});
		}
		return JSON.stringify({
			locale: locale,
			trans: res
		});
	}

	I18N.getResourceProperties = getResourceProperties;
	I18N.getResourceJSON = getResourceJSON;
	I18N.clearResourceCache = function(){
		var resources_cache_key = ['resources_', locale].join('');
		store.remove(resources_cache_key);
	};

	/**
	 * =============================================================
	 * Handlebars helper(s) for displaying text in i18n environment.
	 * =============================================================
	 */
	if(Handlebars){
		Handlebars.registerHelper('i18n', function(key, ns, options) {
			if(!options) {
				options = ns;
				ns = undefined;
			}
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
		}, options);

		if(!options.search)
			return this.filter('[data-i18n-key]').each(_i18nIterator);
		else {
			this.find('[data-i18n-key]').each(_i18nIterator);
			return this;
		}
	};


})(jQuery, _, URI);
