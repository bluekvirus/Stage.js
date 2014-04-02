Pro.js <sub class="text-muted" style="font-size:36%">based on Marionette.js</sub>
======
*An infrastructure for building modern web application with many contexts.*
[@Tim Liu](mailto:zhiyuanliu@fortinet.com)


Current version
---------------
**@1.0.0-rc2**
([Why is it version-ed like this?](http://semver.org/))


Introduction
------------
The framework is made on top of **Backbone.Marionette** and **Bootstrap**. To flatten and lower the initial learning curve of adaptation, we restrict ourselves to only the following APIs:

* Application.setup(options)
* Application.run()
* Application.create(type, options)
* Application.create(options)
* Application.remote(options)

You will use `create()` most of the time for creating application elements (*Context*s and *Regional*s). It is designed so in order to let the developers feel more comfortable picking up the workflow while reusing their existing web development knowledge and experience with the base libraries.

We also maintain a list of 3rd party libraries for the developers to choose from in addition to the base libraries (as utilities). The utility libs (e.g jquery-file-upload, store.js, uri.js, raphael.js, marked, moment.js, socket.io.js...) are carefully selected from the many open-source Javascript libs out there to help with specific but generally-will-appear problems that a developer will encounter during the web application development process. (see more in the *Include other js libs* chapter)

###Moving away from all-in-ones
We have been developing in ExtJS4 for 2+ years, starting form the last version of 4.0 which is the promising 4.0.7. As our knowledge base expands, we felt that it is time to form our own blueprint of a modern data heavy web application to shorten the development cycles. Here are some of the main reasons:

1. Although it is relatively fast to develop prototypes using an all-in-one framework like ExtJS, it is hard to maintain the code while keeping up with the changes required by the users and those that come from Sencha. The widgets are bound too tight with the framework.
2. Loading, DOM interfacing, Widget and Application containers are all provided with a biased opinion, which always lead to fightings with the framework here and there or messing around with the life-cycles defined when trying to implement application specific user requirements. 
3. Performance issues. There are often a massive amount of unnecessary DOM elements lurking in the client browser. We have very limited control over the life-cycles nor the HTML template structure of the components. Making widgets as Classes and loading like Java is really a bad idea for Javascript.
4. Theming difficulties. It is hard to theme an ExtJS application correctly given the extensively nested component structure and the lack of SASS/Compass adaptation among developers.
5. Payed solution. The commercial version of ExtJS and the tools (IDE) are expensive. This also makes the community size smaller than its full/free open source counterparts, making it difficult to find solutions from sources other than the documentation.

We choose to move away from this heavy framework to avoid its complexity (tightly bound all-in-one solution) and to have more control over the component lifecycles, interactions and application container separately. An equally powerful yet still lightweight solution combining the best practices in the field is thus made. 

###Why not using...
Why not using AngularJS/EmberJS/Meteor or YUI/ExtJS? Yes you can, but, if you can, **always favor libraries over frameworks**. Given that *Pro.js* is also a framework. The advise here should be extended to: 
> If you can *NOT* agree with the workflow/abstraction, always favor libraries over frameworks.

We choose what we choose when designing this framework simply because we want total control over our product. There are often 2 types of framework to choose from when developing a web application:
* Development Framework - AngularJS/EmberJS/Meteor (infrastructure only)
* Application Framework (All-in-One) - YUI/ExtJS (infrastructure plus widgets and tools)

**The Backbone library can implement them all** (Yes, any client side framework). (Not 100% for Meteor though, since Meteor combines its server into a full-stack solution. You need nodejs in the picture for that). And, if you need more evidence, YUI3 has the exact same concepts in Backbone implemented as its infrastructure. 

In order to accomplish more with lesser code using Backbone, we picked Backbone.Marionette as our pattern library. It offers cleanup/boilerplate routines and very neat concepts for building large Javascript front-end projects. The resulting framework accomplishes all the big frameworks have promised but with **a thiner and flattener structure**. We believe scripting languages are always going to be the perfect thin glue layer between mechanisms and policies. The Javascript language were picked to glue HTML/CSS and UX but nothing more, it should not be overdosed and mimic Java.


Mental preparation
------------------
Technique means nothing if people have no purposes in their mind. To prepare mentally to adapt something is to synchronize the mind around the subject domain so you can develop insights while applying the technique. The ultimate goal is always to understand the subject (in our case the problem) better.

Make sure to ask enough questions, so you can quickly locate the core problem that a given technique is trying to solve efficiently. Soon enough, you will start to see things like the solution builder, and you will have a high chance of becoming one yourself later. True understanding is almost always developed this way.

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

####Glue through events
We encourage event programming in this framework. We glue views into a functioning whole by using meta-events. Whenever an interaction or transiting happens (e.g navigation, context-swap, login, error, data-ready...), intead of calling the actual *doer*s, fire/trigger an event first, so that later the actual behavior triggered by this event can be changed without affecting the glue/interfacing logic. Read carefully through the **Meta-events** subsection below so you understand how to implement and extend application behaviors. 

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
You should now see a *blank* page without Javascript error.

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

Remember, creating a web application is like drawing a picture. Start by laying things out and gradually refine the details. In our case, always start by defining application template with regions and the *Context*s.

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
```javascript
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
By using `region=""` attribute in any html tag, we marked pre-defined regions in the template, **you can also do this with any *Marionette.Layout*** in our framework. They are already enhanced to pickup the attribute.

Note that **you can use an additional `view=""` attribute to load up a named *Regional* view in a given region**, only tags marked with `region=""` first will continue to verify if there is an assigned *Regional* view through the `view=""` attribute.

Now, given that you've changed the template, you need to also change `contextRegion` to point to the area that you use to swap between different *Context*s.

If your application is a single-page application, you probably don't need more than one *Context*, in such a case, you don't need to change the application template. There will always be a region that wraps the whole application -- the *app* region. The **Default** *Context* will automatically show on region *app* with the default application setup.

Now we've marked our context region and some regional views to show, let's proceed to define them through our powerful *Unified APIs* `Application.create()` and `Application.remote()` in the following sections.

####Step 2. Define Contexts
Create a new file named `myContextA.js`, remember a *Context* is just a *Marionette app module* wrapped around a *Marionette.Layout* definition. We've taken care of the wrapping process, all you need to do is give the definition a name and the ordinary *Marionette.Layout* options:
```
//myContextA.js
(function(app) {
    app.create('Context', {
        name: 'MyContextA', //omitting the name indicates context:Default
        template: '...',
        //..., normal Marionette.Layout options
        onNavigateTo: function(subpath) {
            //...
        }
    });
})(Application);
```
You can still use the `region=""` and `view=""` attributes in the template. 

Note that you should name your *Context* as if it is a *Class*. **The name is important as it links the *Context* with the global navigation mechanism**. 

The `onNavigateTo` method denotes the `context:navigate-to` event listener. This event will get triggered if the application switched to `MyContextA` on the context region, so that you can do some *in-context* navigation followed by. (e.g if the navigation is at `#navigate/MyContextA/SubViewA...`)

Now, with a *Context* defined, you will need *Regional*s to populate its regions.

####Step 3. Define Regionals
Before creating a *Regional*, change your `myContextA.js` into `/context-a/index.js` so you can start adding regional definitions into the context folder as separate code files. Always maintain a clear code hierarchy through file structures. (You don't need to if you can be sure that the `myContextA.js` file will not exceed 400 lines with all the *Regional* code added.)

Create `/context-a/myRegionalA.js` like this:
```
//myRegionalA.js
(function(app) {
    app.create('Regional', {
        name: 'MyRegionalA', //omitting the name gets you an instance of this definition.
        type: 'CollectionView', //omitting this indicates 'Layout'
        template: '...',
        //..., normal Marionette.xView options
    });
})(Application);
```
You can still use the `region=""` and `view=""` attributes in the template.

Note that you should name your *Regional* as if it is a *Class*. **The name is important if you want to use the auto-regional-loading mechanism through the `view=""` attribute in any *Marionette.Layout***. 

By default, any *Regional* you define will be a *Marionette.Layout*, you can change this through the `type` option.

By default, `Application.create('Regional', {...})` returns the **definition** of the view, if you want to use the returned view **anonymously**, remove the `name` option. You will get a **instance** of the view definition to `show()` on a region right away. 

Sometimes your *Regional* is comprised of other sub-regional views and that's fine, you can nest *Regional*s with the `region=""` and `view=""` attributes in the template. There will also be time when you just need plain *Marionette.xView* definitions without naming them to be *Regional*s. You can do it like this:
```
Application.create({
    type: '...', //ItemView, Layout, CollectionView or CompositeView
    ..., //rest of normal Marionette.xView options
});
```
Unlike the *anonymous* call to `Application.create('Regional', {...})`, the above call returns a **definition** of the view.

Now, we've sketched the layout of our application, you might want more contexts defined before continue but that's the easy part, just repeat Step 1-2 till you are ready to proceed to stream in remote data to light-up the views.

####Step 4. Handle data
Though we do not agree with *Backbone*'s way of loading and persisting data through *Model/Collection*s. We do agree that **data** should be the central part of every computer program. In our case, the remote data from server are still used to power the dynamic views we've just defined. We use *Backbone.Model/Collection* only when there is a *View*. In other words, *data* and *View*s are centric in our framework paradigm, *Model/Collection*s are not. Try to think of them as a integrated part of *View*s. 

Having said that, you can still create *Backbone.Model/Collection* through our *Unified API* `Application.create()` like this:
```
Application.create('Model/Collection', {options})
```
The options passed will be the normal *Backbone.Model/Collection* ones.

Our recommended way of loading/persisting remote data is through:
```
//returns the $.ajax() object - jqXHR for using promises.
Application.remote('...' or {
    entity: '',//entity name of resource
    params/querys: {...},
    _id: '',
    _method: '',
    payload: {...},
    ..., //normal $.ajax options without (type, data, processData, contentType)
});
```
This method will intelligently guess which of the four HTTP method to use for each request according to the options passed. Here is some examples:
```
//GET: /abc
Application.remote('/abc');

//GET: /abc?x=1&y=2
Application.remote({
    url: '/abc',
    params/querys: {
        x: 1,
        y: 2
    }
});

//GET: /user/1/details
Application.remote({
    entity: 'user',
    _id: 1,
    _method: 'details'
});

//POST: /user
Application.remote({
    entity: 'user',
    payload: {...} //without _id
});

//PUT: /user/1
Application.remote({
    entity: 'user',
    payload: { _id: 1, ...} //non-empty + _id
});

//DELETE: /user/1
Application.remote({
    entity: 'user',
    payload: { _id: 1 } //just _id
});

```
It is recommended to handle the callbacks through promises on the returned jqXHR object:
```
Application.remote(...)
    .done(function(){...})
    .fail(function(){...})
    .always(...);
```
You can now render through remote data in a *Regional* like this:
```
//myRegionalA.js
(function(app) {
    app.create('Regional', {
        name: 'MyRegionalA',
        template: '...',
        onShow: function(){
            //load data and render through it:
            var that = this;
            app.remote({...}).done(function(data){
                that.trigger('view:render-data', data);
            });
        }
    });
})(Application);
```
Note that we've used a meta-event programming concept here through `view:render-data` to eliminate the need of handling data through *Model/Collection*. the next section will contain detailed explanation on this subject.


####Step 5. Adding UI/UX
UI is a set of interface elements for the user to click/interact through to perform desired tasks. Without these click-ables, your web application will just be a static page. UX stands for user experience, it is not just about look'n'feel but also transitions/animations that links between interactions. UI/UX are hard to design, without a clear think-through over the purposes and targeted user tasks, it can be a total chaos... Make sure you have had your plan/sketch test-driven by targeted audience/friends or colleagues before implementation.

To implement your design is, however, very easy. We have enhanced *Marionette.View* thus its sub-classes (*ItemView, Layout, CollectionView and CompositeView*) with opt-in abilities, you can use them while adding user interactions and view transitions to the application.

Though you can add any transition to any view, it is recommended to add interactions only to *Regional*s or *Marionette.Layout* in general so the event delegation can be efficient.

#####Effect
Any *Marionette.View* can have an `effect` configure to control the effect through which it will shown on a region:
```
//myRegionalA.js or any Marionette.xView
(function(app) {
    app.create('Regional', {
        name: 'MyRegionalA',
        ...,
        effect: 'string' or
        {
            name: ..., //name of the effect in jQueryUI.Effect
            options: ..., //effect specific options
            duration: ...
        },
        ...
    });
})(Application);
```
Pass just an effect name as a string to the configure if you don't need more tweak on the effect. For more information regarding the effect options, please go to [jQuery.Effect](http://jqueryui.com/effect/).

#####Actions
Actions are click-ables marked by `action=""` attribute in your view template. The original way of registering events and listeners introduced by *Backbone.View* are flexible but tedious and repetitive. We offer you *Action Tags* instead to speed things up when implementing user interactions. 

Any *Marionette.View* can have its actions configure block activated like this (3 easy steps):
```
//myRegionalA.js or any Marionette.xView
(function(app) {
    app.create('Regional', {
        name: 'MyRegionalA',
        ...,
        template: [
            '<div>',
                '<span class="btn" action="opA">Do it!</span>', //1. mark action tag(s).
                ...,
            '</div>',
        ],
        ...,
        initialize: function(){
            this.enableActions(); //2. activate actions block.
        },
        ...,
        actions: { //3. implement the action listeners.
            'opA': function($triggerTag, e){...},
            'opB': ...
        }
    });
})(Application);
```
Note that `enableActions()` is recommended to be called within the `initialize()` function introduced by *Marionette*.

Use `enableActions(true)` if you want the click event to **propagate** to the parent view/container. `e.preventDefault()` needs to be specified in the action listeners if you don't want a clicking on `<a href="#xyz" action="another"></a>` tag to affect the navigation.

#####Inputs
We have already prepared the basic html editors for you in the framework. You don't have to code `<input>, <select> or <textarea>` in any of your view template. Instead, you can activate them in any *Marionette.xView* like this:
```
Application.create({
    //It is recommended to do it in the onShow() event listener
    onShow: function(){
        this.activateEditors({
            editors: { //editors per fieldname
                abc: {
                    type: 'text', //other types are available as well.
                    label: 'Abc',
                    help: 'This is abc',
                    tooltip: 'Hey Abc here!',
                    placeholder: 'abc...',
                    value: 'default',
                    validate: { //validators are executed in sequence:
                        required: { //named validator
                            msg: 'Hey input something!', //options
                            ...,
                        },
                        fn: function(val, parentCt){ //anonymous validator
                            if(!_.string.startsWith(val, 'A')) return 'You must start with an A';
                        }
                    }

                },
                ..., //other editor configures
            }
        });
    }
});
```
The `activateEditors()` method accepts:
```
this.activateEditors({
    global: {...}, //globally shared editor configure (e.g layout, appendTo or parentCt...),
    triggerOnShow: false | true, //whether to trigger 'show' on an editor after appending.
    editors: {...} //individual editor configure by fieldname
});
```

A little bit more about the basic options: 
* appendTo - in case you don't have `editor=""` in your template
* parentCt - in case you want to delegate editor events to a parent container object (e.g a view object called form).
* type - text, password, url, email, checkbox(s), radios, file, hidden, ro, textarea, select
* label
* help
* tooltip
* placeholder
* value
* validate - (custom function or list of validators and rules)

A custom validate function can be configured like this:
```
...
validate: function(val, parentCt){
    if(val !== '123') return 'You must enter 123';
},
...
```
**The validate function or validators should return undefined or 'error string' for passed and rejected respectively**

You can always register more named validators by:
```
Application.create('Validator', {
    name: '...',
    fn: function(options, val, parentCt){...},
});
```

Additional advanced options
* layout 
 - label - css class (e.g col-sm-2)
 - field - css class (e.g col-sm-10)
* html: - indicating read-only text field (setting this will cause 'type' to be 'ro')
* options: (radios/selects/checkboxes only)
    * inline: true|false 
    * data: [] or {group:[], group2:[]} - (groups are for select only)
    * labelField
    * valueField
* multiple - true|false (select only)
* rows - number (textarea only) 
* boxLabel: (single checkbox label other than field label.)
* checked: '...' - (checked value, single checkbox only)
* unchecked: '...' - (unchecked value, single checkbox only)
* upload: (file only)
    * url - a string or function that gives a url string as where to upload the file to.
    * cb (this, result, textStatus, jqXHR) - the upload callback if successful.

Remember, you can always layout your editors in a *Marionette.xView* through the `editor=""` attribute in the template: 
```
template: [
    '<div editor="abc"></div>', //use fieldname to identify editor
    '<div editor="efg"></div>'
]
```
Don't forget to call `this.enableEditors()` during `onShow()` or the attributes will not have any effect to the view. You will also get the following apis attached to the **view** instance object:
```
this.getVal(name);
this.getValues();
this.setVal(name, val, loud); //set loud to true if you want to fire change event on the editor.
this.setValues(vals, loud);
this.validate(true|false); //true for showing the validation errors.
this.status(status, messages); //for highlighting status per editor. no arguments means to clear.
```

#####Graphs
We support graphs through SVG. A basic SVG library is integrated with the framework (Raphaël.js). You can use it in any *Marionette.xView* through:
```
Application.create({
    onShow: function(){
        this.enableSVG(function(){
            this.paper... //do your svg drawing
        });
    }
});
//or synced version:
Application.create({
    onShow: function(){
        this.enableSVG();
        this.paper... //do your svg drawing
    }
});
```
Don't worry about container resizing, it is automatically taken cared for you. 

#####Meta-events
Some interactions demand collaboration between view objects, this is why we introduce the concept of meta-event programming. It is like coding through just interfaces in a object-oriented programming language but much more flexible. The goal is to let the developer code with events instead of APIs so the implementation can be delayed as much as possible. The underlying principle is very simple:
```
//event format : namespace:worda-wordb-...
object.trigger('object:meta-event', arguments);
//will invoke listener : onWordaWordb...
object.onMetaEvent(arguments);
```
We have `Application`, `Context` and all the `Marionette.xView` enhanced to accept meta-event triggers. Some of the events are already listened/triggered for you:
* Application -- app:meta-event
```
app:navigate (contextName, moduleName) - Application.onNavigate [pre-defined]
app:context-switched (contextName)  - [empty stub] - triggered after app:navigate
//the followings are triggered by Application.remote():
app:ajax - Application.onAjax [pre-defined]
app:success - [empty stub]
app:error - [empty stub]
app:ajax-start - Application.onAjaxStart [pre-defined]
app:ajax-stop - Application.onAjaxStop [pre-defined]
```
* Context -- context:meta-event
```
context:navigate-to (moduleName) - [empty stub] - triggered after app:navigate
```
* Marionette.xView -- view:meta-event
```
view:render-data (data, forceReRender) - onRenderData [pre-defined]
```

Remember, you can always trigger a customized event `my-event-xyz` and implement it later on the object by creating `onMyEventXyz()`.

Though you can not yet use meta-event on Marionette.Regions, there is one convenient event for you:
```
//region:load-view
myregion.trigger('region:load-view', name[, options]);
```
The `region:load-view` event listener is implemented for you and can search through both the *Regional* and *Widget* registry to find the view by name and show it on the region. You can pass in addition factory options to the event trigger if they are for a *Widget*.

Don't know what a *Widget* registry is? Keep reading.


###Widgets/Editors
To make your view definitions reusable, we offer a way of registering *Widget*s and *Editor*s:
```
Application.create('Widget/Editor', {
	name: '', //name can be used in region:load-view meta event trigger
	factory: function(){
		var View;
		...
		return View;
	}
})
```
It is recommended to employ the **List'n'Container** technique when creating *Widget*s. Note that basic *Editors* are already provided for you. If you need more editors please register them while providing the `getVal`, `setVal`, `validate` and `status` methods.

Note that you will need some sub-views to help compose the *Widget/Editor*, use the short-cut we provide to define them for better extensibility in the future:
```
var MyItemView = Application.create({
	type: 'ItemView', //default on ItemView, can also be Layout, CollectionView and CompositeView.
	..., //normal Marionette.xView options.
});
```

To instantiate a *Widget*, use either `region.trigger('region:load-view', name, options)` or:
```
Application.create('Widget', {
	name: '',
	..., //rest of the init options, don't pass in a config named 'factory'. 
})
```

To instantiate a *Editor*, use either `this.enableEditors()` within a view's `onShow()` or :
```
Application.create('Editor', {
	name: '',
	..., //rest of the init options, don't pass in a config named 'factory'.
})
```

####List/Container technique
This is the golden technique to use when planning your reusable views or, say, any view on screen. Any widget on screen can be decoupled into lists and containers, like this:

<img src="/static/resource/default/diagram/Diagram-5.png" alt="List'n'Containers" class="center-block"></img>

* Starts by choosing a proper container with desired layout, nest containers if needs be.
* Put lists into the container.
* Figure out the view to show within each list item.

You can always nest another layer of container-list-item into an item of parent layer to form even more complex views. Make sure you use the `Application.create(options)` API when defining the list item views. *DO NOT* use `Application.create('Regional', options)` unless its the outer most view definition for a region.


###i18n/l10n
The internationalization is always a painful process, making substitution dynamically to the strings and labels appear in the application according to the user locale settings can interfere with the coding process if every string must be coded with a `getResource('actual string')` wrapped around.

Luckily, Javascript is a prototypical language, we can extend the `String` class through its prototype and give every string a way of finding its own translation.

####Cast i18n on strings
To use the i18n mechanism in your application, simply add `.i18n()` to the tail of your string:
```
//directly
'String to be translated'.i18n()
//indirectly by auto type cast
var s = 'Another string to translate';
s.i18n()
```
You can also use it in template as a *Handlebars.js* helper:
```
template: [
    '<div>',
        '{{i18n key}}', //this will translate whatever string the var 'key' is holding
    '<div>'
]
```
If you need to cast i18n on a block of text, we suggest that you use our $.md jQuery plugin and manage blocks of text and their translations in separate markdown files. If you are really in a hurry, you can also use our i18n mechanism as a jQuery plugin:
```
<div>
    <span data-i18n-key="*">abcd...</span>
    <span data-i18n-key="efg">abcd...</span>
</div>

$('span').i18n();
$('div').i18n({search: true}); //if you want to use parent container to cast
```
Remember to use the `data-i18n-key` attribute to identify the content of a tag for translation. If you want to use the entire content text as a *big* key of the translation, use `data-i18n-key="*"`. If you use `data-i18n-key="efg"` to identify a tag, its content will be translated as if you were using string `efg`.

####Translation file
The translation files are needed to complete the i18n mechanism. We use a simple opt-in way of loading resource file for a given locale:
```
http(s)://your host'n'app/?locale=xx_XX
```
The query param **locale** in the url will tell the i18n mechanism to load a specific resource file.

#####Format
Your translation file should be in the [JSON](http://json.org/) format, like this:
```
{
    locale: 'xx_XX',
    trans: {
        "string": "translation", 
        //or 
        "string": {
           "_default": "", //the default translating if not specifying namespace
           "namespace-a": "",
           "namespace-b": "",
           "senario-x": "",
           "module-y": ""
        },
        ..., //other key-trans pairs
    }
}
```
Note that, we allow you the freedom to translate the same string into different things according to module/namespace/senario settings. You can activate a module/namespace/senario translation like this:
```
//directly in javascript
'String to translate'.i18n({module: 'module/namespace/senario'});

//or in a Handlebar.js template
{{i18n key module}}

//or as jQuery plugin
<span data-i18n-key="*" data-i18n-module="module-y">abc</span>
$('span').i18n();
```


####Configuration
You can configure where and what the i18n mechanism need to look for its required translation files through the I18N global variable:
```
I18N.configure({
    resourcePath: 'static/resource',
    translationFile: 'i18n.json'
});
```
The default settings will always look for `http://your host'n'app/static/resource/xx_XX/i18n.json`.


###Create a new theme
You can have multiple themes for an application and switch between them. The default theme will be the one that you set during `Application.setup()`. However, you can force the application to pickup other themes by:
```
http(s)://your host'n'app/?theme=xyz
```

####Theme structure
Themes are located at `/implementation/themes/[your theme name]/` with the following structure:
> * /css
>     - /include
>     - main.css -- do *NOT* change this one directly
> * /fonts
> * /img
> * /less
>     - /include
>     - main.less -- always start with this file
> * index.html

Open up the `/less/main.less` file and you will see the following:
* @import (inline) "../css/include/*.css" (the statically included styles)
* bootstrap.less (do **NOT** change) - includes all the original bootstrap styles
* **variables.less** - basic css override through pre-defined variables
* **theme.less** - components and components override
* mixins.less (optional)
* font.less (optional) - extra web fonts
* print.less (optional)

You should be focusing on changing the theme.less and variables.less files. Note that the *Bootstrap* .less files are *NOT* included in the framework package. Your LESS compiler might pop errors as it can not find the required `bootstrap.less` file. Go to `/implementation/js/libs/tracked/` and run `bower update` (you should have bower installed through [npm](https://www.npmjs.org/) first). It will fetch you the required *Bootstrap* package.

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
####Rules of Thumb
* Keep things simple, especially the simple ones.
* Categorization before abstraction.
* Separate, Reuse and Pipeline.
* Cleaner method signature. Options as a single object parameter.
* Events for collaborations instead of APIs. Promises for asynchronise operations instead of callbacks.

Start with user requirements/stories and focus on serving the customers' need. Use the 80/20 rule to pick out important features/functionalities and implement them first. Gradually refine code and documentation later. Remember to write down **why** before **how** in the code comments. !FOCUS!


###B. Change log
see CHANGELOG.md

###C. Useful sites
####CDN
* [jsDelivr](http://www.jsdelivr.com/)

####Javascript
* [Douglas Crockford on js](http://www.crockford.com/javascript/)
* [Superherojs](http://superherojs.com)

####HTML5/CSS3
* [HTML5 boilerplate](http://html5boilerplate.com/)
* [Initializr](http://www.initializr.com/) - faster way of using h5bp
* [HTML5 rocks!](http://www.html5rocks.com/en/)
* [HTML5.org](http://html5.org/)

####Look'n'Feel
* [Bootswatch](http://bootswatch.com/) - Bootstrap themes
* [WrapBootstrap](https://wrapbootstrap.com/) - Advanced Bootstrap themes
* [H5BP.showcase](http://h5bp.net/) - Site examples
* [Subtlepatterns](http://subtlepatterns.com/) - web texture
* [Google Fonts](http://www.google.com/fonts/)/[Font Squirrel](http://www.fontsquirrel.com/) - web fonts