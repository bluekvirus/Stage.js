Pro.js
======
*An infrastructure for building modern web application with many contexts.*


Current Version
---------------
**@1.0.0-rc1**


Quick Start
-----------
You are assumed to have programed with:

* Marionette.js
* Handlebars.js

and this indicates:

* jQuery or Zepto
* Underscore.js or Lo-Dash
* Backbone.js

If you don't know what they are, go for a quick look at their websites.

###Mental preparation
Before start, you need to understand what is a web application, here is a brief diagram:

<img src="/static/resource/default/diagram/Diagram_1.png" alt="Web App Diagram" class="img-thumbnail center-block"></img>

Note that you need to resolve 2 kinds of problem different in nature: *Interaction* and *Data Flow* in order to produce a web application.
A successful one requires both parts to include careful design and feasible technique. We will examine the first part here.

**Pro.js** will answer challenges from the *Interaction* problem domain (A.K.A UI/UX):

<img src="/static/resource/default/diagram/Diagram_2.png" alt="UI/UX Problems" class="img-thumbnail center-block"></img>

As you can see from the above, there are 3 problems here to address when implementing a UI/UX side for an application:
1. Data -> Model/Collection [snapshot]
2. Model/Collection [snapshot] -> View (UI)
3. View -> Layout/Page + Transitions (UX)

As a full stack solution to the UI/UX side, we address the 3 problems with an intuitive architecture:

<img src="/static/resource/default/diagram/Diagram_3.png" alt="Pro.js Architecture" class="img-thumbnail center-block"></img>

###What's in the package

####Project structure
> * /design
>	* /assets
>	* /docs
> * /implementation -- your web root
>	* /js
>	* /themes
>	* index.html
> * /tools
>	* /build -- minify and concatenate your js files by scanning index.html


####Let's start
You start developing by creating a `main.js` (you are free to choose whatever the name you like) 
and include it in `/implementation/index.html` below the `<!--Main.js-->` comment line:

```
<script src="js/all.min.js"></script>
...  
<!--Main.js-->
<script type="text/javascript" src="js/main.js"></script>
...
```
**Note:** You can swap `all.min.js` with `all.js` in `/implementation/index.html` to have better debug information during development.

Minimum `main.js` script looks like this:
```
//main.js
Application.setup().run();
```
You should now see a *blank* page without javascript error.
If you are really in a hurry to see some stuff on the page, setup your application in `main.js` like this:
```
//main.js
Application.setup({
	template: [
		'<div>',
			'<h1>Hello World</h1>',
			//put some html here as strings
		'</div>'
	]
}).run();
```

###Development steps

###Unified API entry point

###Create a new theme



Include other js libs
---------------------
The default `all.js` contains carefully (minimum) selected libs for your project, if you would like to introduce more, use `bower` and the `bower.json` file included.
Go into `/implementation/js/libs/tracked` and run `bower install` to grab all the monitored 3rd-party libraries.

Include your libs after `all.js` (or `all.min.js`) in `/implementation/index.html`.


What's in `/web+`?
-----------------
It contains template 404/500 pages and robot.txt if you need them.


Build for production use
------------------------
Before building your app for deployment, go into `/tools` and run `npm install` to grab all necessary 3rd-party Node.js modules.
Use `/tools/build/node build.js dist` to build. (You might need to change the `config.dist.js` file if you want to include more files in deployment).


Upgrade/Update
--------------
Download and replace `/implementation/js/all.js` to update the infrastructure;
Use `bower update` to update other monitored libs you need under `/implementation/js/libs/tracked/`;


Appendix
--------
###A. Philosophy behind
see PHILOSOPHY.md

###B. Change log
see CHANGELOG.md