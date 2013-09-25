/**
 *
 * This is the Template class definition, we call it the 'loader'.
 * Every client-side template should be extending from this one, so
 * they can be added to the page.
 *
 *
 * @author Tim.Liu
 * @update 2013.03.01
 */

;(function(scope, $){
	scope.Template = scope.Template || {};

	scope.Template.extend = function (name, tplStrArray){
		var tpl = tplStrArray.join('');
		$('head').append(['<script type="text/tpl" id="',name,'">',tpl,'</script>'].join(''));
	}
})(window, jQuery);
