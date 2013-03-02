/**
 *
 * This is the Template class definition, we call it the 'loader'.
 * Every client-side template should be extending from this one, so
 * they can be added to the page.
 *
 *
 * @author Tim.Liu
 * 
 */


var Template = Template || {};

Template.extend = function (name, tplStrArray){
	var tpl = tplStrArray.join('');
	$('body').append(['<script type="text/tpl" id="',name,'">',tpl,'</script>'].join(''));
}