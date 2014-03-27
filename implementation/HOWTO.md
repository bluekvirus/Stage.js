Pro.js <sub class="text-muted" style="font-size:36%">based on Marionette.js</sub>
======
*An infrastructure for building modern web application with many contexts.*
[@Tim Liu](mailto:zhiyuanliu@fortinet.com)


Current version
---------------
**@1.0.0-rc2**
([Why is it version-ed like this?](http://semver.org/))


Mental preparation
------------------
Technique means nothing if people have no purposes in their mind. To prepare mentally to adapt something is to synchronize the mind around the subject domain so you can develop insights while applying the technique. The ultimate goal is always to understand the subject (in our case the problem) better.

Make sure to ask enough questions, so you can quickly locate the core problem that a given technique is trying to solve efficiently. Soon enough, you will start to see things like the solution inventor, and you will have a high chance of becoming one yourself later. True understanding is almost always developed this way.

If you can not agree with the author after reading this preparation chapter, do not bother with this framework.

###Define the problem
Before start, you need to understand what is a *GUI application*, here is a brief diagram (casted upon the web realm):

<img src="/static/resource/default/diagram/Diagram-1.png" alt="Web App Diagram" class="center-block"></img>

You need to resolve 2 kinds of problem different in nature: *Interaction* and *Data Flow* in order to produce an application.
A successful one requires both parts to employ careful design and feasible technique. We examine the first problem here:

<img src="/static/resource/default/diagram/Diagram-2.png" alt="UI/UX Problems" class="center-block"></img>

As you can see from the above diagram, there are 3 problems here to address when implementing a UI/UX side for an application:
1. Data <i class="fa fa-arrows-h"></i> Model/Collection [snapshot]
2. Model/Collection [snapshot] <i class="fa fa-arrows-h"></i> View (UI)
3. View <i class="fa fa-arrows-h"></i> Layout/Page + Transitions (UX)

###Solution architecture
As a full stack solution to the UI/UX side, we address those 3 problems with an intuitive architecture:

<img src="/static/resource/default/diagram/Diagram-3.png" alt="Pro.js Architecture" class="center-block"></img>

####What's Navigation?

We achieve client-side multi-page-alike navigation through switching *Context*s on a pre-defined application region by responding to the URL fragment change event. (e.g #navigate/Context/...)

####What's a Context?
A *Context* is a *Marionette.Layout* wrapped inside a *Marionette* module, you can just think of it as a *Layout*. *Context*s only appear on the application's context region (each application can have only 1 such region). If you have more than 1 *Context*s defined, they will automatically swap on the context region in response to the navigation event. You will not have more than 1 active *Context* at any given time.

####What's a Regional?
A *Regional* is a *Marionette.View* with name, it is to be shown on a region in template of your application or any *Marionette.Layout* instance. As you can see, since a *Context* is a *Layout* with extra functions, *Regional*s will be used closely with it. You will read about why a *Regional* needs a name in the **Quick steps** section.

####Remote data handling?
Modern web application generates views according to user data dynamically. This is why we picked *Backbone/Marionette* as our implementation base -- to use data-centered views. Plus, there is no doubt about wiring in remote data into your application through *Ajax* now. However, the way we handle remote data in our framework is a bit different than the original design in *Backbone*.

We introduce a unified *DATA API* for handling all the in/out of remote server data, skipping the *Model/Collection* centered way of data manipulation. *Model/Collection* are only used as dumb data snapshot object on the client side to support views. The goal is to make the data interfacing layer *as thin as possible* on the client side. You will find more details in the **Quick steps** section.

####Reuse view definitions?
As *Design Patterns* dictates, we need to code in a way to:

<img src="/static/resource/default/diagram/Diagram-4.png" alt="Design Pattern Goals" class="center-block"></img>

For *Regional*s (or any *Marionette.View*) that you need to use again and again but with different configuration (e.g a Datagrid). Register it as a *Widget* or, in case of a basic input, an *Editor*. These reusable view definitions are call *Reusable*s in the framework. Think in terms of the **List and Container** technique as much as possible when creating them.

####Seems complicated...
To focus, think of your application in terms of *Context*s and *Regional*s. Like drawing a series of pictures, each page is a *Context* and you lay things out by sketching out regions first on each page then refined the details (*Regional*) within each region. 

Use *Model*/*Collection* wisely, try not to involve them before relating to any *Marionette.View*. That is to say, fetch/persist data through a unified *Data API* (CRUD or Restful). Unless you want a dynamic view, do **NOT** use *Model*/*Collection* to store and operate on the data. Focus on UI/UX and make the data interfacing with server as thin as possible.


Getting started
-----------
You are assumed to have programed with:

* Marionette.js 
<small class="text-muted">(Layout, Collection/CompositeView, ItemView)</small>
* Handlebars.js 
<small class="text-muted">(as template engine)</small>

and this indicates:

* jQuery or Zepto 
<small class="text-muted">(DOM manipulation through CSS selectors)</small>
* Underscore.js or Lo-Dash 
<small class="text-muted">(handy js functions)</small>
* Backbone.js 
<small class="text-muted">(Model/Collection, View, Event, Router)</small>

If you don't know what they are, go for a quick look at their websites. (links are provided under the *Included Libraries* area on the left sidebar)

###What's in the package

####Project structure
> * /design
>   * /assets
>   * /docs
> * /implementation -- your web root
>   * /js
>   * /themes
>   * /static
>   * index.html
> * /tools
>   * /build -- minify and concatenate your js files by scanning index.html
>   * /iconprep -- build icons into big css sprite


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

###Quick steps
Here is the recommended **workflow**. You should follow the steps each time you want to start a new project with *Pro.js*. We assume that you have downloaded the *Pro.js* client package now and extracted to your project folder of choice.

Remember, creating a web application is like drawing a picture. Start by laying things out and gradually refine the details. In our case, always start by defining application regions and the *Context*s.

####Step 1. Initialize
Go to your `main.js` and setup the application by using `Application.setup()`:
``` 
//main.js
Application.setup({
    theme: 'your theme name',
    fullScreen: false | true,
    template: '#id' or ['<div>...</div>', '<div>...</div>'] or '<div>...</div>'
    contextRegion: 'your context region marked in template',
    defaultContext: 'your default context shown upon dom-ready',
    baseAjaxURI: 'your base url for using app.remote()'
}).run();
```
Each setup configure variable has its own default value, you can safely skip configuring them here, however, there is one you might want to change now -- `template`.

Since your goal is to build a *multi-context* application, you need more *regions* in the application template:
```
//main.js
Application.setup({
    ...
    template: [
        '<div region="banner" view="Banner"></div>',
        '<div region="body"></div>',
        '<div region="footer"></div>'
    ],
    contextRegion: 'body',
    ...
}).run();
```
By using `region=""` attribute in any html tag, we marked pre-defined regions in the template, you can do this with any *Marionette.Layout* in our framework. They are already enhanced to pickup the attribute.

Note that you can also use `view=""` attribute to load up a named *Regional* view in a given region, only tags marked with `region=""` first will continue to verify if there is an assigned *Regional* view through the `view=""` attribute.

Now, given that you've changed the template, you need to also change `contextRegion` to point to the area that you use to swap between different *Context*s.

If your application is a single-page application, you probably don't need more than one *Context*, in such a case, you don't need to change the application template. There will always be a region that wraps the whole application -- the *app* region. The **Default** *Context* will automatically show on region *app* with the default application setup.

Now we've marked our context region and some regional views to show, let's proceed to define them in the following sections.

####Step 2. Define Contexts
* app.create('Context') - name, region="", view="", onNavigateTo

####Step 3. Define Regionals
* app.create('Regional') - name, region="", view=""

####Step 4. Handle data
* app.create('Model/Collection')
* app.remote(options)

####Step 5. Add interactions
#####Views+
* effect
* actions (and ui-locks)
* editors
* app.create('Validator')
* app.create() - shortcut to Marionette Views

#####Meta events
* app:meta-event
* context:meta-event (navigate-to)
* view:meta-event (load-data)
* region:load-view

####Step 6. Make Reusables
* app.create('Widget/Editor') - both instantiation and factory


###Create a new theme

####Theme structure
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

####Icons
If you can, always use bootstrap & font-awesome icon fonts included in the package.

If you need to have customized icons, please ask your designer for 64x64 or even 128x128 sized icon files in png format. You can use the icon preparation tool to resize and combine them into a single CSS sprite package (.css + icons.png + demo.html). Note that background image can **NOT** be combined into the CSS sprite. 

See `/implementation/themes/README.md` for more details.

####Preview page
There is a bootstrap components preview page at `[your theme folder]/index.html`. Change it to include more static components and use it to demo your new theme. `URL://[your host]/themes/[your theme]/`


Include other js libs
---------------------
The default `all.js` contains carefully (minimum) selected libs for your project, if you would like to introduce more, use [bower](http://bower.io/) and the `bower.json` file included.
Go into `/implementation/js/libs/tracked` and run `bower install` to grab all the monitored 3rd-party libraries.

Include your libs after `all.js` (or `all.min.js`) in `/implementation/index.html`.

**Tip:** 

Alternatively, you can always use a *CDN* (Content Delivery Network) to load the js libraries into your index.html (e.g [jsDelivr](http://www.jsdelivr.com/)) However, this will affect the build process since these libs will not be combined if they are not from local.


What should I put in `/static`?
-----------------
* `/resource` should contain static resources per locale. (xx_XX folder, `/default` for locale independent)
* `/web+` now contains template 404/500 pages and robot.txt if you need them, they should be put under your web root once the development is done.


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