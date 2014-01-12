Introduction
============
ProJS is a 2-part web application architecture that enables rapid development on both client and server side while reducing the pain in code implementation and later maintenance. Its implementation makes use of modern web technology and libraries(3rd party implementations) to maximize flexibility and scalability while employing common design patterns to promote cleaner design and the *write less do more* concept. It also comes in with build tools (minify, gzip, css-sprites...) and monitors (less auto-compile) to assist you in the development process.

Client
------
The client side is made on top of Underscore, jQuery, Handlebars, Backbone, Marionette and Bootstrap. To flatten and lower the initial learning curve for adaptation, we didn't wrap things around the basic libs here, there are no wrapper APIs or Classes to learn to use the same thing from Marionette or the original Backbone.js. It is designed so in order to let the developers (you) feel more comfortable while reusing their (your) existing web development knowledge and experience.

We also maintain a list of 3rd party libraries for you to choose from to be used as utilities. The utility libs (e.g jquery-file-upload, store.js, uri.js, raphael.js, marked, moment.js...) are carefully selected from the many open-source Javascript libs out there to help with specific but generally-will-appear problems that you will encounter during a web application development process.

###Moving Away From ExtJS and All-in-All Frameworks###
We have been developing in ExtJS4 for almost 2 years, starting form the last version of 4.0 which is the promising 4.0.7. As our knowledge base expands, we felt that it is time to form our own blueprint of a modern data heavy web application. Here is why:

1. Although it is relatively fast to develop prototypes using a all-in-all framework like ExtJS or YUI, it is hard to maintain the code while keeping up with the changes.
2. Loading, DOM interfacing, Widget and Application containers are all provided with a biased opinion, which could end up with a fighting with the framework here a there or messing around with the life-cycles defined. 

###Core Concepts###
Forget about MVC, it really isn't magic. It is there in the old web development process because of the stateless character of HTTP and the url-to-page concept that was used to build JSP/PHP/RoR apps. Modern web apps blur the line between V and C by putting dynamic views generation (using Backbone and jQuery) into the user browser. A separately defined M is really unnecessary when you don't even need to specify the model attributes. Let's see what you really need by moving 1 level up and examining the *Big Picture*.

What you *REALLY* need:

1. API(remote data interfacing), Context(layouts with sub-modules), Part(editor, widget for making views in sub-modules) and Enhancements(to libs).
2. Application container(context switch + context's sub module routing) and Utils (theme-rolling, user-session, i18n, messaging, prompts, downloader-by-iframe)
3. Tools (build(minify, gzip, move and[js-fix]), spawn([js-fix]), iconprep(css-sprites, svg-path))

###Design Patterns###
For cleaner and less code while implementing the architecture, we employed the following design patterns:
1. Bridge + Observer Pattern (event co-op between views, modules or through modules)
2. Decorator Pattern (overridden and enhancements)
3. Command Pattern (passing callbacks around)
4. Chain of Resp (Promises)
5. Composite Pattern (by Marionette's Layout/Collection Views)
6. Factory Pattern (Context/Parts registry and context's sub-module forger)

Server
------
see separate .md file.


The Client
==========
1. Libraries
2. Overridden & Enhancements
3. Application
4. Tools

Libraries
---------
see `app\libs\bower.json` and `app\libs\buildify.js` for the js libs listing.

As you can see, only the finest libraries are included, they are all actively maintained and have easy-to-read documentations. This is a key criteria when selecting js libs for your project. They *MUST* be well tested and documented, and they *MUST* be clean and generalized enough to solve your problem at hand. Avoid trying to adapt to tricky and weired solutions will save you significant amount of energy and time for developing your own. Resist the temptation to use other people's solution first, carefully examine the solution and options they provide before accepting them. In other words, if you are going to write the same lines of code to build the *same* thing, by all means use an existing one, if not, write your own and generalize it later if you do think it can solve other people's problem as well.

Enhancement(to Libs)
-----------

Application
-----------
###APIs(Data)
###Contexts
###Parts(Editors, Widgets)
###Utils
###Main

Tools
-----
see separate .md file.


The Server
==========
see separate .md file.


References
==========

Books
-----
1. JavaScript: The Good Parts - Douglas Crockford
2. Pro JavaScript Design Patterns - Ross Harmes and Dustin Diaz
3. The Tangled Web - Michal Zalewski
4. High Performance Web Sites: Essential Knowledge for Front-End Engineers - Steve Souders

Websites
--------
1. Javascript Style Guide & Stuff[https://github.com/airbnb/javascript] - airbnb@github.com
2. Superhero.js[http://superherojs.com/] - Kim Joar Bekkelund, Mads Mobæk, & Olav Bjorkoy