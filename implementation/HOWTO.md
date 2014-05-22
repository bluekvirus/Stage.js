<img class="project-title"></img>
<hr/>
Building multi-context rich-client web applications in the modern way.
[@Tim (Zhiyuan) Liu](mailto:bluekvirus@gmail.com)


Current version
---------------
**@1.1.1**
([Why is it version-ed like this?](http://semver.org/))


Introduction
------------
This lightweight framework is made on top of **Backbone.Marionette** and **Bootstrap**. The goal is to maximize developer efficiency by introducing an intuitive workflow on top of a solid application structure. You will be focusing on user interaction building without distraction. We even give you a web server for starting the development right away! Theming and making deployment are also a breeze through our tools.

To flatten and lower the initial learning curve of adaptation, there is only a handful of APIs to remember:

Initialize:
* Application.setup (options)
* Application.run ()

Structure:
* Application.context (name, options) - alias: page()
* Application.regional (name, options) - alias: area()
* Application.view (options, instant)

Reuse:
* Application.widget (name, options/factory)
* Application.editor (name, options/factory)
* Application.editor.validator (name, fn) - alias: editor.rule()

Handling Data:
* Application.remote (options)
* Application.model({data}) - shortcut for new Backbone.Model(data)
* Application.collection([data]) - shortcut for new Backbone.Collection(data)
-----------------------------------------------------------------------------

**Remember:** Your goal is to
* Create view objects with HTML template and actions. 
* Put them into pre-defined layout regions. 
* Make them talk to each other through events.
* Group them into purposeful(topic related) swap-able contexts.

**Don't:**
* Create Model and Collection instances unless it is to generate views.
* Wrap/Organize your view definitions into Class hierarchies.
* Put more than 2 non-object params in any function signature.
* Use direct method invocations for view-view, view-context, view-application collaborations.

**Keep your Javascript codes flat and HTML dynamic, style through CSS class.**


###Why not using...
Why not using AngularJS/EmberJS/Meteor or YUI/ExtJS? Yes you can, but, if you can, **always favor libraries over frameworks**. Given that *Stage.js* is also a framework. The advise here should be extended to: 
> If you can *NOT* agree with the workflow/abstraction, always favor libraries over frameworks.

We choose what we choose when designing this framework simply because we want total control over our product. There are often 2 types of framework to choose from when developing a web application:
* Development Framework - AngularJS/EmberJS/Meteor (infrastructure only)
* Application Framework (All-in-One) - YUI/ExtJS (infrastructure plus widgets and tools)

**The Backbone library can implement them all** (Yes, any client side framework). (Not 100% for Meteor though, since Meteor combines its server into a full-stack solution. You need nodejs in the picture, and we do have a dev-server package called **ajax-box-lite** in the toolset for just that based on the [express.js](http://expressjs.com/4x/) framework). And, if you need more evidence, YUI3 has the exact same concepts from Backbone implemented as its infrastructure. (Why did we mention YUI here? Because of Yahoo!'s Javascript [Architect](http://www.crockford.com/))

In order to accomplish more with less code using Backbone, we picked Backbone.Marionette as our pattern library. It offers cleanup/boilerplate routines and very neat concepts for building large Javascript front-end projects. The resulting framework accomplishes all the big frameworks have promised but with **a thiner and flatter structure**. We believe scripting languages are always going to be the perfect thin glue layer between mechanisms and policies. The Javascript language were picked to glue HTML/CSS and UX but nothing more, it should not be overdosed and attempt to mimic Java. In other words, **only the burger is important**:

<img src="static/resource/default/diagram/Diagram-6.png" alt="HTML is the burger" class="center-block"></img>

###Core concepts
<img src="static/resource/default/diagram/Diagram-3.png" alt="Stage.js Architecture" class="center-block"></img>

####What's Navigation?

We achieve client-side multi-page-alike navigation through switching *Context*s on a pre-defined application region in respond to the URL fragment change event. You can also use the *sub-path* parameter received by the *Context* object upon context switching to further control its presentation accordingly (e.g #navigate/Context/sub-path or status).

####What's a Context?
A *Context* is a special *Marionette.Layout* view object. *Context*s only appear on the application's context region (each application can have only 1 such region). If you have more than 1 *Context*s defined, they will automatically swap on the context region in response to the navigation event. You will not have more than 1 active *Context* at any given time.

alias: Page

####What's a Regional?
A *Regional* is a *Marionette.xView* (*ItemView, Layout, CollectionView and CompositeView*) with name, it is to be shown on a region in template of your application or any *Marionette.Layout* instance. As you can see, since a *Context* is a *Layout* with extra functions, *Regional*s will be used closely with it. You can link a *Regional* with a *Context* by putting the *Regional*'s name in the *Context*'s template. Read more about *Regional* in the **Quick steps** section.

alias: Area

####Remote data handling?
Modern web application generates views according to user data dynamically. This is why we picked *Backbone/Marionette* as our implementation base -- to use dynamic views rendered through data. However, the way we handle remote data in our framework is a bit different than the original design in *Backbone*.

**Important:** We introduce a unified *DATA API* for handling all the in/out of remote server data, skipping the *Model/Collection* centered way of data manipulation. *Model/Collection* are only used as dumb data snapshot object on the client side to support views. The goal is to make the data interfacing layer *as thin as possible*. You will find more details in the **Quick steps** section.

####Reuse view definitions?
For *Regional*s (or any *Marionette.xView*) that you need to use again and again but with different configuration (e.g a Datagrid). Register it as a *Widget* or, in case of a basic input, an *Editor*. These reusable view definitions are call *Reusable*s in the framework. Think in terms of the **List and Container** technique as much as possible when creating them.

####Glue through events
We encourage event programming in this framework. We glue views into a functioning whole by using meta-events. Whenever an interaction or transition happens (e.g navigation, context-swap, login, error, data-ready...), intead of calling the actual *doer*s, **fire/trigger an event first and provide a default listener**, so that later the actual behavior triggered by this event can be changed without affecting the glue/interfacing logic. Read carefully through the **Events** subsection in **Quick steps** below so you understand how to implement and extend application behaviors mainly through events. 

####Seems complicated...
To focus, think of your application in terms of *Context*s and *Regional*s (pages and areas). Like drawing a series of pictures, each page is a *Context* and you lay things out by sketching out regions (areas) first on each page then refined the details (*Regionals*). Each *Context* can also be made state-aware through the same navigation mechanism that powers *Context* switching in the application container.

Use *Model*/*Collection* wisely, try not to involve them before relating to any *Marionette.xView*. In other words, unless you want a dynamic view, do **NOT** use *Model*/*Collection*. Fetch/persist data through a unified *Data API* (CRUD in RESTful format). Focus on UI/UX and make the data interfacing/manipulation layer as thin as possible. Operate on plain data object/array only. Bind pagination, sorting and filtering operations with views instead.

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
<small class="text-muted">(Model/Collection, View, EventEmitter, Router)</small>

If you don't know what they are, go for a quick look at their websites. (links are provided under the *Included Libraries* area on the left sidebar)

We also maintain a list of 3rd party libraries for the developers to choose from in addition to the base libraries. These utility libraries (e.g jquery-file-upload, store.js, uri.js, raphael.js, marked, moment.js, socket.io.js...) are carefully selected from the many open-source Javascript libraries out there to help with specific but generally-will-appear problems that a developer will encounter during the web application development process. (see more in the **Include other js libraries** section)

**Remember:** The goal of this framework is to assist you making better use of *Marionette* (thus *Backbone*). It is designed to keep you focused on building dynamic views without worrying about putting/linking/organizing them into a manageable whole. It is very important that you understand the 4 types of views (*ItemView, Layout, CollectionView and CompositeView*) offered by the *Marionette* pattern library. So that you can maximize the efficiency offered by our unique workflow, intuitive toolset and prepared application container.

###Choose the right distribution

####Project kit
> * /design
>   * /assets (-)
>   * /docs (-)
> * /implementation -- your web root
>   * /js (-)
>   * /static (-)
>   * /themes
>   * index.html
>   * bower.json
> * /tools
>   * /build -- minify and concatenate your js files by scanning index.html
>   * /iconprep -- build icons into big css sprite
>   * /devserver -- development web server with less file monitor
>   * /shared -- shared scripts used by the tools
>   * package.json

**(-)**: This folder is empty initially, it is created as a suggestion.

Use the project-kit distribution whenever you want to start a production level web application project.

####Release pack
> * /js
> * /themes
> * index.html

This distribution is designed to be simple and doesn't have tools and theme packages for production level development. The release-pack folder is serve-able out of the box.

Use the release-pack distribution for prototyping your next product concept, or to keep your project core up-to-date.

**Note**: The release-pack distribution is also what you will get from the bower package manager when using command:
```
bower install/update stage
```


###Quick steps
Here is the recommended **workflow**. You should follow the steps each time you want to start a new project with *Stage.js*.


####Preparation
Download the *Stage.js* [project-kit](static/resource/default/download/stagejs-starter-kit.tar.gz) and extract its content to your project folder of choice.

Under your project folder, open up a console/terminal on your OS and do the following:
* Under the `/tools` folder run
```
npm install
npm start //this will start the development server on http://localhost:5000/dev/
```
* Under the `/implementation` folder run
```
bower install
```
* Create a `main.js` (you are free to choose whatever the name you like) 
and include it in `index.html` below the `<!--main.js-->` comment line:
```
<script src="bower_components/stage/dist/js/lib/dependencies.min.js"></script>
<script src="bower_components/stage/dist/js/stage.min.js"></script>
...  
<!--main.js-->
<script type="text/javascript" src="js/main.js"></script>
...
```
**Note:** You can use `stage.js` instead of `stage.min.js` to have better debugging info.
Minimum `main.js` script looks like this:
```
//main.js
Application.setup().run();
```
You should now see a *blank* page without Javascript error on http://localhost:5000/dev/.

If you are really in a hurry to see some stuff on page, give your application a template:
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

Remember, creating a web application is like drawing a picture. Start by laying things out and gradually refine the details. In our case, always start by defining the application template.

Now, let's start building a real web application.

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
    baseAjaxURI: 'your base url for using Application.remote()',
    crossdomain: {...} //the crossdomain ajax call configure
}).run();
```
The configure variables have sensible defaults, you can safely skip configuring them here, however, there is one you might want to change now -- `template`.

Since your goal is to build a *multi-context* application, you will need some *regions* in the application template and a *Context Region*:
```javascript
//main.js
Application.setup({
    ...
    template: [
        '<div region="banner" view="Banner"></div>',
        '<div region="body"></div>',
        '<div region="footer"></div>'
    ],
    contextRegion: 'body', //use region 'body' as the context region
    ...
}).run();
```
A `region=""` attribute on any html tag marks a pre-defined region in the template, **you can also do this with any *Marionette.Layout*** in our framework. Doing so is equivalent of using the `regions:{}` property.

Tag marked with `region=""` can use an additional `view=""` attribute to load up a *Regional* view by name:
```
'<div region="banner" view="Banner"></div>'
//is equivalent to
onShow: function(){
    this.getRegion('banner').trigger('region:load-view', 'Banner');
    //or
    this.getRegion('banner').show(new Application.Core.Regional.get('Banner'));
}
```
**Note:** *Regional* views loaded by the `view=""` attribute should have no init options. If you do need to specify init options when showing a *Regional* view, use the alternatives.

If your application is a single-context application, you don't need to assign the application template. There will always be a region that wraps the whole application -- the *app* region. The **Default** *Context* will automatically show on region *app* if you did not specify `contextRegion` and `defaultContext`.

Now we've marked the context region, let's proceed to define them.

####Step 2. Define Contexts
Create a new file named `myContextA.js`, remember a *Context* is just an special *Marionette.Layout* view object, all you need to do is adding a name to the ordinary *Marionette.Layout* options:
```
//myContextA.js
(function(app) {
    app.context('MyContextA', { //omitting the name indicates context:Default
        template: '...',
        //..., normal Marionette.Layout options
        onNavigateTo: function(subpath) {
            //...
        }
    });
})(Application);
```
alias: `Application.page()`. 

Now, with a *Context* defined, you can define *Regional*s to populate its regions.


#####Navigate within a context
In the above code example, the `onNavigateTo` method handles the `context:navigate-to` event. This event will get triggered on the context if the application switched to `MyContextA`, so that you can do some *in-context* navigation followed by. (e.g if the navigation is at `#navigate/MyContextA/SubViewA...`, `SubViewA` will be the subpath argument)

You can also treat the subpath/module part as a status and render your context accordingly.

#####Navigate between contexts
Use the `app:navigate` event on `Application` to actively switch between contexts.
```
//full path mode
Application.trigger('app:navigate', 'ABC/EFG...');

//context, module mode
Application.trigger({
    context: 'ABC',
    module: 'EFG...', //alias: subpath
});
```
You can also use the clicking event on an `<a>` anchor tag to switch context without any code involved:
```
<a href="#navigate/ABC/EFG..."></a>
```
Or, brutally using the actual `window.location` object:
```
window.location.hash = '#navigate/ABC/EFG...';
```


####Step 3. Define Regionals
Before creating a *Regional*, change your `myContextA.js` into `/context-a/index.js` so you can start adding regional definitions into the context folder as separate code files. Always maintain a clear code hierarchy through file structures. (Try to limit each code file to be **under 300-400 lines** including comments)

Create `/context-a/myRegionalA.js` like this:
```
//myRegionalA.js
(function(app) {
    app.regional('MyRegionalA', { //omitting the name gets you an instance of this definition.
        type: 'CollectionView', //omitting this indicates 'Layout'
        template: '...',
        //..., normal Marionette.xView options
    });
})(Application);
```
alias: `Application.area()`. 

By default, `Application.regional(['you regional view name',] {...})` returns the **definition** of the view, if you want to use the returned view **anonymously**, remove the `name` argument. You will get an **instance** of the view definition to `show()` on a region right away. 

Sometimes your *Regional* is comprised of other sub-regional views and that's fine, you can nest *Regional*s with the `region=""` and `view=""` attributes in the template (only if it is of `type: Layout`). 

There will also be time when you just need plain *Marionette.xView* definitions to be used as item views within *Regional*s. Define them through the `Application.view()` API:
```
//myRegionalA.js
(function(app) {
    app.regional('MyRegionalA', { //omitting the name gets you an instance of this definition.
        type: 'CollectionView', //omitting this indicates 'Layout'
        template: '...',
        itemView: CustomView,
        //..., normal Marionette.xView options
    });

    var CustomView = app.view({
        type: '...', //ItemView, Layout, CollectionView or CompositeView
        ..., //rest of normal Marionette.xView options
    });     
})(Application);
```
The above call to `app.view()` returns a **definition**. If you want an **instance** to be returned, do it like this:
```
...
var view = app.view({...}, true);
...
```

Now, we've sketched the layout of our application, you might want more contexts defined before continue but that's the easy part, just repeat Step 1-2 till you are ready to proceed to light-up the views dynamically with remote data.

####Step 4. Handle data
Though we do not agree with *Backbone*'s way of loading and persisting data through *Model/Collection*s. We do agree that **data** should be the central part of every computer program. In our case, the remote data from server are still used to power the dynamic views. We use *Backbone.Model/Collection* only when there is a *View*. In other words, *data* and *View*s are centric in our framework paradigm, *Model/Collection*s are not. Try to think of them as a integrated part of *View*s. 

Our recommended way of loading/persisting remote data is through:
```
//returns the $.ajax() object - jqXHR for using promises.
Application.remote('...' or {
    entity: '',//entity name of resource
    params/querys: {...}, //converts to request parameters in header e.g ?a=1&b=2
    _id: '',
    _method: '',
    payload: {...}, //data to send to the server
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
Render remote data in a view without mentioning *Model/Collection* like this:
```
//myRegionalA.js
(function(app) {
    app.regional('MyRegionalA', {
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
By using an event `view:render-data`, we eliminate the need of handling data rendering through *Model/Collection* in a view. Override `onRenderData()` if you want the data rendering process to be different. 

Data returned should be in the [JSON](http://json.org/) format and with `Content-Type: application/json` in its response headers. An JSON Array will be converted into a *Collection* (Object into a *Model*) before given to the view. You can trigger `view:render-data` whenever you want to change the underlying model and collection in a view instance. The `reset`, `change`, `add` and `remove` events are listened by the view and it will re-render accordingly.

**Note:** If you use `view:render-data` and pass in an `Array`, it will **reset** the collection of that view. 

Modify (paginate/filter/sort) the data before passing to the `view:render-data` event. *Do NOT* bind pagination/filtering/sorting operations with model/collection instances.

####Step 5. Adding UX
UX stands for user experience, it is not just about look'n'feel and clickings but also transitions/animations that links between interactions and state change. UX is hard to design, without a clear think-through over the purposes and targeted user tasks, it can be a total chaos... Make sure you have had your plan/sketch reviewed by targeted audience/friends or colleagues before implementation. Employ the *Goal-Directed Design* technique as much as you can.

To implement your design is, however, very easy. We have enhanced *Marionette.View* thus its sub-classes (*ItemView, Layout, CollectionView and CompositeView*) with opt-in abilities, you can use them while adding user interactions and view transitions to the application.

#####Effect
Any *Marionette.xView* can have an `effect` configure to control the effect through which it will be shown on a region:
```
//myRegionalA.js or any Marionette.xView
(function(app) {
    app.regional('MyRegionalA', {
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
Pass just an effect name as a string to the configure if you don't need more tweak on the effect options. For more information regarding the effect options, please go to [jQuery.Effect](http://jqueryui.com/effect/).

#####Actions
Actions are click-ables marked by `action=""` attribute in your view template. The original way of registering events and listeners introduced by *Backbone.View* are flexible but tedious and repetitive. We offer you the *Action Tags for speeding things up.

Any *Marionette.xView* can have its actions configure block activated like this (2 easy steps):
```
//myRegionalA.js or any Marionette.xView
(function(app) {
    app.regional('MyRegionalA', {
        ...,
        template: [
            '<div>',
                '<span class="btn" action="opA">Do it!</span>', //1. mark action tag(s).
                ...,
            '</div>',
        ],
        ...,
        actions: { //2. implement the action listeners.
            _bubble: false | true, //bubble un-matched click event up. [default: false]
            'opA': function($triggerTag, e){...},
            'opB': ...
        }
    });
})(Application);
```
Note that only 'single-click' actions can be registered like this at the moment. 

Use `_bubble: true` if you want the click event to **propagate** to the parent view/container. `e.preventDefault()` needs to be specified in the action listeners if you don't want a clicking on `<a href="#xyz" action="another"></a>` tag to affect the navigation.


#####Graphs
We support graphs through SVG. A basic SVG library is integrated with the framework (Raphaël.js). You can use it in any *Marionette.xView* through:
```
Application.view({
    svg: true,
    onShow: function(){
        if(this.paper) 
            //draw...
        else 
            this.onPaperReady = function(paper){
                //draw...
            }
    }
});
```
Don't worry about the resizing routine, it is already prepared for you. The paper size will be set correctly to the container's through the use of `view:fit-paper` event on the container view object and there is an follow-up meta event `view:paper-resized` triggered on the view so you can do something accordingly after the SVG canvas is resized.
```
view.listenTo(app, 'app:resized', function(){
    this.trigger('view:fit-paper')
});
view.onPaperResized(){
    //draw...
}
```

If you require charts to be drawn, look through our monitored libraries under `/bower_components` there should be **d3.js** and **highcharts.js** for exactly that.

**Note:** HTML5 *Canvas* libraries will be added in the future.

#####Events
Some interactions demand **collaboration** between view objects, this is why we introduce the concept of meta-event programming. It is like coding through just interfaces in a object-oriented programming language but much more flexible. The goal is to let the developer code with events instead of APIs so the implementation can be delayed as much as possible. The underlying principle is very simple:
```
//event format : namespace:worda-wordb-...
object.trigger('object:meta-event', arguments);
//will invoke listener : onWordaWordb...
object.onMetaEvent(arguments);
```
We have `Application (app:)`, `Context (context:)` and all the `Marionette.xView (view:)` enhanced to accept meta-event triggers. Some of the events are already listened/triggered for you:
* Application -- app:meta-event
```
app:navigate (string) or ({context:..., module:...}) - Application.onNavigate [pre-defined]
app:context-switched (contextName)  - [empty stub] - triggered after app:navigate
//the followings are triggered by Application.remote():
app:ajax - Application.onAjax [pre-defined]
app:ajax-start - Application.onAjaxStart [pre-defined]
app:ajax-stop - Application.onAjaxStop [pre-defined]
//triggered by window
app:resized - [empty stub]
app:scroll - [empty stub]
//global - for alerts and prompts
app:success - [empty stub]
app:error - [empty stub]
```
* Context -- context:meta-event
```
context:navigate-to (moduleName) - [empty stub] - triggered after app:navigate
```
* Marionette.xView -- view:meta-event
```
//General
view:render-data (data) - onRenderData [pre-defined]
view:data-rendered
//ItemView only (SVG)
view:fit-paper
view:paper-resized
view:paper-ready
//CollectionView only (Remote Data Pagination)
view:load-page
view:page-changed
```

Remember, you can always trigger a customized event `my-event-xyz` and implement it later on the object by creating `onMyEventXyz()`.

Though you can not yet use customized meta-event on Marionette.Regions, there is a  convenient one for you:
```
//region:load-view
anyregion.trigger('region:load-view', name[, options]);
```
The `region:load-view` event listener is implemented for you and can search through both the *Regional* and *Widget* registry to find the view by name and show it on the region. You can pass in addition factory options to the event trigger. 

Recall that you can use `view=""` in a template to link a *Regional* to a region to show as well, but it will *NOT* search through the *Widget* registry for finding the view definition, due to the difficulties of putting widget options into the `view=""` marked tags.


######Use parentCt?
Before you move on, there is one more thing in this event section we want to clarify. If you use `region=""` in your template to define regions in a *Context*/*Marionette.Layout*, your sub-view instances within those regions will receive a `parentCt` property upon showing which should help you find its parent container view instance (the layout instance).

This is helpful when you want to achieve **collaborations** between sub-views by using event managed by the layout.
```
//Good
subViewA {
	...
	parentCt.trigger('co-op', data);
	...
}
parentCt.onCoOp:
	subViewB = new SubViewB(data);
	regionB.show(subViewB);
	//or
	subViewB.trigger('co-op', data);

//Bad
subViewA.parentCt.regionB.show(subViewB);
subViewA {
	...
	subViewB.doCoOp(data)
	...
}
```
**Remember:** Always prefer *Events* over *APIs* while implementing collaborations.


Inputs/Editors
--------------
We have already prepared the basic html editors for you in the framework. You don't have to code `<input>`, `<select>` or `<textarea>` in any of your view template. It is now very easy to build views to function as forms or to just add inputs to views. 

You can also easily compose compound editors and fieldsets with the basic editors. This way you can reduce/combine values produced by the editors and collect them with a hierarchy/structure.

###Basic
You can activate basic editors in any *Marionette.xView* like this:
```
Application.view({
    ...,
    editors: { //editors per fieldname
        _global: {...}, //globally shared per editor configures

        abc: {
            type: 'text', //other types are available as well.
            label: 'Abc',
            help: 'This is abc',
            tooltip: 'Hey Abc here!',
            placeholder: 'abc...',
            value: 'default',
            validate: { //validators are executed in sequence:
                required: { //named validator
                    msg: 'Hey input something!', //options for the validator function
                    ...,
                },
                fn: function(val, parentCt){ //anonymous validator
                    if(!_.string.startsWith(val, 'A')) return 'You must start with an A';
                }
            }

        },
        ..., //other editor configures
    },
    ...
});
```
The editors will be appended inside the calling view instance one by one by default, or, by the `editor="[fieldname]"` position attribute in the view's template. They can also be placed according to its own `appendTo` configuration.

A little bit more about the basic options: 
* appendTo - in case you don't have `editor="[fieldname]"` in your template and want to change where to put the editor other than the default position.
* parentCt - in case you want to delegate editor events to a parent container object (e.g a form object).
* type - text, password, url, email, checkbox(es), radios, file, hidden, ro (for read-only), textarea, select
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
**The validate function or validators should return undefined or the 'error string' to indicate passed and rejected situation respectively.**

You can always register more named validators by:
```
Application.editor.validator('my-validator-name', function(options, val, parentCt){
    ...,
});
```
alias: `Application.editor.rule()`.

Additional advanced per editor options:
* layout 
 - label - css class (e.g col-sm-2)
 - field - css class (e.g col-sm-10)
* html: - indicating read-only text field (setting this will cause 'type' to be 'ro')
* options: (radios/selects/checkboxes only)
    * inline: true|false 
    * data: [] or {group:[], group2:[]} - (groups are for select only)
    * labelField
    * valueField
    * remote: app.remote() config for loading options.data remotely
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
You will also get the following APIs attached to the **view** instance object once you have configured the `editors:{}` block:
```
this.getEditor(name); 
this.getValues(); 
this.setValues(vals, loud); 
this.validate(true|false); //true for showing the validation errors.
this.status(status, messages); //for highlighting status per editor. no arguments means to clear.
```

There are also events emitted that you can use when dealing with each of these editors:
```
editor:change
editor:keyup
editor:focusin // - focus
editor:focusout // - blur
```
If you use `options.parentCt` to pass in another view instance, the events will be fired on that view instance **in addition to** firing on the editor itself. It is useful when you want every event to be fired on a parent container or, say, a form view.

Each editor instance will have the following methods:
```
editor.getVal();
editor.setVal(val, loud);
editor.disable([flag]); //false to enable, default to disable, true to disable + hide.
editor.isEnabled();
editor.validate(showError); //if you have options.validator configured
editor.status(status, message); //info, error, warning, success status, empty to reset status.
```

**Note:** The *select, radios and checkboxes* editors can be initialized without `options.data` configuration, these editors will get an additional `setChoices()` API that you can use to set the available choices later.

If you need more editors please register them through
```
Application.editor('[your editor name]', function(){
    var Editor = Application.view({...});
    ...;
    return Editor;
});
```
You need to provide the `getVal`, `setVal`, `validate`, `status` and `disable` (+`isEnabled`) methods.

**Important:** Do *NOT* use `onShow()` in your editor definition. Use `onRender` instead so that your editor can support the `editor=""` template attributes for dynamic positioning.

There is also another way of activating your editors without fixing the configurations in the view definition:
```
Application.view({
...
    onShow: function(){
        this.activateEditors(options);
    },
...
});
```
**Warning:** Although this is no difference than defining a view dynamically with editors configuration, it is not the *recommended* way of adding editors to a view.

###Compound
Sometimes you need to build a compound editor with more basic editors than the number of values collected. You can do this by assigning a view **definition** to the editor configure:
```
Application.view({

    editors: {
        a: ...,
        b: ...,

        c: Application.view({
            template: ...,
            editors: ..., //*required
            getVal: ..., //*required
            setVal: ..., //*required
            disable: ...,
            isEnabled: ...,
            status: ... //*required if you want customized error message display.
        })
    }

});
```
This has some disadvantages compare to registering an new editor via `app.editor()`, but is more intuitive when defining a compound form editor.

If you still want `_global` (e.g appendTo) configure and `parentCt` (for editor events) to be passed to the compound editor, use `app.editor()` to register the view.

###Fieldset
With view instance easily turned into form now, you might want to nest form pieces with *Marionette.Layout* and *Marionette.ItemView* and collect the values with similar hierarchy, this could be done by adding a `fieldset` property to your view definition besides the `editors` configuration:
```
var FieldsetX = Application.view({

    fieldset: 'sub-fieldset-x',
    editors: {
        ...
    }

});
```
Then, you can use the view as normal regional views in a layout:
```
Application.view({

    type: 'Layout',
    template: [
        '<div region="fieldset-a"></div>',
        '<div></div>'
    ],
    editors: {
        ..., //the layout can itself contain editors!
    },
    onShow: function(){
        this.getRegion('fieldset-a').show(new FieldsetX);
    }

})
```
Now, the values you collect from the layout through `getValues()` will contain a field `sub-fieldset-x` with all the values collected from that fieldset view.

You can also control the nested editors through a dotted name path:
```
layout.getEditor('sub-fieldset-x.abc'); //will get you editor `abc` in targeted fieldset.
```

**Note**: Normally, if you don't need to collect values per group, you can omit the `fieldset` property in the view's definition. Values will be merged with those from the parent layout view.

###Build a form
As you can see from the above sections, you can build 2 types of forms through views:
* Basic/Piece
    * Just use the `editors:{}` configure block in a view definition.
* Nested
    * Use a layout view together with nested views into regions.
    * Name nested views with fieldset names to form a hierarchy if needs be.

In a nested form view, may there be fieldsets or not, you can always use these APIs in the outer-most layout:
```
this.getValues(); 
this.setValues(vals, loud); 
this.validate(true|false); //true for showing the validation errors.
```
The above APIs will automatically go through the regional views as well, if they too have the same functions attached. This enables a way to progressively build a form view through layout and regions and then still be used as a whole. 


Widgets
-------
To make your view definitions reusable, we offer a way of registering *Widget*s:
```
//Widget name can be used in region:load-view meta event trigger
Application.widget('MyWidgetName', 
	function(){
		var UI = Application.view({...});
        ...;
		return UI;
	}
)
```
It is recommended to employ the **List'n'Container** technique when creating *Widget*s.

Note that you will need some sub-views to help compose the *Widget*, use the short-cut we provide to define them for better extensibility in the future:
```
var MyItemView = Application.view({
	type: '', //default is ItemView, can also be Layout, CollectionView and CompositeView.
	..., //normal Marionette.xView options.
});
```

To instantiate a *Widget*, use either `region.trigger('region:load-view', name, options)` or:
```
Application.widget('MyWidgetName', {
	..., //rest of the init options, don't pass in a config named 'factory'. 
})
```


###List'n'Container technique
This is the golden technique to use when planning your reusable views or, say, any view on screen. Any widget on screen can be decoupled into lists and containers, like this:

<img src="static/resource/default/diagram/Diagram-5.png" alt="List'n'Containers" class="center-block"></img>

* Starts by choosing a proper container with desired layout, nest containers if needs be.
* Put lists into the container.
* Figure out the view to show within each list item.

You can always nest another layer of container-list-item into an item of parent layer to form even more complex views. Make sure you use the `Application.view(options)` API when defining the list item views.

**Important**: *Do NOT* use `Application.regional()` in widget building.

**Suggestions**: 
* Always implement the `view:reconfigure` meta event listeners in a widget for swapping data and configuration after the widget is shown. Make sure the `view:render-data` event is working as expected as well. 
* Keep widgets reconfigurable in display and dumb in functionality, don't put *policy* code as logic into them. 
* Leave space to accommodate real case usages by keeping options minimum. Don't turn into an *all-in-one* thing and force other developers to *configure* the widget.
* Fire event whenever an action is triggered, provide a default listener so that later it can be rewired.
* Test your widget in designed scenarios thoroughly with mock-up data.

To assist you further in the development process, we have several pre-implemented lightweight widgets bundled into the release as well, let's examine them. 


###Datagrid
**Purpose**: Give you a dynamic `<table>` with columns and customizable cells.

**Options**:
```
data: [{key: val, key2: val2, ...}, {}] - //array of data objects
columns: 
[
    {
        name: //a key string in the data object
        header: //default: 'string' (e.g 'string' maps to 'StringHeaderCell')
        cell: //default: same as header (e.g 'string' maps to 'StringCell')
        label: //name given to header cell, default: _.titleize(name)
    },
    ...
]
```

**Usage**: 3 possible scenarios
```
...
//Scenario 1. configured
this.table.trigger('region:load-view', 'Datagrid', {
    className: 'table table-hover',

    data: Mock.mock(mockDataTpl).data, //optional, you can put data into the grid later.
    columns: [
        {
            name: '_id',
            label: '#',
            cell: 'seq'
        },
        {
            name: 'username',
            icon: 'fa fa-envelope'
        },
        {
            name: 'profile.name',
            label: 'Name'
        },
        {
            name: 'profile.age',
            label: 'Age'
        },
        {
            name: 'link'
        },
        {
            cell: 'action',
            //label: 'Ops',
            icon: 'fa fa-cog',
            actions: {
                edit: {
                    //action listeners are bound to the row
                    fn: function(){
                        //record, columns
                        console.log(this.model, this.collection);
                    }
                }
            }
        }
    ]
...

//Scenario 2. feed data into the grid after it is shown:
var datagrid = this.table.currentView;
datagrid.trigger('view:render-data', [...data...]);

//Scenario 3. re-configure the columns and cells:
datagrid.trigger('view:reconfigure', {...new config options...});
});
```

**Extend**:
```
;(function(app){

//make a new cell: -- cell: string,
    app.widget('StringCell', function(){

        var UI = app.view({
            template: '<span>{{{value}}}</span>',
        });

        return UI;
    });

//make a new header cell: -- header: string,
    app.widget('StringHeaderCell', function(){

        var UI = app.view({
            template: '<span><i class="{{icon}}"></i> {{{label}}}</span>',
        });

        return UI;
    });

})(Application);
```
**Note**: Don't forget to name your cells according to the naming convention. You don't have to give `tagName:td` or `tagName:th` to the cell definitions. Define them like normal views.

**Built-in Cells**
* action
* seq
* string

**Built-in Headers**
* string


###Tree
**Purpose**: Give you a nested tree list with customizable node template and selection events:
```
<ul>
    <li></li>
    <li></li>
    <li> -- node
        <a></a> -- item data
        <ul>...</ul> -- children
    </li>
    ...
</ul>
```

**Options**:
```
data: [{
            attr1: ...,
            attr3: ...,
            attrX: ...,
            children: [{
                attr1: ...,
                attr3: ...,
                children: [...]
            }, ..., {...}]
        }, ..., {
            attr1: ...,
            attr2: ...,
            attr3: ...
        }],
node: {...}, - //node options (standard Marionette.CompositeView config)
onSelected: callback(nodeData, $el, e){
    nodeData - //see Traverse blow
    $el - //node view's $el
    e - //the click event
}
```
**Note**: You can *NOT* change sub-node array key to be other than 'children' at the moment. Other than the 'children' field, any named field can appear in the data as node properties. Add the names into the node template to display them.

The default node template is like this:
```
template: [
    '<a href="#"><i class="{{icon}}"></i> {{{val}}}</a>',
    '<ul></ul>'
]
```
So your data should have 'icon' and 'val' in each node's property.

**Usage**:
```
...
this.body.trigger('region:load-view', 'Tree', {
    data: [...],
    node: { //change template to hide children upon shown
        template: [
            '<a href="#"><i class="{{icon}}"></i> {{{val}}}</a>', 
            '<ul class="hidden"></ul>'
        ]
    },
    onSelected: function(data, $el, e){
        e.preventDefault();
        console.debug(data.record, $el);
        data.$children.toggleClass('hidden');
    }
});
...
```

**Extend**:
Use options.node to alter the node views:
```
...
node: {
    template: ..., 
    onRender: ...,
    onShow: ...,
}
...
```
Basically it is a *CompositeView* configure but without `type`, `tagName`, `itemViewContainer`, `itemViewOptions`, `className` and `initialize`.

**Traverse**:
Each node will have the following data hooked into its $el
* record - data of this node from options.data
* $children
* $parent

You can use these to traverse the tree and extract needed information:
```
//back-track to parent's parent
nodeView.$el.data('$parent').data('$parent');
...
```


###Paginator
**Purpose**: To be used with any CollectionView for jumping between pages.

**Options**:
```
target: //the view object it binds to [optional]
currentPage: //current page number
totalPages: //total pages in number
```

**Usage**:
```
...
var table = this.table.currentView;
this.footer.trigger('region:load-view', 'Paginator', {
    target: table,
    className: 'pagination pagination-sm pull-right'
});
...
```
Activate pagination through the `view:load-page` meta-event in a *CollectionView*:
```
//continue
table.trigger('view:load-page', {
    url: '/sample1/user',
    page: 1,
    querys: {
        status: 'active'
    }
});
```
The `view:page-changed` event emitted by the table will bring `currentPage` and `totalPages` into the paginator widget.

**view:load-page**

This event can start a pagination enabled data loading process in any *CollectionView* instance.
```
collectionView.trigger('view:load-data', {
    page: 1,
    pageSize: 15,
    dataKey: 'payload',
    totalKey: 'total',
    ..., - rest of app.remote() options
})
```


###Overlay
<span class="label label-info">jQuery plugin</span>

**Purpose**: Provide you a way of overlaying custom views on screen.

**Options**:
```
effect: //'jquery ui effects string', or specifically:
    openEffect: ...,
    closeEffect: ...,
content: //'text'/html or el or a function($el, $overlay) that returns one of the three.
onShow: //function($el, $overlay) - show callback;
onClose: //function($el, $overlay) - close callback;
class: //'class name strings for styling purposes';
move: true|false - //whether or not to make the overlay-container draggable through jquery ui.
resize: true|false - //whether or not to make the overlay-container resizable through jquery ui.
```

**Usage**:
```
//show overlay
$('body').overlay({
    content: app.view({...}, true).render()
});

//close it
$('body').overlay();
$('body').overlay(false, {
    effect: {...}
})
```
**Note**: Repeatedly open overlays on the same $(el) will have no effect. Close the previous one first. There are also 3rd-party libraries available for creating simple overlays over `<a>` and `<img>` tags (e.g [colorbox](http://www.jacklmoore.com/colorbox/)).


###Markdown
<span class="label label-info">jQuery plugin</span>

**Purpose**: Offering a convenient way of loading .md content into the application. (through [marked](https://github.com/chjj/marked))

**Options**:
```
url: //url path to the hosted .md file
marked: //marked options see [https://github.com/chjj/marked]
hljs: //highlight js configure (e.g languages, classPrefix...)
cb: //function($el) - callback function once the contend has been added
```
**Plus**: The tag you used to call `$.md()` can have `md="..."` or `data-md="..."` attribute to indicate the .md file url.

**Usage**:
```
...
'<div region="doc" md="HOWTO.md"></div>'
...
this.doc.$el.md({
    hljs: {
        languages: ['js', 'html']
    },
    cb: function($el){
        ...
    }
});
...
```

We recommend that you use the [Github flavored version.](https://help.github.com/articles/github-flavored-markdown) ([What's Markdown?](http://daringfireball.net/projects/markdown/))


###ToC (Table-of-Content)
<span class="label label-info">jQuery plugin</span>

**Purpose**: Produce a table-of-content tree list in both html and json format for a given document (through `<h1>`-`<h6>` title relationship scanning)

**Options**:
```
ignoreRoot: false | true - //whether to ignore h1
headerHTML: //html before ul (sibling) - experimental

 * Document h-tag classes
 * ----------------------
 * h1 -- book title
 * h2 -- chapters
 * h3 -- sections
 * ...
```

**Usage**:
```
$el.toc({
    ignoreRoot: true,
    headerHTML: '<div class="h4" style="margin-top:48px"><i class="fa fa-book"></i> Table of Content</div>'
});
```
This will produce the html version into `$el.data('toc').html`

**Display**:
```
that.toc.show(Application.regional({
    //use the generated html as another view's template
    template: $el.data('toc').html,
    actions: {
        goTo: function($btn, e){
            e.preventDefault();
            that.trigger('view:go-to-topic', $btn.data('id'));
        }
    }
}));
```


i18n/l10n
---------
Internationalization/Localization is always a painful process, making substitution dynamically to the strings and labels appear in the application according to the user locale settings can interfere with the coding process if every string must be coded with a `getResource('actual string')` wrapped around.

Luckily, Javascript is a prototypical language, we can extend the `String` class through its prototype and give every string a way of finding its own translation.


###Cast i18n on strings
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
Remember to use the `data-i18n-key` attribute to identify the content of a tag for translation. If you want to use the entire content text as a *big* key for the translation, use `data-i18n-key="*"`. If you use `data-i18n-key="efg"` to identify a tag, its content will be translated as if you were using string `efg`.


###Translation file
The translation files are needed to complete the i18n mechanism. We use a simple opt-in way of loading resource file for a given locale:
```
http(s)://your host'n'app/?locale=xx_XX
```
The query param **locale** in the url will tell the i18n mechanism to load a specific resource file.


####Format
Your translation file should be in the [JSON](http://json.org/) format, like this:
```
{
    locale: 'xx_XX',
    trans: {
        "string": "translation", 
        //or 
        "string": {
           "_default": "", //the default translation if not specifying namespace
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


###Configuration
You can configure where and what the i18n mechanism need to look for its required translation files through the I18N global variable:
```
I18N.configure({
    resourcePath: 'static/resource',
    translationFile: 'i18n.json'
});
```
The default settings will always look for `http://your host'n'app/static/resource/xx_XX/i18n.json`.


Themes
------
You can have multiple themes for an application and switch between them. The default theme will be the one that you set during `Application.setup()`. However, you can force the application to pickup other themes by:
```
http(s)://your host'n'app/?theme=xyz
```


###Theme structure
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

You should be focusing on changing the theme.less and variables.less files. Note that the *Bootstrap* .less files are *NOT* included in the framework package. Your LESS compiler might pop errors as it can not find the required `bootstrap.less` file. Go to `/implementation` and run `bower update` (you should have bower installed through [npm](https://www.npmjs.org/) first). It will fetch you the required *Bootstrap* package.


###LESS to CSS
(What's [LESS](http://lesscss.org/)?)

The `main.less` loads/glues all the above files and compiles into main.css, you do not need to compile the included .less files separately and put the compiled .css back into the `main.less`. The statically inlined css files are those that we want to copy into the compiled main.css without any change.

In any .less file you can @include (to merge with, to have) other .less/.css files and you can define styles using LESS or css as well. That's why `bootstrap.less` loads other style definition files but doesn't have its own definition, it is used solely as a glue file. `variables.less` is another extreme, it only contains LESS vars to be reused in other style definition files so you can override the basic styles with ease later.

One perk of using LESS is that you can define each .less to do only one thing, e.g:
* static.less - to copy static css files;
* vars.less - to define reusable css codes into variables;
* component.less - use styles loaded/defined in static.less/vars.less to define new css styles in a nested class format;
* main.less - glue(@include) the above .less files and let the compiler compile into main.css;


###Icons
If you can, always use bootstrap & font-awesome icon fonts included in the package.

If you need to have customized icons, please ask your designer for 64x64 or even 128x128 sized icon files in the *PNG* format. You can use the icon preparation tool to resize and combine them into a single CSS sprite package (icon.css, icons.png and a demo.html to show you css-class to icon mappings). Note that background image and texture images should *NOT* be combined into the CSS sprite. 

See the **Icon Prep** section below for more details.


###Preview page
There is a theme preview page at `[your theme folder]/index.html`. Change it to include more UI components and use it to demo your theme. `http(s)://[your host]/themes/[your theme]/`


Tools
-----
###Build & Deploy
Under `/tools/build/`, type in this command in console/terminal to build:
```
node build.js dist //find your built deployment under /tools/build/dist
```
You might need to change the `config.dist.js` file if you want to include more files in deployment.

By default, the `node build.js abc` command will look for `config.dist.js` and construct your deployment folder `abc` with folders and files accordingly.

Also by default, the build tool will grab the targeted index.html indicated by `config.dist.js` and scan through all the `<script>` tags to collect and combine the js codes.

Type this command to get more from the build tool:
```
node build.js -h
```


###Development Server
Under `/tools/devserver`, we provide you with a development web server that could help you serve both the `/implementation` folder and your built deployments. It can also monitor your theme folders and automatically compile `main.less` into `main.css`.

**Start** (under `/tools`)
```
npm start
```

**Configure**

Please see `/tools/devserver/profile/default.js`

**Extend**

You can add more bots, profiles and most importantly routers into the server. Just add them into the folders respectively, they will be automatically loaded. Routers added will be mounted and available for all web roots.

**Note**: By design, we only introduced *bots*(worker routine/processes), *profiles*(configures) and *routers* into the development server stack, you can also add *middlewares*, *dbs* and other stuff into the server.

Read more about [express.js](http://expressjs.com/) and [express-load](https://github.com/jarradseers/express-load) so you can make full use of this development server.


###Icon/Image Prep
Use `/tools/iconprep` to resize the icon files down to various sizes from 128x128 or 256x256 obtained from your designer. You can also record svg paths exported from their design tools.

Assume that you have put all the icons into `/implementation/themes/default/img/icons`:
```
//under /tools/iconprep type
node resize.js -S 16,32,48 ../../implementation/themes/default/img/icons
```
**Note**: You will need [ImageMagick](http://www.imagemagick.org/) to be installed on your machine.

Use `-h` to get more from `resize.js`
```
node resize.js -h
```

After resizing, use [glue](https://github.com/jorgebastida/glue) to combine them into a CSS sprites.

Option 1:
```
glue ../../implementation/themes/default/img/icons ../../implementation/themes/default/img/iconsprites --recursive --html (--less) 
```

Options 2: (recommended)
```
glue ../../implementation/themes/default/img/icons  --recursive --less --html --css=../../implementation/themes/default/less/ --img=../../implementation/themes/default/img/
```
Produces 1 big sprite with test page and less file in place.

Go read about [glue](https://github.com/jorgebastida/glue), it's an excellent tool to make CSS sprites.

**Note**: If you can, always use icon fonts (e.g Font-Awsome) instead of images for icons.

FAQs
----
###Include other js libraries
The default `dependences.js` contains carefully (minimum) selected libraries for your project, if you would like to introduce more, use [bower](http://bower.io/) and the `bower.json` file included.
Go into `/implementation` and run `bower install` to grab all the monitored 3rd-party libraries.

Include your libraries after `dependences.js` in `/implementation/index.html`.

**Tip:** 
Alternatively, you can always use a *CDN* (Content Delivery Network) to load the Javascript libraries into your index.html (e.g [jsDelivr](http://www.jsdelivr.com/)) However, this will affect the build process since these libraries will not be combined if they are not from local.


###What should I put in `/static`?
`/resource` should contain static resources per locale. (per xx_XX folder, `/default` for locale independent)


###Upgrade/Update
Download and replace `stage.js` to update the infrastructure through `bower`:
```
bower update stage
```


Appendix
--------
###A. Change log
see [CHANGELOG.md](https://github.com/bluekvirus/Stage.js/blob/master/CHANGELOG.md)


###B. Useful sites
####CDN
* [jsDelivr](http://www.jsdelivr.com/)

####MDN
* [CORS](https://developer.mozilla.org/en-US/docs/HTTP/Access_control_CORS) - crossdomain ajax support.
* [Web API](https://developer.mozilla.org/en-US/docs/Web/API)

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
* [Google Fonts](http://www.google.com/fonts/)/[Font Squirrell](http://www.fontsquirrel.com/) - web fonts

####Platform Options
1. HTML5, JS, CSS3 - Ubuntu OS, Firefox OS or Titanium/Cordova(PhoneGap)
2. C++ with Boost & Qt(+QML) - Ubuntu OS and General (Win, MacOS/iOS, Linux/Android)
3. Object-C & Java - iOS and Android
