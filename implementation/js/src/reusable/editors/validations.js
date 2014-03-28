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


	//preset rules
	app.Core.Editor.rules = {

		required: function(options, val, form){
			if(!val) return (_.isObject(options) && options.msg) || 'This field is required';
		}

	}

	//adding new rules at runtime
	app.Core.Editor.addRule = function(name, fn){
		if(!name || !_.isFunction(fn)) throw new Error('DEV::Editor::Basic validation rule must have a name and a function implementation.');
		if(app.Core.Editor.rules[name]) console.warn('DEV::Editor::Basic validation rule name ['+ name +'] is already defined.');

		app.Core.Editor.rules[name] = fn;
	}

})(Application);