This is put here to remind me how clumsy it was when it first got started... 

ProJS
=====
*An intuitive web application architecture and implementation* - by Tim(Zhiyuan).Liu

Table of Content
----------------
* Introduction
	* **NEVER** try to merge the two sides
	* Rule of Thumb
* Client
	* Why not AngularJS/EmberJS/Meteor or YUI/ExtJS
		* Moving Away From ExtJS and All-in-One Frameworks
	* Core Concepts
		* The *Big Picture*
		* What you *REALLY* need
	* Design Patterns Used
	* Project Structure
	* Quick Start
* Server
* References
* Notes

Introduction
------------
* What's a web application; (Browser/OS, Policy/Mechanism)
* Why making this architecture and implementation;
* How it simplifies development and maintenance work;
* When to use this framework and when to break off and form your own; (Types of web applications supported)
* Who will benefit from this framework;

[The following paragraphs need to be updated according to the above items]

ProJS is a *2-part* web application architecture that enables rapid development on both client and server side while reducing the pain in code implementation and later maintenance. 

The implementation makes use of modern web technology and libraries (3rd party implementations) to maximize flexibility and scalability while employing common design patterns to promote cleaner design and the *write less do more* concept. It also comes in with build tools (minify, gzip, svg-exractor, css-sprites-builder) and monitors (less auto-compile) to assist the developer (you) in the development process.

Being *2-part* means that we design our client and server architectures separately and differently to better reflect the key points from each side. The client side is more focused on interactions, transitions and feedbacks (Contexts & Views) whereas the server side is more of a layer based (pipe-lined) data serving box with less co-operation between its components (Entities & Middlewares) than the client side. This separation helps simplify the architectures on both sides and should feel more natural by the developers. 

[Warning]

###**NEVER** try to merge the two sides
The client and server sides are different in purpose fundamentally. Thus, they should be designed and implemented differently. Shutting this door will preserve a significant amount of coding/maintenance energy for the application developer(s). The best software development practice encourages separation and delaying of implementation of related components so that each part can vary independently later. And to the author (me), abstraction should happen after categorization, or say, classification. This is why we are advising the developers (you) **NOT** to make an overly encapsulated framework with tools that try to bridge the gap for the developers. Trying to control everything using central planning is a human flaw, there is no silver-bullet for trying to solve web application building in 1 piece. It will always be 3 parties in the software application world:

[Diagram 1] Human <-client/UI-> Panel <-server/Services-> Routines

As an engineer, the job is to find insights and solve problems between the 3 parties efficiently (profitably if you must insist...) so that the software/application serving the above system comes out correctly. This is hard in its nature. This is why we offer you a group of solutions combined to build this complex system.

[Software design and impl in general]

###Rules of Thumb
* Keep things simple, especially the simple ones.
* Categorization before abstraction.
* Separate, Reuse and Pipeline.
* Cleaner method signature. Options as a single object parameter.
* Events for collaborations instead of APIs. Promises for asynchronise operations instead of callbacks.

Start with user requirements/stories and focus on serving the customers' need. Use the 80/20 rule to pick out important features/functionalities and implement them first. Gradually refine code and documentation later. Remember to write down **why** before **how** in the code comments. !FOCUS!

Client
----------
The client side is made on top of Underscore, jQuery, Handlebars, Backbone, Marionette and Bootstrap. To flatten and lower the initial learning curve of adaptation, we didn't wrap things around the basic libs here, there are no wrapper APIs or Classes to learn to use the same thing from Marionette or the original Backbone.js. It is designed so in order to let the developers (you) feel more comfortable while reusing their (your) existing web development knowledge and experience.

We also maintain a list of 3rd party libraries for the developers to choose from (as utilities). The utility libs (e.g jquery-file-upload, store.js, uri.js, raphael.js, marked, moment.js...) are carefully selected from the many open-source Javascript libs out there to help with specific but generally-will-appear problems that a developer will encounter during the web application development process.

###Why not AngularJS/EmberJS/Meteor or YUI/ExtJS
If you can, **always favor libraries over frameworks**.

We choose what we choose simply because we want total control over our product. There are often 2 types of framework to choose from when developing a web application:
* Development Framework - AngularJS/EmberJS/Meteor (infrastructure only)
* Application Framework (All-in-One) - YUI/ExtJS (infrastructure plus widgets and tools)

Backbone + Marionette can implement them all (Yes, any client side framework). We believe Meteor is a good idea implemented over a very bad platform (A.K.A the WEB) for now. And, if you need more evidence, YUI3 has the exact same concepts from Backbone implemented as its infrastructure.

####Moving Away From ExtJS and All-in-One Frameworks

We have been developing in ExtJS4 for almost 2 years, starting form the last version of 4.0 which is the promising 4.0.7. As our knowledge base expands, we felt that it is time to form our own blueprint of a modern data heavy web application to shorten the development cycles. Here are some of the main reasons:

