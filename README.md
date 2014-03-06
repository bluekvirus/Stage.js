The Factory Project
===================
This project produces **ProJS.Client** - an infrastructure for building modern web application client with many contexts (e.g a data-heavy administration context).


What's next?
------------
1. Use more Promise/A+ patterns in async op sequence (animation, remote data, delays/ticks - jQuery & node[bluebird](https://github.com/petkaantonov/bluebird));
2. Editor+ : Spinner, Switches, DnD Listing, File Listing;
3. Widget+ : Break Widgets into List and Containers (e.g list[stacked(items and table rows), tabbed, nested(tree), queued(toolbar)]); Grid Local Column +-/Sort/Filter;


Current Version
---------------
1.0.0-rc1


Build Release
-------------
Run `node /tools/build/build.js` and see dist for uncompressed minimum project package using the latest built version of this framework and tools.
A .zip and a .tar.gz will also be produced to facilitate framework download.


Deploy-able
-----------
The `/implementation` folder is also servable as a product intro & download page of **ProJS.Client** releases.


The Framework
=============

Core Concepts
-------------
See `design/docs/code/framework.md`


Simplified Development
----------------------
See 'implementation/static/resource/default/md/how-to-use.md'


Tooling
=======

Prepare icon css sprites or svg paths
-------------------------------------
See `/implementation/themes/README.md`


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



Notes
=====
Note on *Ghost View*
--------------------
This is caused by removing a view's html but leaving the event listeners 'on'... Thus make sure you remove a view's html together with the event listeners by invoking the `view.close()`(Marionette) method, which will in turn invoke the `view.undelegateEvents()`(Backbone) method which will futher grab `$.off`(jQuery) to clean up the listerns.

Note that calling `region.show()` will automatically `close()` the previously shown view object, the view object closed will still exist in the js runtime, if you somehow decide to `show()` it again, you need to manually call `view.delegateEvents()` to re-activate the event listeners.

In other words, if you `show()` an old view without re-`new()` it, you will have to hook up the events again using `view.delegateEvents()`.

Also, please use the `events:{...}` block to register listeners in a view definition, stop using `$.on()` in case you forgot to use `$.off()`.

If you have to use `$.on()` use it in a delegated form (on a parent dom object).


Note on IE(6-9)
---------------
Before IE10, some efforts are still needed before the web app can work on an IE browser. We've prepared to add the following lib/tool to accommodate this in the future:

1. selectivizr.js - client libs (already added in bower.json, not in use) We need to disable our app theme-roller for IE after adding this into index.html.
```
<!--[if (gte IE 6)&(lte IE 8)]>
  <script type="text/javascript" src="selectivizr.js"></script>
  <noscript><link rel="stylesheet" href="[fallback css]" /></noscript>
<![endif]-->
```

2. fixmyjs - client tools npm (already added in package.json, not in use) Need to put it into both build and spawn tool (shared/hammer.js) before js minification. This will fix the extra commas that IE complains about.