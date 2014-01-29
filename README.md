The Framework
=============
For building modern web application with many contexts (including a data-heavy administration context).


What's next?
------------
1. A basic development .md doc (static);
2. Use more Promise/A+ patterns in async op sequence (animation, remote data, delays/ticks - jQuery & node[bluebird](https://github.com/petkaantonov/bluebird));
Note that this is different than *Co-op Events* we used between views.
3. Enhancements: Mixed(Fixed + Dynamic) Regions - Layout (+gridster alike tool to create layout tpl);
4. Editor+ : Number Spinner, Flag Switches, DnD Listing, File Listing;
5. Widget+ : MD menu listing; Grid Local Column +-/Sort/Filter; Accordion Menu lvl 1 (no groups);

Current Version
---------------
1.0.0-pre


Core Concepts
-------------
see `static/md/docs/framework.md`



Development
===========

Include other js libs
---------------------
The default libs.js contains selected libs for the project, if you would like to introduce more cd into `/app/libs`
then `bower install && npm install` - you need to know how to use bower tho.
include the lib your need in `index.html` from `bower_components`

###buildify.js
This is for building and combining required libs into a base-lib.js (before combined into the libs.js with project specifics by `/tools/spawn`).
Check its content for sample usage. If you don't want the libs.js we prepared for you, this is where to start from scratch.


Build for production use
------------------------
Use `/tools/build` you need to check the config file `config/app.js` (though, default should be good and ready)
`node build.js app` will build your client app into `/tools/build/dist/app`
Use attribute `non-core="true"` in the `<script>` tag within your index.html, if you don't want some scripts to be built into the big all-in-one js.


Prepare icon css sprites or svg paths
-------------------------------------
see `/app/themes/README.md`


Continuous Integration
----------------------
###gitlab_ci fix: trouble shooting

####1. Allow guest ssh to clone repo in build
(since we might have changed the host name during gitlab installation.)

`sudo su - gitlab_ci -c "ssh-keygen -R [your host name or ip, e.g: 172.22.4.24]"`

or

`sudo su - gitlab_ci -c "ssh git@[your host name or ip, e.g: 172.22.4.24]"`

and then accept to add host to known hosts.


####2. build script format
`cmd1 && cmd2 && cmd3 && ... && cmd4 &`

Do **NOT** hang the build script, use `&` if needs be or avoid at all times.



Upgrade/Update
=============

Upgrade
-------
The client side app framework is still under active development, so the current upgrade process demands a bit efforts.
We will automate/improve the update/upgrade process in future development.

(make sure you save these when upgrading the client app framework)
```
1. scripts/
    a. config.js
	b. try/
	c. parts/

2. index.html

3. static & themes/
	(yours only)
```


Update 
------
(if you don't need to upgrade to pick up new app structure and tools, can simply update these files only)
```
scripts/
	libs.js (libs.js.gz)
	core.js
```



Spawn
=======

Spawn Projects from current code base
-------------------------------------
Config `/tools/spawn`
```
config/ - has the folder structure settings for newly spawned projects.
indices/ - has the index.html files used for each of the spawned project.
```
then `node spawn.js [your config name]`

Warning:

1. If the app framework changes, please re-check the indices and configs before spawning new projects from the current code base.

2. You can **NOT** spawn from a spawned project, it will only have the build tool (and the dev support tools e.g the iconprep tool).



Note on *Ghost View*
====================
This is caused by removing a view's html but leaving the event listeners 'on'... Thus make sure you remove a view's html together with the event listeners by invoking the `view.close()`(Marionette) method, which will in turn invoke the `view.undelegateEvents()`(Backbone) method which will futher grab `$.off`(jQuery) to clean up the listerns.

Note that calling `region.show()` will automatically `close()` the previously shown view object, the view object closed will still exist in the js runtime, if you somehow decide to `show()` it again, you need to manually call `view.delegateEvents()` to re-activate the event listeners.

In other words, if you `show()` an old view without re-`new()` it, you will have to hook up the events again using `view.delegateEvents()`.

Also, please use the `events:{...}` block to register listeners in a view definition, stop using `$.on()` in case you forgot to use `$.off()`.

If you have to use `$.on()` use it in a delegated form (on a parent dom object).



Note on IE(6-9)
===============
Before IE10, some efforts are still needed before the web app can work on an IE browser. We've prepared to add the following lib/tool to accommodate this in the future:

1. selectivizr.js - client libs (already added in bower.json, not in use) We need to disable our app theme-roller for IE after adding this into index.html.
```
<!--[if (gte IE 6)&(lte IE 8)]>
  <script type="text/javascript" src="selectivizr.js"></script>
  <noscript><link rel="stylesheet" href="[fallback css]" /></noscript>
<![endif]-->
```

2. fixmyjs - client tools npm (already added in package.json, not in use) Need to put it into both build and spawn tool (shared/hammer.js) before js minification. This will fix the extra commas that IE complains about.


Change Log
==========

0.13.x (2014-01-07)
-------------------
1. (done) Add general ajax/data op progress bar on top (nprogress) as application util
2. (done) Remove noty2 and replace it with a new alert/messaging system + prompt as application util (view.flyTo and $.overlay())
3. (done) Add a new 2-lvl accordion menu widget
4. (done) Leave nothing but titile <---> message, help on the banner, move user above the left menu accordion
5. (done) Make file upload work (both ajax and iframe post)
