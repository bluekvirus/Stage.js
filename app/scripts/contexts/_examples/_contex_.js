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
			
			//the default sub UI module to show when /#navigate/:module can't find a sub module registered under this context.
			//if you DON'T need to support region switches by route (like in the Admin context), DELETE the defaults block below.
			defaults: {
				region: /*'a region you defined by the tpl below'*/,
				module: /*'the default sub UI module to show'*/
			},
			
			//The View object block, a Default View object must be defined by a UI related context or sub module. - see _sub_example.js
			View: {
				Default: Backbone.Marionette.Layout.extend({
					template: '#application-context-/*'Your Context name here.'*/-tpl',
					className: '',
					initialize: function(options){
						this.autoDetectRegions();
					},
					onShow: function(){
						this.fakeRegions(); - fake content in the regions (Layout object only).
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