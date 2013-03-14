//menu accordion item template
Template.extend(
	'menu-accordion-item-tpl',
	[
		'<div class="menu-accordion-item-header">{{label}}</div>',
		'<div class="menu-accordion-item-content"></div>'		
	]
);


//menu tree template
Template.extend(
	'menu-tree-tpl',
	[
		'<li module="{{module}}"><div class="menu-item-wrapper"><a href="#config/{{module}}">{{label}}</a></div></li>'
	]
);

