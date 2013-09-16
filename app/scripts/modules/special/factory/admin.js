/**
 * This is the meta module (modules' module) that produces the data admin module for a given data object.
 * It is a replacement for our client side data module code obtained by the AdminGen.
 *
 * ======
 * Design
 * ======
 * Since the data admin modules show common patterns, we don't want the developers to download/re-generate code each time they change something in the field cfg or
 * we change something in the template. This is the module that reflects the latest change in the data admin configuration process.
 * Also, tho a GUI to help visualize the data admin config is good, most of our programmers prefer to write it, so they can feel more in-charged mentally. After all,
 * a JSON format representation carries limited data, custom behaviors (those can not be generalized to use a flag var) need functions which can not be stored easily 
 * in a json file.
 * A data admin module usually has 4 parts:
 * 1. fields (definition block)
 * 2. datagrid (widget) - if of type table.
 * 3. form (widget) - only, if of type complex.
 * 4. view (default layout view to show the datagrid and/or form)
 *
 * ======
 * Usage
 * ======
 * app.Factory.AdminModule.create(...config...); //define.
 * app.Factory.AdminModule.get(...name...); //for extension.
 *
 * created module will appear in app.Admin.[...name...]
 * 
 * ======
 * Config
 * ======
 * To create a data admin module, we need:
 * 
 * 
 */