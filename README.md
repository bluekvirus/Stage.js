The Framework
=============

Current Version
---------------
0.11.x

Core Concepts
-------------
DataUnit(model,collection), Context(with sub-modules), Part(editor, widget) and Enhancements(to view and collection).

With

Application(container + context switch + module router) and Utils(theme, i18n, user-session, downloader, script patcher, alerts...)

And

Tools(build(minify, gzip and js-fix), spawn(js-fix), iconprep(css-sprites, svg-path))



Development
===========

Include other js libs
---------------------
The default base.js contains selected libs for the project, if you would like to introduce more cd into `/app/libs`
then `bower install && npm install` - you need to know how to use bower tho.
include the lib your need in `index.html` from `bower_components`

###buildify.js
This is for building and combining required libs into a base-lib.js (before combined into the base.js with project specifics by `/tools/spawn`).
Check its content for sample usage. If you don't want the base.js we prepared for you, this is where to start from scratch.


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
	base.js (base.js.gz)
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