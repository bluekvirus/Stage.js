For *Editors*, user interactions should be mainly focused on inputting data into the application through form-alike-view. 
(Note that *Widgets* should be more focused on displaying data and introducing interactions)

Since we employ a 'Formless' concept into the view enhancements(see core/enhancements/view.js), any view can be a form, thus, following this concept, we can see that the smallest 'form' is an editor.

Formless Design
===============
A. Editor View. (editors, this is what the Editor registry is mainly focused on)
	1. setVal()
	2. getVal()
	3. editor:changed:[fieldname] - should be fired on form/formPart instead of on itself
	4. validate() - this might be overriden or disabled if this editor is used to form some more complicated editor/formParts.


B. Form Part (editor group/fieldset) View. (rely on Editor View)
	1. getVals()/getVal(fname)
	2. setVals({k:v, ...,})
	3. fieldset:changed:[fieldset]:[fieldname](optional)
	4. validate() - migth be overriden, default on delegated editor validators.
	5. activateEditors() - replace editor tags in view templates with editor view instances (editor options in editors block)


C. Form View. (based on Fieldset View, see core/enhancements/view.js)
	+. addFormPart(region, form-part view, cb)
	+. submit, refresh, cancel actions implemented by default.


Editors
=======

Basic Editors 
-------------
(required) - browser compatibility ref: IE9+/FF/Chrome/Safari/Opera [http://www.w3schools.com/tags/att_input_type.asp])

Input - (text, password, url, email, checkbox(s), radios, file, hidden) - from `<input>`
Texts - (texts) - from `<textarea>`
Select - from `<select>`

Enhanced Editors
----------------
(optional, as customized or 3rd party plugins on top of basic editors)

Static - from `<p>`, this is a special editor that replacing 'disabled' text input
Spinner - (number) - from Text `<input>` with better visual effect
DatePicker - (date) - from Text `<input>` with better visual effect
Code - (md, code) - from Texts `<textarea>` with better layout, coloring and visual effect
Switch - same as Radios but with less choices and better visual effect
HoverSelect
FlattenSelect
Tags - (type to search'n'create) - from Select `<select>` with better visual effect
Picker - (drag-n-drop) - from Select `<select>` with left and right listing, details and better visual effect (both selected and choices listings permit view overriden)
Files - (jquery-file-upload) - from File `<input>` with upload cancellation, progress, file listing and details (file listing permits view overriden)
