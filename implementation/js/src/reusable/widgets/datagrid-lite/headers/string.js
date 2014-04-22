/**
 * The Default String Column Header Definition.
 *
 * @author Tim.Liu
 * @created 2013.11.25
 * @updated 2014.04.22
 */


;(function(app){

	app.widget('StringHeaderCell', function(){

		var View = app.view({
			template: '<span><i class="{{icon}}"></i> {{{label}}}</span>',
		});

		return View;
	});

})(Application);