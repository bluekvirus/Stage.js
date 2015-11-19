/**
 * Script injecting util for [batch] reloading certain script[s] without refreshing app.
 *
 * batch mode: use a .json to describe the js listing
 * json format:
 * 1. ["scriptA.js", "lib/scriptB.js", "another-listing.json"]
 * 2. {
 * 		"base": "js",
 * 		"list": [ ... ] //same as 1
 * }
 *
 * @author Tim Lauv
 * @created 2014.10.08
 */

;(function(app){

	app.Util.inject = function(url, sync){

		url = url || 'patch.json';

		if(_.string.endsWith(url, '.js'))
			return $.ajax({
				url: url,
				async: !sync,
				dataType: 'script'
			});
		else
			return $.getJSON(url, function(list){
				var base = '';
				if(!_.isArray(list)) {
					base = list.base;
					list = list.list;
				}
				_.each(list, function(js){
					app.Util.inject((_.string.endsWith(base, '/')?base: (!base?'':(base + '/'))) + js, sync);
				});
			});
	};

})(Application);