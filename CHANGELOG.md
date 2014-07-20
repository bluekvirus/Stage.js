Change Log
==========
1.5.1 (2014-07-21*)
-------------------
1. app.config.viewTemplates now defaults to 'static/template';
2. all.json now ships with all the dist packages;
3. Build tools now accepts creating ''s (blank files) in build configs;
4. Refining theme mocks and less structure + prep script;


1.5.0 (2014-07-18)
-------------------
1. Added navigation guard function to Contexts. (auth related)
2. Added app:context-guard-error event to Application.


1.4.4 (2014-07-18)
------------------
1. Added row:clicked and row:dbclicked to Datagrid widget;
2. Removed CORS ability from remote template loading;
3. Fixed doc markdown format;


1.4.3 (2014-07-17)
------------------
1. Fixed bug in app nav/context region fallback upon app template empty;
2. Empty #navigate/ now fallback to the default context;
3. Code reviewed and linted;
4. Fixed bug in setting checkbox editor val (uncheck);
5. Removed 'context:navigate-to' event to reveal 'view:navigate-to' event in the navigation chain mech;


1.4.0 (2014-07-17)
------------------
1. Added new chainable navigation routing mech (navRegion) /v/sv/ssv/...;
2. Fixed bug in building templates (all.json) on non-unix machines;
3. Refined Application init/setup sequence;
4. Updated doc (how-to) about navigation mech changes;


1.3.2 (2014-07-11)
------------------
1. Allow '@\*\*/\*.html' remote templating to be used for application template;
2. Fixed navigation module/subpath broken-by-'/'-char issue;
3. Named app.view() will now be considered/registered as regionals;
4. Datagrid rows will now have a reference to their parent grid instance;


1.3.0 (2014-07-08)
------------------
1. Added remote view template support @*.html and all.json (compiled);
2. Added \*\*/\*.html -> all.json into build script;
3. Updated doc (how-to) about view templating changes;


1.2.2 (2014-07-08)
-------------------
1. fixed bug on region scanning in application's main template (#main);
2. fixed application kickstart seq to hook to correct ready event (normal/hybrid);
3. Allow multiple folder merge in build tool;
4. Added ready-to-use @fontface kits in bower.json;


1.2.1 (2014-06-23)
-------------------
1. added additional css class for editor help and status texts;
2. added auto fieldname generation for all basic editors;
3. refined doc about adding editor validations;
4. added parentCtx back to views;
5. added node/leaf class default css to tree nodes;
6. improved doc wordingz;


1.2.0 (2014-06-16)
------------------------
1. Refined 'app:navigation' event arguments;
2. Added headless(label-less) mode style to basic editors;
3. Added default value assignment to basic editors;
4. Refined status method in basic editor/item-view/layout;
5. Refined Compound editor (with eager validation disabled atm);
6. Refined icons prep + css-sprite tools (changed to use gm); 


1.1.2 (2014-05-29)
----------------
1. Fixed off-by-1 bug in Tree widget;
2. Allow app:navigate event listener to change window.location.hash path;
3. Rewired window.onerror to fire app:error event;
4. Removed view.flyTo and added view.overlay method to use views as overlays;
5. Re-run app.setup will override the app.config settings only;
6. Added context:navigate-away event for saving context state;
7. Added auto-caching to $.md plugin using $el.data();
8. Fixed bug in $.overlay() css recovery upon closing;
9. Delayed [ui] and [region] mark scanning to fit dynamic view template;


1.1.1 (2014-05-19)
------------------
1. Basic Editor: +options.remote (fetch options with app.remote);
2. Layout+: +regional fieldset to support form view pieces (get/setValues, validate, getEditor and this._fieldsets); [without the status method atm]
3. Activate Editors: +compound editor support;
4. Disabled editors now correctly get omitted during getValues();


1.0.1 (2014-05-09)
------------------
1. Give app.Core.Regional.get an options param to return instance;
2. region:load-view can now instantiate both Widget and Regional with options;
3. Renamed _isDefined() to has() in app.Core.Widget;
4. Fixed error in tools/shared/hammer.js to correctly creating output folders;
5. Fixed error in the default build config for project-kit distributions;
6. Fixed stage.js version error in bower.json for project-kit distributions;


1.0.0 release (2014-05-07)
--------------------------
1. added simple paginator (passive) widget
2. added view:load-page, view:page-changed to CollectionView instances (remote data only)
3. refined dev-server profile and router config
4. removed module wrap on Context definitions
5. fixed error in svg config for views
6. added meta-event pairs and view:reconfigure concepts into widget building


1.0.0-rc3 (2014-04-25)
----------------------
1. added dev-server (ajax-box-lite, with less monitor, easy routers, no session or DB by default) in tools
2. added app.model({data}) and app.collection([data]) back 
3. refined $.overlay
4. simple tree (presentation) widget
5. simple datagrid (presentation) widget
6. added data/html mocking library


1.0.0-rc2 (2014-04-15)
----------------------
1. updated framework documentation (draft version done)
2. replaced the remote data interfacing core module.
3. added/formalized object meta-event programming util.
4. added 'Page' and 'Area' aliases for 'Context'/'Regional'
5. added 'parentContext' and 'parentCt' for view objects shown through regions
6. auto-detect config for actions, svg/canvas paper, editors and enable them
7. deprecated the app.create() API in favor of detailed APIs
8. added disable(), isEnabled() and setChoices() APIs to editors
9. added getEditor() and removed get/setVal() APIs in views
10. merged 3rd-party processing tool into tools 
11. refined build targets, bower info and licensed under MIT


1.0.0-rc1 (2014-03-12)
----------------------
1. updated framework documentation (still in progress)
2. formalized project file structure
3. added unified app api entry point
4. refined build & deploy script
5. further reduced selected libs
6. refined region view loading, added app Core.Regional module
7. formalized theme building process and structure


1.0.0-pre (2014-02-12)
----------------------
1. updated framework documentation (still in progress)
2. refined the client app route implementation


0.13.x (2014-01-07)
-------------------
1. (done) Add general ajax/data op progress bar on top (nprogress) as application util
2. (done) Remove noty2 and replace it with a new alert/messaging system + prompt as application util (view.flyTo and $.overlay())
3. (done) Add a new 2-lvl accordion menu widget
4. (done) Leave nothing but titile <---> message, help on the banner, move user above the left menu accordion
5. (done) Make file upload work (both ajax and iframe post)