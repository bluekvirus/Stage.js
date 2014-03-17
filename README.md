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
A .zip and a .tar.gz will also be produced to facilitate framework download. **DO NOT BUILD .zip on a MAC OS X**


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

Note on *Class.extend*
----------------------
Mind the prototypical (chain) inheritance, if B = A.extend({}) and then C = B.extend({}), changing B = B.extend({+ properties}) will **NOT** affect C with newly added properties in B.prototype, since this new B is not the one used to create the C.prototype [coz C.prototype = new B() previously in C = B.extend({})].
However, new C() will still call B.apply(this, args) to create a new instance of itself [coz C.constructor = function(){B.apply(this, args)}], thus B = B.extend({* constructor}) can still work since this new constructor will be executed again whenever a new C() is called.
Also, _.extend(B.prototype) will work (effectively change C) since all the *old* B instances [recall C.prototype = new B() previously in C = B.extend({})] will still have a reference to B.prototype, changing this will effectively adding new properties to new instances of C.

Not that you will NOT see this.prototype in a new C() instance points to C.prototype, but it is ensured by the language, you can use all of C.prototype's property/method in a new C() instance. You can augment a new C() by _.extend(C.prototype, {+ properties}) or (new C())[+ property] = ...;

Changing B.prototype.constructor alone will not bring wanted effect as B = B.extend({*constructor}) would. Result would be in-correct as 'this' scope in this.listenTo(this, ...) will be messed up given the js functional scope mech.


Note on *Ghost View*
--------------------
This is caused by removing a view's html but leaving the event listeners 'on'... Thus make sure you remove a view's html together with the event listeners by invoking the `view.close()`(Marionette) method, which will in turn invoke the `view.undelegateEvents()`(Backbone) method which will futher grab `$.off`(jQuery) to clean up the listeners.

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