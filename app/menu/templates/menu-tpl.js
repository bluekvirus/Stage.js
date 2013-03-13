(function(){
	
	//menu accordion item template
	var id = 'menu-accordion-item-tpl';

	var tpl = [
		'<div class="menu-accordion-item-header">{{label}}</div>',
		'<div class="menu-accordion-item-content"></div>'
	].join('');

	$('body').append(['<script type="text/tpl" id="',id,'">',tpl,'</script>'].join(''));


	//menu tree template
	id = 'menu-tree-tpl';

	tpl = [
		'<li module="{{module}}"><div class="menu-item-wrapper">{{label}}</div></li>'
	].join('');

	$('body').append(['<script type="text/tpl" id="', id, '">', tpl, '</script>'].join(''));

})()