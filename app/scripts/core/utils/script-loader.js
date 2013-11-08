/**
 * ==============================
 * Try/Patch scripts loading:
 *
 *
 * @author Tim.Liu
 * @created 2013.04.01
 * @updated 2013.11.08
 * ==============================
 */

;(function(){

	//worker function [all shorthands extend from this one]
	var $body = $('body');
	var _patch = function(server, payload, silent){
	    var path = payload;
	    $.ajax({
	        url: server,
	        async: false, //sync or else the loading won't occure before page ready.
	        timeout: 4500,
	        global: !(silent || false),  
	        data: {payload: path, type: 'js'}, //Compatibility:: 0.9 server still need 'type' param
	        success: function(json, textStatus) {
				//optional stuff to do after success
				var count = 0
				_.each(['modules', 'extensions', 'others'], function(type){
					_.each(json[type], function(f, index){
					    $body.append('<script type="text/javascript" src="'+path+'/'+f+'"/>');
					    count++;
					});
				})
				/**
				 * ===================================
				 * Compatibility
				 * ===================================
				 * backward compatible with 0.9 server
				 */
				if(count === 0 && json.files){
					_.each(json.files, function(f, index){
					    $body.append('<script type="text/javascript" src="'+path+'/'+f+'"/>');
					});
				}
				//====================================

				if(!silent && json.error)
					Application.error('Auto Loader Error', json.error);
	        }
	    });
	}

	//shorthand methods
	Application.patchScripts = function(){
		_patch('/tryscripts', 'scripts/_try', true);
	};

})();