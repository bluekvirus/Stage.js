Stage.js
===================
This project produces **Stage.js** - an infrastructure for building modern web application client with many contexts (e.g a data-heavy administration app).


What's next?
------------
1.1.0 might bring:
* local filter/sorter mech into list views;
* Datagrid+ : select-all header/cell, details row;
* Editor+ : Spinner, Switches, DnD Listing, File Listing;
* local pagination mech into list views; 
* provide a way to persist context status between context switches.



Current Version
---------------
1.0.0-release


Build
-------------
Run `tools/build/shortcut.sh` and see dist for details.


Deploy-able
-----------
The `/implementation` folder is also servable as a product intro & download page of **Stage.js** releases.


Core Concepts & Workflow
----------------------
See 'implementation/HOWTO.md'


Tooling
-------
Prepare icon css sprites or svg paths
See `/implementation/themes/README.md`


License
-------
Copyright 2013 - 2014 Tim (Zhiyuan) Liu. 
Licensed under the [MIT](http://opensource.org/licenses/MIT) License.


Notes
=====
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

*Class.extend*
----------------------
Mind the prototypical (chain) inheritance, if B = A.extend({}) and then C = B.extend({}), changing B through B' = B.extend({+ properties}) will **NOT** affect C with newly added properties in B'.prototype, since this new B' is not the one used to create the C.prototype [coz C.prototype = new B() previously in C = B.extend({})]. Use _.extend(B.prototype) instead. _.extend(B'.prototype) will not affect previously/newly created C instances.

New C() will still call the B/B'.apply(this, args) to create a new instance of itself [coz C.constructor = function(){B/B'.apply(this, args)}], thus B' = B.extend({* constructor}) can work in Backbone since this B' function will be executed again whenever a new C() is called. However, the prototypical chain B->C is now broken. C will have to extend from B' again to pick up _.extend(B'.prototype, {...}) added properties. (C's descendents will have to do the extend along the prototypical chain all over again...)

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

Note that by doing C.prototype = new B' again after B' = B.extend() will amend the broken prototypical chain for C and C only, it will not work for D (D = C.extend()) because chain C->D is now broken... D will suffer from possible property lost.

However, Backbone supports changing B.prototype.constructor to affect C without affecting new B instances. Since all Backbone classes use parent.prototype.constructor.apply() instead of just parent.apply() like in its extend method (supported by the extend method itself, see above code block)

Note that You can always augment a new B() by _.extend(B.prototype, {+ properties}) or (new B())[+ property] = ...; Only the former can affect C (C = B.extend()) since C.prototype = new B() and every instance of B will have it's property inherited from B.prototype. (The prototypical chain is walked dynamically upon searching of a property or method, so a later change to the B.prototype can still affect previously created B and C instances, you can think of B.prototype as a symbolic ref which will be interpreted each time the chain-walking-searching happens)

Again, remember changing B.prototype.constructor will not bring wanted effect as B' = B.extend({*constructor}) would. And after B' = B.extend({* constructor}), if you still want _.extend(B'.prototype) to mean something in C, move it up before B' = B.extend({* constructor});

_.extend(X.prototype) will affect both already and newly created instances of X and those extended from X.

Don't mess up the chain by just re-assigning X.prototype (since it will break the chain). Do 'X = Y(){...} and then X'.prototype = new X and lastly X'.prototype.constructor = X'. If you want to add more property to Z (Z = X.extend) through X', put altered construction code in Y(){} and add new property to Z through _.extend(X.prototype) instead of on X'. If you don't need to alter X itself, **in Backbone**, just do X.prototype.constructor = Y(){ ...; X.apply(this, arguments);}, this will only affect new instances of X's descendants.


*Ghost View*
--------------------
This is caused by removing a view's html but leaving the event listeners 'on'... Thus make sure you remove a view's html together with the event listeners by invoking the `view.close()`(Marionette) method, which will in turn invoke the `view.undelegateEvents()`(Backbone) method which will further grab `$.off`(jQuery) to clean up the listeners.

Note that calling `region.show()` will automatically `close()` the previously shown view object, the view object closed will still exist in the js runtime, if you somehow decide to `show()` it again, you need to manually call `view.delegateEvents()` to re-activate the event listeners.

In other words, if you `show()` an old view without re-`new()` it, you will have to hook up the events again using `view.delegateEvents()`.

Also, please use the `events:{...}` block to register listeners in a view definition, stop using `$.on()` in case you forgot to use `$.off()`.

If you have to use `$.on()` use it in a delegated form (on a parent dom object).


IE(6-9)
---------------
Before IE10, some efforts are still needed before the web app can work on an IE browser. We've prepared to add the following lib/tool to accommodate this in the future: (though we don't want to...)

1. selectivizr.js - client libs (already added in bower.json, not in use) We need to disable our app theme-roller for IE after adding this into index.html.
```
<!--[if (gte IE 6)&(lte IE 8)]>
  <script type="text/javascript" src="selectivizr.js"></script>
  <noscript><link rel="stylesheet" href="[fallback css]" /></noscript>
<![endif]-->
```

2. fixmyjs - client tools npm (already added in package.json, not in use) Need to put it into both build and spawn tool (shared/hammer.js) before js minification. This will fix the extra commas that IE complains about.