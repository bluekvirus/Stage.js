/**
 * Pre-defined validation rules/methods for basic editors.
 *
 * Rule Signature
 * --------------
 * name: function(options, val, form){
 * 	return nothing if ok
 * 	return error message if not
 * }
 *
 * Method Signature
 * ----------------
 * anything: function(val, form){
 * 	... same as rule signature
 * }
 *
 * Editor Config
 * -------------
 * validate: {
 * 	rule: options,
 * 	rule2: options,
 * 	fn: function(val, form){} - custom method
 * 	rule3: function(val, form){} - overriding existing rule for this editor
 * 	...
 * }
 *
 * or 
 *
 * validate: function(val, form){}
 *
 * A little note
 * -------------
 * We use the Application.Core.Editor module to register our validation rules, the enhanced editors or total customized editors might use them through the underlying basic editor(s) involved.
 *
 * @author Tim.Liu
 * @created 2013.11.13
 */

;(function(app){

	//preset error strings
	app.Core.Editor.errors = {

		required: 'This field is required',
		unique: 'This value has been taken'

	};

	//preset rules
	app.Core.Editor.rules = {

		required: function(options, val, form){
			if(!val) return (_.isObject(options) && options.msg) || app.Core.Editor.errors['required'];
		}

	}

	//adding new rules at runtime
	app.Core.Editor.addRule = function(name, impl, error, override){
		if(!name || !_.isFunction(impl)) throw new Error('DEV::Editor::Basic validation rule must have a name and a function implementation.')
		if(_.isBoolean(error)) override = error;
		if(app.Core.Editor.rules[name] && !override) throw new Error('DEV::Editor::Basic validation rule name ['+ name +'] is already defined, use override=true if want to override.');

		app.Core.Editor.rules[name] = impl;
		if(_.isString(error)) app.Core.Editor.errors[name] = error;
	}

})(Application);