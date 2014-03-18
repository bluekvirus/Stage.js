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
Mind the prototypical (chain) inheritance, if B = A.extend({}) and then C = B.extend({}), changing B through B' = B.extend({+ properties}) will **NOT** affect C with newly added properties in B'.prototype, since this new B' is not the one used to create the C.prototype [coz C.prototype = new B() previously in C = B.extend({})]. Use _.extend(B.prototype) instead. _.extend(B'.prototype) will not affect previously/newly created C instances.

However, new C() will still call the new B'.apply(this, args) to create a new instance of itself [coz C.constructor = function(){B/B'.apply(this, args)}], thus B' = B.extend({* constructor}) can work since this new B' will be executed again whenever a new C() is called. Though, the prototypical chain B->C is now broken. C will have to extend from B' again to pick up _.extend(B'.prototype, {...}) added properties.

Note that Backbone define its special inheritance method extend({}) to accept {constructor} overridden, like this:
```
...
    // The constructor function for the new subclass is either defined by you
    // (the "constructor" property in your `extend` definition), or defaulted
    // by us to simply call the parent's constructor.
    if (protoProps && _.has(protoProps, 'constructor')) {
      child = protoProps.constructor;
    } else {
      child = function(){ return parent.apply(this, arguments); };
    }
...
```
This is why B' = B.extend({* constructor}) works, it is never to change B.prototype.constructor, but to directly change B. This is how js works. When a function (like B) is defined, B.prototype.constructor gets created, it is just a property, changing it will not affect the way *new* B() behaves. B will still be called instead of the *changed* B.prototype.constructor, if you ever tried to change it.

However, Backbone supports changing B.prototype.constructor to affect C without affecting new B instances. Since all Backbone classes use parent.prototype.constructor.apply() instead of just parent.apply() like in its extend method (supported by the extend method itself, see above code block)

Also, _.extend(B'.prototype) will *NOT* work (to change C) since all the *old* B instances [recall C.prototype = new B() previously in C = B.extend({})] will still have the old prototype ref to the old B.prototype, changing this will *NOT* effectively add new properties to new instances of C. Do it before B' = B.extend({* constructor}).

Note that by doing C.prototype = new B' again after _.extend(B'.prototype) will amend the broken prototypical chain for C and C only, it will not work for D (D = C.extend()) because chain C->D is now broken... D will suffer from property lost.

Note that You can always augment a new B() by _.extend(B.prototype, {+ properties}) or (new B())[+ property] = ...; Only the former can affect C (from using B.extend()) since C.prototype = new B() and every instance of B will have it's property inherited from B.prototype. (The prototypical chain is walked dynamically upon searching of a property or method, so a later change to the B.prototype can still affect previously created B and C instances, you can think of B.prototype as a symbolic ref which will be interpreted each time the chain-walking-searching happens)

Again, remember changing B.prototype.constructor alone will not bring wanted effect as B' = B.extend({*constructor}) would. And after B' = B.extend({* constructor}), if you still want _.extend(B'.prototype) to mean something in C, move it up before B' = B.extend({* constructor});

_.extend(X.prototype) will affect both already and newly created instances of X and those extended from X.

Don't mess up things by just changing X.prototype. Do 'X = Y and then X'.prototype = new X and lastly X'.prototype.constructor = X'.


Note on *Ghost View*
--------------------
This is caused by removing a view's html but leaving the event listeners 'on'... Thus make sure you remove a view's html together with the event listeners by invoking the `view.close()`(Marionette) method, which will in turn invoke the `view.undelegateEvents()`(Backbone) method which will further grab `$.off`(jQuery) to clean up the listeners.

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