1. Although it is relatively fast to develop prototypes using an all-in-one framework like ExtJS, it is hard to maintain the code while keeping up with the changes required by the users and those that come from Sencha. The widgets are bound too tight with the framework.
2. Loading, DOM interfacing, Widget and Application containers are all provided with a biased opinion, which always lead to fightings with the framework here and there or messing around with the life-cycles defined when trying to implement application specific user requirements. 
3. Performance issues. There are often a massive amount of unnecessary DOM elements lurking in the client browser. We have very limited control over the life-cycles nor the HTML template structure of the components. Making widgets as Classes and loading like Java is really a bad idea for Javascript.
4. Theming difficulties. It is hard to theme an ExtJS application correctly given the extensively nested component structure and the lack of SASS/Compass adaptation among developers.
5. Payed solution. The commercial version of ExtJS and the tools (IDE) are expensive. This also makes the community size smaller than its full/free open source counterparts, making it difficult to find solutions from sources other than the documentation.

We choose to move away from this heavy framework to avoid its complexity (tightly bound all-in-one solution) and to have more control over the component lifecycles, interactions and application container separately. An equally powerful yet still lightweight solution combining the best practices in the field is thus made. The following sections examine the core concepts and design involved.

###Core Concepts
Since we render the UI dynamically through the user browsers instead of prepare-before-send on the server side, the traditional MVC concept applies differently in our situation here. Old web development process embraces the stateless characteristic of HTTP and promotes the url-to-page concept that was used to build JSP/PHP/RoR powered application. The *View* was (and still is) often referring to the server glue code that merge data (from *Model*) with a page template when called by the *Controller*. (*Controller* is still the url-page/route dispatcher)

Modern web development breaks this big chunk MVC and blurs the line between V and C by putting dynamic view generation (e.g using Backbone and jQuery) into the user browser. Also, if using Backbone, a separately defined M is really unnecessary when you don't even need to specify the model attributes. This makes the client side data (or say, models) a snap-shot of the state of real user data on the server, which in turn makes the need of a strict MVC implementation unnecessary. We need a more fine-grind infrastructure allowing MVC to be only applied to widget building (a small piece of view with prepared data and specific UI purposes) and stop calling the infrastructure/framework an MVC one. 

####The *Big Picture* (Problems)

[Diagram 2] Data <-remote api-> Ajax <-models/collections-> Widget(MVC) <-events co-op-> Widget/Module/Context(3 different levels of view or view groups)

As you can see from the above diagram. There are 3 distinct key parts in the system:
1. Data Synchronization (D-M)
2. Widgets (M-VC)
3. View Containers (V-V)

Failing to address any of the 3 parts above will cost the project a significant amount of refractory time. **DO NOT** skip or trying to merge them into one big abstraction. Conquer each one with a consistent API style (like parameters and naming conventions) then combine the result. A complete system is never a destination, it is only a state of being or appearance. In other words, anytime you want your solution appear to be *a complete one*, focus on identifying the key problems and then solve them. **DO NOT** set your goal to be *a complete system* when start.

So, we have identified the core problems, how do we form our solutions to them?

####What you *REALLY* need (Solution Design)
1. Components:
	* Data APIs Registry (remote data interfacing) - D-M
	* Parts (editor, widget for making views in a layout) - M-VC
	* Contexts (layout with nested layouts as sub-modules) - V-V
2. Application Container:
	* Navigation (context switch + context's sub module routing)
	* Utils (theme-rolling, user-session, i18n, messaging, prompts, downloader-by-iframe, templates registry)
3. Tools [optional]:
	* Build (minify, gzip, move and [js-fix])
	* Icon preparation (css-sprites, svg-path)
	* CSS monitor (less compiler)

[Diagram 3]

###Design Patterns Used
For cleaner and less code while implementing the architecture, we employed the following design patterns:

1. Bridge + Observer Pattern (event co-op between widgets, modules and contexts or with the application container)
2. Decorator Pattern (overridden and enhancements)
3. Command Pattern (passing callbacks + data as options around)
4. Chain of Resp (Promises)
5. Composite Pattern (by Marionette's Layout/Collection Views)
6. Factory Pattern (Context/Parts registry and context's sub-module create())

The goal is to achieve the following goals encouraged by software design patterns:

[Diagram 4] - Design Pattern Goals (To Separate/Decouple, To Reuse/Regroup, To Pipeline)

We will be examining the implementations in the following section.

###Project Structure
see separate.md file.


###Quick Start
see separate.md file.


Server
----------
see separate .md file.


References
----------

###Books
1. JavaScript: The Good Parts - Douglas Crockford
2. Pro JavaScript Design Patterns - Ross Harmes and Dustin Diaz
3. The Tangled Web - Michal Zalewski
4. High Performance Web Sites: Essential Knowledge for Front-End Engineers - Steve Souders

###Websites
1. [Javascript Style Guide & Stuff](https://github.com/airbnb/javascript) - airbnb@github.com
2. [Superhero.js](http://superherojs.com/) - Kim Joar Bekkelund, Mads Mobæk, & Olav Bjorkoy
3. [Interview Qs](https://github.com/darcyclarke/Front-end-Developer-Interview-Questions) - darcyclarke@github.com


Notes
-----
###App Building Options
1. HTML5, JS, CSS3 - Ubuntu OS, Firefox OS or with [node-webkit](https://github.com/rogerwang/node-webkit) (Win, MacOS, Linux)
2. C++ with Boost & Qt(+QML) - Ubuntu OS and General (Win, MacOS/iOS, Linux/Andorid)
3. Object-C & Java - iOS and Android
