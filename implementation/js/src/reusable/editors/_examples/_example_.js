/**
 * This is the code template for **basic** editor.
 *
 * Note that the validate function defaults on no-op. You should override this according to field settings during form/formPart init.
 *
 * @author Tim.Liu
 * @created 2013.11.10
 * @version 1.0.1
 */

Application.Editor.register('...', function(factoryOpt){

	var UI = Backbone.Marionette.ItemView.extend({

		template: 'editor-...-tpl',
		className: '',

		initialize: function(options){
			this.autoDetectUIs();
			this.validate = options.validate || this.validate;
			if(!_.isFunction(this.validate)) throw new Error('DEV::Editor....::Has invalid validation function!');
		},

		setVal: function(){
			throw new Error('DEV::Editor....::Has not yet implemented setVal()!');
		},

		getVal: function(){
			throw new Error('DEV::Editor....::Has not yet implemented getVal()!');
		},

		validate: factoryOpt.validate || $.noop

	});

	return UI;

});

Template.extend('editor-...-tpl', [
	' '
]);

