Pro.js
======
*An infrastructure for building modern web application with many contexts.* [@Tim Liu](mailto:zhiyuanliu@fortinet.com)


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

####Define the problem
Before start, you need to understand what is a *GUI application*, here is a brief diagram (casted upon the web realm):

<img src="/static/resource/default/diagram/Diagram-1.png" alt="Web App Diagram" class="center-block"></img>

Note that you need to resolve 2 kinds of problem different in nature: *Interaction* and *Data Flow* in order to produce an application.
A successful one requires both parts to include careful design and feasible technique. We will examine the first part here.

**Pro.js** answers challenges from the *Interaction* problem domain (A.K.A UI/UX):

<img src="/static/resource/default/diagram/Diagram-2.png" alt="UI/UX Problems" class="center-block"></img>

As you can see from the above diagram, there are 3 problems here to address when implementing a UI/UX side for an application:
1. Data <i class="fa fa-arrows-h"></i> Model/Collection [snapshot]
2. Model/Collection [snapshot] <i class="fa fa-arrows-h"></i> View (UI)
3. View <i class="fa fa-arrows-h"></i> Layout/Page + Transitions (UX)

####Solution architecture
As a full stack solution to the UI/UX side, we address these 3 problems with an intuitive architecture:

<img src="/static/resource/default/diagram/Diagram-3.png" alt="Pro.js Architecture" class="center-block"></img>

To focus, think of your application in terms of *Context*s and *Regional*s. Use *Model*/*Collection* wisely, try not to involve them before relating to any *View*. That is to say, fetch/persist data through a unified *Data API* (CRUD or Restful). Unless you want a dynamic *View*, do **NOT** use *Model*/*Collection* to store and operate on the data. Focus on UI/UX and make the data interfacing with server as thin as possible.

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
and include it in `/implementation/index.html` below the `<!--main.js-->` comment line:

```
<script src="js/all.min.js"></script>
...  
<!--main.js-->
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

You will start real development by adding *region*s to your application template and define *Context*s and *Regional*s. Let's examine a standard list of development steps in the following section.

###Development steps
* Setup
* Context
* Regional
* Views
* app:meta-event

###Unified API entry point
* app.create('Context')
* app.create('Regional')
* app.create() - shortcut to Marionette Views
* app.create('Widget/Editor')
* app.create('API/Model/Collection')?
* app.create('Validator')

###View Class+
* actions
* editors
* effect
* view:meta-event

###Create a new theme

####Theme Structure
* @import (inline) "../css/include/*.css" (the statically included styles)
* bootstrap.less (do **NOT** change) - includes all the original bootstrap styles
* **variables.less** - basic css override through pre-defined variables
* **theme.less** - components and components override
* mixins.less (optional)
* font.less (optional) - extra web fonts
* print.less (optional)

You should be focusing on changing the theme.less and variables.less files.

####LESS to CSS
The `main.less` loads/glues all the above files and compiles into main.css, you do not need to compile the included .less files separately and put the compiled .css back into the `main.less`. The statically inlined css files are those that we want to copy into the compiled main.css without any change.

In any .less file you can @include (to merge with, to have) other .less/.css files and you can define styles using LESS or css as well. That's why `bootstrap.less` loads other style definition files but doesn't have its own definition, it is used solely as a glue file. `variables.less` is another extreme, it only contains LESS vars to be reused in other style definition files so you can override the basic styles with ease later.

One perk of using LESS is that you can define each .less to do only one thing, e.g:
* static.less - to copy static css files;
* vars.less - to define reusable css codes into variables;
* component.less - use styles loaded/defined in static.less/vars.less to define new css styles in a nested class format;
* main.less - glue(@include) the above .less files and let the compiler compile into main.css;

####Icon Processing
If you need to have customized icons, please ask your designer for 64x64 or even 128x128 sized icon files in png format. You can use the icon preparation tool to resize and combine them into a single CSS sprite package (.css + icons.png + demo.html). 

See `/implementation/themes/README.md` for more details.

####Preview Page
There is a bootstrap components preview page at `[your theme folder]/index.html`. Change it to include more static components and use it to demo your new theme. `URL://[your host]/themes/[your theme]/`


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