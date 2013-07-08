/**
 * This is the mask jQuery plugin for masking certain dom element or all other.
 * This plugin should be loaded as early as possible, since other form/editor/notification widgets might need this effect.
 *
 * @author Tim.Liu
 * @create 2013.07.08
 */

(function($){

	$.fn.elMask = function(options){

		//default options
		options = $.extend({
			target: '', //selector
			/*types/modes*/
			readOnly: false, //mask with a Read-Only sign; - NI (NON-INTERACTABLE)
			loading: true, //mask with a loading spin and msg; - NI
			highlight: false, //blacken all other els to contrast this one; - I but others NI
			/*customization - read-only or loading mode*/
			custom: undefined, //custom el (mask view) to be used; - types and msg will not be used
			msg: '', //msg to replace the read-only and loading message;
			/*cancellation*/
			timeout: 0, //(ms) anything non-positive && > 0 should be considered; - only in loading mode
			//cancelOnClick: true, //default behavior in highlight mode (only), user will cancel the highlight mode upon clicking the masked area.
			/*callbacks*/
			onShow: $.noop, //on 'show' callback;
			onClose: $.noop, //on 'close' callback;
			onCancelled: $.noop, //on 'cancel'/'timeout' callback; 

		}, options);

		//TBI

	};

})(jQuery);