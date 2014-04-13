Change Log
==========
1.0.0-rc2 (2014-04-09)
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
10. licensed under MIT


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