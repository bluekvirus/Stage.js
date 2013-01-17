(function(){
	
	//DO NOT modify this one...
	var id = 'basic-form-view-wrap-tpl';

	//only modify the content of these divs if needed.
	var tpl = [
		'<div class="form-header-container"></div>',
		'<div class="form-body-container"></div>',
		'<div class="form-control-bar"></div>'
	].join('');


	$('body').append(['<script type="text/tpl" id="',id,'">',tpl,'</script>'].join(''));
})()