/**
 * New Context Module (UI or Non-UI related) Code Template.
 *
 * @author Tim.Liu
 * @create 2013.10.20
 * @version 1.0.1
 */

;(function(app){

	//Non-UI related Context doesn't have to have the 2nd parameter (the constructor that returns a View.Default)
	var context = app.Context.create(/*'Your Context name here.'*/);

	//Or
	
	//UI related Context should return an object that has a defaults config and a View.Default (BB.View or BM.View) object.
	app.Context.create(/*'Your Context name here.'*/, function(context){

		return {
			requireLogin: true, //if showing your context in app.body region requires the user to have logged in.
			factory: '/*'Your Factory name defined.'*/', //name registered by the factory module under modules/special/factory/... for UI sub-modules of this context.
			
			//the default sub UI module to show when /#navigate/:module can't find a sub module registered under this context.
			defaults: {
				region: /*'a region you defined by the tpl below'*/,
				module: /*'the default sub UI module to show'*/
			},
			
			//The View object block, a Default View object must be defined by a UI related context or sub module. - see _sub_example.js
			View: {
				Default: Backbone.Marionette.Layout.extend({
					template: '#application-context-/*'Your Context name here.'*/-tpl',
					className: '',
					regions: {
						/*Your region names*/: '[region=/*'Region name defined down below.'*/]',
					},
					onShow: function(){
						//some code here...
					}
				})
			}
		} 
	});

})(Application);

Template.extend(
	'application-context-/*'Your Context name here.'*/-tpl',
	[
	    '<div class="" region=""></div>',
	    '<div class="" region=""></div>'
	]
);