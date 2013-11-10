/**
 * This is the Editor Registry module. It is pretty much a widget registry but more focused on the input/editor/control side of view.
 * User interactions should be mainly focused on inputting data into the application through form-alike-view. 
 * Note that widgets should be more focused on displaying data and instroducing interactions. 
 *
 * Since we employ a 'Formless' concept into the view enhancements(see core/enhancements/view.js), any view can be a form, thus, following this concept,
 * we can see that the smallest 'form' is an editor.
 *
 * ======
 * Design
 * ======
 * A. Editor View. (basic editors, this is what this registry is mainly focused on)
 * 	1. setVal()
 * 	2. getVal()
 * 	3. editor:changed:[fieldname]
 * 	4. validate() - this might be overriden or disabled if this editor is used to form some more complicated editor/formParts.
 *
 * 
 * B. Form Part (editor group/fieldset) View. (rely on Editor View)
 * 	1. getVals()/getVal(fname)
 * 	2. setVals({k:v, ...,})
 * 	3. fieldset:changed:[fieldset]:[fieldname] (optional)
 * 	4. validate() - migth be overriden, default on delegated editor validators.
 * 	5. activateEditors() - replace editor tags in view templates with editor view instances (editor options in editors block)
 *
 * 
 * C. Form View. (based on Fieldset View, see core/enhancements/view.js)
 * 	+. addFormPart(region, form-part view, cb)
 *  +. submit, refresh, cancel actions implemented on default.
 *
 * 
 * @author Tim.Liu
 * @created 2013.11.09
 */