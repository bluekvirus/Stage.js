Stage.js <sub class="text-muted" style="font-size:36%">based on Marionette.js</sub>
======
*Building multi-context rich-client web applications in the modern way.*
[@Tim (Zhiyuan) Liu](mailto:bluekvirus@gmail.com)


Current version
---------------
**@1.0.0-release**
([Why is it version-ed like this?](http://semver.org/))


Introduction
------------
The framework is made on top of **Backbone.Marionette** and **Bootstrap**. The goal is to maximize developer efficiency by introducing an intuitive workflow on top of a solid application structure. You will be focusing on user interaction building without distraction. Theming and deployment are also a breeze through our tools.

To flatten and lower the initial learning curve of adaptation, we restrict ourselves to only the following APIs:

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

Handle Data:
* Application.remote (options)

**Remember:** Your goal is to
* Create view objects. 
* Put them into pre-defined layout regions. 
* Make them talk to each other through events.
* Group them into purposeful(topic related) swap-able contexts.

Please use **events** as much as possible in place of direct method invocations (possible situations: in-view, view-view, view-context, view-application) for maximum extensibility. 

###Why not using...
Why not using AngularJS/EmberJS/Meteor or YUI/ExtJS? Yes you can, but, if you can, **always favor libraries over frameworks**. Given that *Stage.js* is also a framework. The advise here should be extended to: 
> If you can *NOT* agree with the workflow/abstraction, always favor libraries over frameworks.

We choose what we choose when designing this framework simply because we want total control over our product. There are often 2 types of framework to choose from when developing a web application:
* Development Framework - AngularJS/EmberJS/Meteor (infrastructure only)
* Application Framework (All-in-One) - YUI/ExtJS (infrastructure plus widgets and tools)

**The Backbone library can implement them all** (Yes, any client side framework). (Not 100% for Meteor though, since Meteor combines its server into a full-stack solution. You need nodejs in the picture, and we do have a package called **ajax-box** for just that based on the [express.js](http://expressjs.com/4x/) framework). And, if you need more evidence, YUI3 has the exact same concepts in Backbone implemented as its infrastructure. 

In order to accomplish more with lesser code using Backbone, we picked Backbone.Marionette as our pattern library. It offers cleanup/boilerplate routines and very neat concepts for building large Javascript front-end projects. The resulting framework accomplishes all the big frameworks have promised but with **a thiner and flatter structure**. We believe scripting languages are always going to be the perfect thin glue layer between mechanisms and policies. The Javascript language were picked to glue HTML/CSS and UX but nothing more, it should not be overdosed and attempt to mimic Java. In other words, **only the burger is important**:

<img src="static/resource/default/diagram/Diagram-6.png" alt="HTML is the burger" class="center-block"></img>


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

We also maintain a list of 3rd party libraries for the developers to choose from in addition to the base libraries (as utilities). The utility libraries (e.g jquery-file-upload, store.js, uri.js, raphael.js, marked, moment.js, socket.io.js...) are carefully selected from the many open-source Javascript libraries out there to help with specific but generally-will-appear problems that a developer will encounter during the web application development process. (see more in the **Include other js libraries** chapter)

**Remember:** The goal of this framework is to assist you to make better use of *Marionette* (thus *Backbone*) by adding a conventional workflow, a toolset and an useful application container around. It is designed to keep you focused on building dynamic views without worrying about putting/linking/organizing them into a manageable whole. It is very important that you understand the 4 types of views (*ItemView, Layout, CollectionView and CompositeView*) offered by the *Marionette* pattern library.

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

**(-)**: means the folder is empty initially, it is created as a suggestion.

Use the project-kit distribution whenever you want to start a production level web application project.

####Release pack
> * /js
> * /themes
> * index.html

The release-pack distribution. It is designed to be lightweight and doesn't have tools and theme packages for production level development. The release-pack folder is serve-able out of the box.

You can always use this distribution for prototyping your next product concept, or to keep your project core up-to-date.

**Note**: The release-pack distribution is what you will get from the bower package manager when using the `bower install/update stage.js` command.


###Quick steps
Here is the recommended **workflow**. You should follow the steps each time you want to start a new project with *Stage.js*. We assume that you have downloaded the *Stage.js* project-kit now and extracted to your project folder of choice.


####Let's start (preparation)
Open up your console/terminal on your OS and do the following:
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
and include it in `/implementation/index.html` below the `<!--main.js-->` comment line:
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

If you are really in a hurry to see some stuff on the page, give your application a template:
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
    baseAjaxURI: 'your base url for using Application.remote()'
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
By using `region=""` attribute in any html tag, we marked pre-defined regions in the template, **you can also do this with any *Marionette.Layout*** in our framework. They are already enhanced to pickup the attribute. Doing so is equivalent of using the `regions:{}` property in a *Marionette.Layout*.

Note that **you can use an additional `view=""` attribute to load up a named *Regional* view in a given region**, only tags marked with `region=""` first will continue to verify if there is an assigned *Regional* view (by name) through the `view=""` attribute.

Now, given that you've changed the template, you need to also change `contextRegion` to point to the area that you use to swap between different *Context*s. Recall that there can only be 1 active *Context* on the context region at any one time.

If your application is a single-page application, you probably don't need more than one *Context*, in such a case, you don't need to assign the application template. There will always be a region that wraps the whole application -- the *app* region. You can define your *Context* without a `name` property, this will register the *Context* to be the **Default** one. The **Default** *Context* will automatically show on region *app* if you did not specify `contextRegion` and `defaultContext`.

Now we've marked our context region, let's proceed to define them through our well organized APIs in the following sections.

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
You can still use the `region=""` and `view=""` attributes in the template. 

Note that you should name your *Context* as if it is a *Class*. **The name is important as it links the *Context* with the global navigation mechanism**. 

The `onNavigateTo` method is the `context:navigate-to` event listener. This event will get triggered if the application switched to `MyContextA` on the context region, so that you can do some *in-context* navigation followed by. (e.g if the navigation is at `#navigate/MyContextA/SubViewA...`, `SubViewA` will be the subpath argument)

Now, with a *Context* defined, you will need *Regional*s to populate its regions.

####Step 3. Define Regionals
Before creating a *Regional*, change your `myContextA.js` into `/context-a/index.js` so you can start adding regional definitions into the context folder as separate code files. Always maintain a clear code hierarchy through file structures. (You don't need to if you can be sure that the `myContextA.js` file will not exceed 400 lines with all the *Regional* code added.)

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
You can still use the `region=""` and `view=""` attributes in the template.

Note that you should name your *Regional* as if it is a *Class*. **The name is important if you want to use the auto-regional-loading mechanism through the `view=""` attribute in any *Marionette.Layout***. 

By default, any *Regional* you define will be a *Marionette.Layout*, you can change this through the `type` option.

By default, `Application.regional(['you regional view name',] {...})` returns the **definition** of the view, if you want to use the returned view **anonymously**, remove the `name` argument. You will get an **instance** of the view definition to `show()` on a region right away. 

Sometimes your *Regional* is comprised of other sub-regional views and that's fine, you can nest *Regional*s with the `region=""` and `view=""` attributes in the template (**only if it is of `type: Layout`**). There will also be time when you just need plain *Marionette.xView* definitions to be used as item views within *Regional*s. You can do it like this:
```
Application.view({
    type: '...', //ItemView, Layout, CollectionView or CompositeView
    ..., //rest of normal Marionette.xView options
}); 
```
The above call returns a **definition** of the view. If you want an **instance** to be returned, do it like this:
```
Application.view({...}, true);
```

Now, we've sketched the layout of our application, you might want more contexts defined before continue but that's the easy part, just repeat Step 1-2 till you are ready to proceed to stream in remote data to light-up the views.

####Step 4. Handle data
Though we do not agree with *Backbone*'s way of loading and persisting data through *Model/Collection*s. We do agree that **data** should be the central part of every computer program. In our case, the remote data from server are still used to power the dynamic views we have defined. We use *Backbone.Model/Collection* only when there is a *View*. In other words, *data* and *View*s are centric in our framework paradigm, *Model/Collection*s are not. Try to think of them as a integrated part of *View*s. 

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
You can now render through remote data in a view without mentioning *Model/Collection* like this:
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
By using an event `view:render-data`, we eliminate the need of handling data rendering through *Model/Collection* in a view. Note that we've used a meta-event programming concept here. The next section will contain detailed explanation on this topic in the **Events** subsection. You do *NOT* need to implement the listener for this event unless you want the data rendering process to be different. 

Data returned should be in the [JSON](http://json.org/) format and with `Content-Type: application/json` in its response headers. An JSON Array will be converted into a *Collection* before given to the view, Object into a *Model*. You can trigger `view:render-data` whenever you want to change the underlying model and collection in a view instance. The `reset`, `change`, `add` and `remove` events are listened by the view and it will re-render accordingly.

**Note:** If you use `view:render-data` and pass in an `Array`, it will **reset** the collection of that view. 

####Step 5. Adding UI/UX
UI is a set of interface elements for the user to click/interact through when performing desired tasks. Without these click-ables, your web application will just be a static page. UX stands for user experience, it is not just about look'n'feel but also transitions/animations that links between interactions and state change. UI/UX are hard to design, without a clear think-through over the purposes and targeted user tasks, it can be a total chaos... Make sure you have had your plan/sketch reviewed by targeted audience/friends or colleagues before implementation. Employ the *Goal-Directed Design* technique as much as you can.

To implement your design is, however, very easy. We have enhanced *Marionette.View* thus its sub-classes (*ItemView, Layout, CollectionView and CompositeView*) with opt-in abilities, you can use them while adding user interactions and view transitions to the application.

Though you can add any transition to any view, it is recommended to add interaction listeners only to parent (or outer most) view in general so the event delegation can be efficient.

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
Actions are click-ables marked by `action=""` attribute in your view template. The original way of registering events and listeners introduced by *Backbone.View* are flexible but tedious and repetitive. We offer you *Action Tags* instead to speed things up when implementing user interactions. 

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
            _bubble: false | true, //if you want un-matched action tags' click event to bubble up to parent container. [optional]
            'opA': function($triggerTag, e){...},
            'opB': ...
        }
    });
})(Application);
```
Note that only 'single-click' actions can be registered like this at the moment. 

Use `_bubble: true` if you want the click event to **propagate** to the parent view/container. `e.preventDefault()` needs to be specified in the action listeners if you don't want a clicking on `<a href="#xyz" action="another"></a>` tag to affect the navigation.

#####Inputs
We have already prepared the basic html editors for you in the framework. You don't have to code `<input>, <select> or <textarea>` in any of your view template. Instead, you can activate them in any *Marionette.xView* like this:
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

#####Graphs
We support graphs through SVG. A basic SVG library is integrated with the framework (Raphaël.js). You can use it in any *Marionette.xView* through:
```
Application.view({
    svg: true,
    onShow: function(){
        if(this.paper) 
            //draw...
        else 
            this.onPaperReady = function(){
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
app:navigate (contextName, moduleName) - Application.onNavigate [pre-defined]
app:context-switched (contextName)  - [empty stub] - triggered after app:navigate
//the followings are triggered by Application.remote():
app:ajax - Application.onAjax [pre-defined]
app:success - [empty stub]
app:error - [empty stub]
app:ajax-start - Application.onAjaxStart [pre-defined]
app:ajax-stop - Application.onAjaxStop [pre-defined]
//triggered by window
app:resized - [empty stub]
app:scroll - [empty stub]
```
* Context -- context:meta-event
```
context:navigate-to (moduleName) - [empty stub] - triggered after app:navigate
```
* Marionette.xView -- view:meta-event
```
view:render-data (data) - onRenderData [pre-defined]
//Do NOT use an Array as data in a ItemView/Layout with this event.
```

Remember, you can always trigger a customized event `my-event-xyz` and implement it later on the object by creating `onMyEventXyz()`.

Though you can not yet use meta-event on Marionette.Regions, there is a  convenient one for you:
```
//region:load-view
anyregion.trigger('region:load-view', name[, options]);
```
The `region:load-view` event listener is implemented for you and can search through both the *Regional* and *Widget* registry to find the view by name and show it on the region. You can pass in addition factory options to the event trigger if they are for a *Widget*. 

Recall that you can use `view=""` in a template to link a *Regional* to a region to show as well, but it will *NOT* search through the *Widget* registry for finding the view definition, due to the difficulties of putting widget options into the `view=""` marked tags.

Don't know what a *Widget* registry is? Keep reading.

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


####Build & Deploy
Under your project root, type in command-line `/tools/build/node build.js dist` to build. (You might need to change the `config.dist.js` file if you want to include more files in deployment).


###Widgets/Editors
To make your view definitions reusable, we offer a way of registering *Widget*s and *Editor*s:
```
//Widget name can be used in region:load-view meta event trigger
Application.widget/editor('MyWidget/EditorName', 
	function(){
		var View;
		_.extend(View, {
			...
		});
		return View;
	}
)
```
It is recommended to employ the **List'n'Container** technique when creating *Widget*s. Note that basic *Editors* are already provided for you. If you need more editors please register them while providing the `getVal`, `setVal`, `validate` and `status` methods.

**Important:** Do *NOT* use `onShow()` in your editor definition. Use `onRender` instead so that your editor can support the `editor=""` template attributes for dynamic positioning.

Note that you will need some sub-views to help compose the *Widget/Editor*, use the short-cut we provide to define them for better extensibility in the future:
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

To instantiate an *Editor*, use either `editors:{}` within a view or :
```
Application.editor('MyEditorName', {
	..., //rest of the init options, don't pass in a config named 'factory'.
})
```

####List'n'Container technique
This is the golden technique to use when planning your reusable views or, say, any view on screen. Any widget on screen can be decoupled into lists and containers, like this:

<img src="static/resource/default/diagram/Diagram-5.png" alt="List'n'Containers" class="center-block"></img>

* Starts by choosing a proper container with desired layout, nest containers if needs be.
* Put lists into the container.
* Figure out the view to show within each list item.

You can always nest another layer of container-list-item into an item of parent layer to form even more complex views. Make sure you use the `Application.view(options)` API when defining the list item views.

**Important**: *Do NOT* use `Application.regional()` unless it is the outer most view for a region. Use `Application.view()` if defining Widgets/Editors.

####Datagrid
...

####Tree
...

####Paginator
...

####Overlay
...


###i18n/l10n
Internationalization/Localization is always a painful process, making substitution dynamically to the strings and labels appear in the application according to the user locale settings can interfere with the coding process if every string must be coded with a `getResource('actual string')` wrapped around.

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
Remember to use the `data-i18n-key` attribute to identify the content of a tag for translation. If you want to use the entire content text as a *big* key for the translation, use `data-i18n-key="*"`. If you use `data-i18n-key="efg"` to identify a tag, its content will be translated as if you were using string `efg`.

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

You should be focusing on changing the theme.less and variables.less files. Note that the *Bootstrap* .less files are *NOT* included in the framework package. Your LESS compiler might pop errors as it can not find the required `bootstrap.less` file. Go to `/implementation` and run `bower update` (you should have bower installed through [npm](https://www.npmjs.org/) first). It will fetch you the required *Bootstrap* package.

####LESS to CSS
(What's [LESS](http://lesscss.org/)?)

The `main.less` loads/glues all the above files and compiles into main.css, you do not need to compile the included .less files separately and put the compiled .css back into the `main.less`. The statically inlined css files are those that we want to copy into the compiled main.css without any change.

In any .less file you can @include (to merge with, to have) other .less/.css files and you can define styles using LESS or css as well. That's why `bootstrap.less` loads other style definition files but doesn't have its own definition, it is used solely as a glue file. `variables.less` is another extreme, it only contains LESS vars to be reused in other style definition files so you can override the basic styles with ease later.

One perk of using LESS is that you can define each .less to do only one thing, e.g:
* static.less - to copy static css files;
* vars.less - to define reusable css codes into variables;
* component.less - use styles loaded/defined in static.less/vars.less to define new css styles in a nested class format;
* main.less - glue(@include) the above .less files and let the compiler compile into main.css;

####Icons
If you can, always use bootstrap & font-awesome icon fonts included in the package.

If you need to have customized icons, please ask your designer for 64x64 or even 128x128 sized icon files in the *PNG* format. You can use the icon preparation tool to resize and combine them into a single CSS sprite package (icon.css, icons.png and a demo.html to show you css-class to icon mappings). Note that background image and texture images should *NOT* be combined into the CSS sprite. 

See `/implementation/themes/README.md` for more details.

####Preview page
There is a theme preview page at `[your theme folder]/index.html`. Change it to include more UI components and use it to demo your theme. `URL://[your host]/themes/[your theme]/`


FAQs
----

###Include other js libraries

The default `dependences.js` contains carefully (minimum) selected libraries for your project, if you would like to introduce more, use [bower](http://bower.io/) and the `bower.json` file included.
Go into `/implementation` and run `bower install` to grab all the monitored 3rd-party libraries.

Include your libraries after `dependences.js` in `/implementation/index.html`.

**Tip:** 
Alternatively, you can always use a *CDN* (Content Delivery Network) to load the Javascript libraries into your index.html (e.g [jsDelivr](http://www.jsdelivr.com/)) However, this will affect the build process since these libraries will not be combined if they are not from local.


###What should I put in `/static`?

* `/resource` should contain static resources per locale. (per xx_XX folder, `/default` for locale independent)


###Upgrade/Update

Download and replace `stage.js` to update the infrastructure through `bower`:
```
bower update stage
```


Appendix
--------
###A. Moving away from ExtJS
We have been developing in ExtJS4 for 2+ years, starting form the last version of 4.0.x which is the promising 4.0.7. As our knowledge base expands, we felt that it is time to form our own blueprint of a modern data heavy web application to shorten the development cycles. Here are some of the main reasons:

1. Although it is relatively fast to develop prototypes using an all-in-one framework like ExtJS, it is hard to maintain the code while keeping up with the changes required by the users and those that come from Sencha. The widgets are bound too tightly with the framework.
2. Loading, DOM interfacing, Widget and Application containers are all provided with a biased opinion, which always leads to fighting with the framework here and there or messing around with the life-cycles defined when trying to implement application specific user requirements. 
3. Performance issues. There are often a massive amount of unnecessary DOM elements lurking in the client browser. We have very limited control over the life-cycles nor the HTML template structure of the components. Making widgets as Classes and loading like Java is really a bad idea for Javascript.
4. Theming difficulties. It is hard to theme an ExtJS application correctly given the extensively nested component structure and the lack of SASS/Compass adaptation among developers.
5. Payed solution. The commercial version of ExtJS and the tools (IDE) are expensive. This also makes the community size smaller than its full/free open source counterparts, making it difficult to find solutions from resources other than the documentation.

If the above listing can not convince you, try to compare the ExtJS solutions to the web application building process with ours: (Strict MVC vs View centric)

0. Classes vs 4 types of general view;
1. Containers vs General in-template regions;
2. Layouts vs Dynamic grid system;
3. Thick data layer vs A single remote() API;
4. Single Viewport vs Switchable Contexts;
5. Controllers vs Generic events and view actions;
6. XTemplate vs Handlebars;

The one thing that ExtJS could not get right and still is getting wrong is that it tries to use Javascript like JAVA and dominating HTML/CSS manipulation. It casts the developers out to a changed problem domain where basic problems are taken cared of in a complicated/overkilled way so that the programs can be written like *piles of configure files*. 

The *Class* system confuses developers coding in Javascript's function scope, the heavy *Layout* system kills what HTML/CSS is designed for and good at, the thick *Data* layer tries to isolate data snapshot from their in-separable views and the *Controllers* pulls developers out into another place to define routines just to have the listeners wired back again into the views. All of these ignores the fact that the core of a web application is at HTML(client-side) and the data(server side), not the glue and state snapshots. (Well, maybe in 5.0 they can fix it, we have high hope on this...)

Whatever you do, *Do NOT* stack up abstraction layers over layers so further programs can be written like configuration files. It will be slow to run, even harder to change and incur a very steep learning curve for new comers...

We choose to move away from this heavy framework to avoid its complexity and downside and to have more control over the component life-cycles, interactions and application container separately. An equally powerful yet still lightweight solution combining the best practices in the field is thus made. 

###B. Rules of Thumb
####General
* Keep things simple, especially the simple ones.
* Categorization before abstraction.
* Separate, Reuse and Pipeline.
* Cleaner method signature. Options as a single object parameter.
* Events for collaborations instead of APIs. Promises for asynchronous operations instead of callbacks.

Start with user requirements/stories and focus on serving the customers' need. Use the 80/20 rule to pick out important features/functionalities and implement them first. Gradually refine code and documentation later. Remember to write down **why** before **how** in the code comments. !FOCUS!

####GUI
* Concision - exact but nothing more
* Expressiveness - allow useful possibilities be deducted
* Ease - low mnemonic load on commands, control sequence
* Transparency - low mnemonic load in user's mind for keeping track of states/layers of task at hand
* Script-ability - batch-able, automate-able


###C. Change log
see CHANGELOG.md

###D. Useful sites
####MDN
* [CORS](https://developer.mozilla.org/en-US/docs/HTTP/Access_control_CORS) - crossdomain ajax support.
* [Web API](https://developer.mozilla.org/en-US/docs/Web/API)

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
* [Google Fonts](http://www.google.com/fonts/)/[Font Squirrell](http://www.fontsquirrel.com/) - web fonts

####Platform Options
1. HTML5, JS, CSS3 - Ubuntu OS, Firefox OS or Titanium/Cordova(PhoneGap)
2. C++ with Boost & Qt(+QML) - Ubuntu OS and General (Win, MacOS/iOS, Linux/Android)
3. Object-C & Java - iOS and Android
