Mental preparation
------------------
> Technique means nothing if people have no purposes in their mind. To prepare mentally to adapt something is to synchronize the mind around the subject domain so that insights can be developed while applying the technique. The ultimate goal is always to understand the subject (in our case the problem) better.

> Make sure to ask enough questions, so you can quickly locate the core problem that a given technique is trying to solve efficiently. Then go apply the technique and try making changes. Soon enough, you will start to see things like the solution creator, and concepts and ideas start to come out naturally. True understanding is almost always developed this way.

If you can not agree with the author after reading the following sections in this chapter, do not bother with this framework.

###Define the problem
Before start, you need to understand what is a *GUI application*, here is a brief diagram (casted upon the web realm):

<img src="static/resource/default/diagram/Diagram-1.png" alt="Web App Diagram" class="center-block"></img>

The client and server sides are different in purpose fundamentally. Thus, they should be designed and implemented differently. **Do NOT mix them**. Shutting this door will preserve a significant amount of coding/maintenance energy for the application developer(s). The best software development practice encourages separation and delaying of implementation of related components so that each part can vary independently later. And to the author, abstraction should happen after categorization (or say, classification). This is why we are advising the developers *NOT* to make an overly encapsulated framework with tools that try to bridge the gaps. Trying to control everything using central planning is a human flaw, there is no silver-bullet for trying to solve web application building in 1 piece. It will always 3 parties in the software application world.

As an engineer, the job is to find insights and solve problems between the 3 parties efficiently (profitably if you must insist...) so that the software/application serving the above system comes out correctly. This is hard. Specifically, You need to resolve 2 kinds of problem different in nature: *Interaction* and *Data Flow* in order to produce an application.
A successful one requires both parts to employ careful design and feasible technique. We illustrate the *Interaction* problem's technical side here, since the framework is more about supporting a good design with cleaner implementation:

<img src="static/resource/default/diagram/Diagram-2.png" alt="UI/UX Problems" class="center-block"></img>

As you can see from the above diagram, there are 3 problems here to address when implementing a UI/UX side for an application:
1. Data <i class="fa fa-arrows-h"></i> Model/Collection [snapshot]
2. Model/Collection [snapshot] <i class="fa fa-arrows-h"></i> View (UI)
3. View <i class="fa fa-arrows-h"></i> Layout/Page + Transitions (UX)

Failing to address any of the 3 parts above will cost the project a significant amount of refractory time. Do *NOT* skip or trying to merge them into one big abstraction. Conquer each one with a consistent API style (like parameters and naming conventions) then combine the result. A complete system is never a destination, it is only a state of being or appearance. In other words, anytime you want your solution appear to be *a complete one*, focus on identifying the key problems and then solve them. Do *NOT* set your goal to be *a complete system* when start.

So, how do we form our solution?

###Solution architecture
As a full stack solution to the UI/UX side, we address those 3 problems with an intuitive architecture:

<img src="static/resource/default/diagram/Diagram-3.png" alt="Stage.js Architecture" class="center-block"></img>

####What's Navigation?

We achieve client-side multi-page-alike navigation through switching *Context*s on a pre-defined application region by responding to the URL fragment change event. (e.g #navigate/Context/...)

####What's a Context?
A *Context* is a special *Marionette.Layout* view object. *Context*s only appear on the application's context region (each application can have only 1 such region). If you have more than 1 *Context*s defined, they will automatically swap on the context region in response to the navigation event. You will not have more than 1 active *Context* at any given time.

alias: Page

####What's a Regional?
A *Regional* is a *Marionette.xView* (*ItemView, Layout, CollectionView and CompositeView*) with name, it is to be shown on a region in template of your application or any *Marionette.Layout* instance. As you can see, since a *Context* is a *Layout* with extra functions, *Regional*s will be used closely with it. You can link a *Regional* with a *Context* by putting the *Regional*'s name in the *Context*'s template. Read more about *Regional* in the **Quick steps** section.

alias: Area

####Remote data handling?
Modern web application generates views according to user data dynamically. This is why we picked *Backbone/Marionette* as our implementation base -- to use dynamic views rendered through data. Plus, there is no doubt about wiring in remote data into your application through *Ajax* now. However, the way we handle remote data in our framework is a bit different than the original design in *Backbone*.

**Important:** We introduce a unified *DATA API* for handling all the in/out of remote server data, skipping the *Model/Collection* centered way of data manipulation. *Model/Collection* are only used as dumb data snapshot object on the client side to support views. The goal is to make the data interfacing layer *as thin as possible* on the client side. You will find more details in the **Quick steps** section.

####Reuse view definitions?
As *Design Patterns* dictates, we need to code in a way to:

<img src="static/resource/default/diagram/Diagram-4.png" alt="Design Pattern Goals" class="center-block"></img>

For *Regional*s (or any *Marionette.xView*) that you need to use again and again but with different configuration (e.g a Datagrid). Register it as a *Widget* or, in case of a basic input, an *Editor*. These reusable view definitions are call *Reusable*s in the framework. Think in terms of the **List and Container** technique as much as possible when creating them.

####Glue through events
We encourage event programming in this framework. We glue views into a functioning whole by using meta-events. Whenever an interaction or transition happens (e.g navigation, context-swap, login, error, data-ready...), intead of calling the actual *doer*s, fire/trigger an event first, so that later the actual behavior triggered by this event can be changed without affecting the glue/interfacing logic. Read carefully through the **Events** subsection in **Quick steps** below so you understand how to implement and extend application behaviors mainly through events. 

####Seems complicated...
To focus, think of your application in terms of *Context*s and *Regional*s (pages and areas). Like drawing a series of pictures, each page is a *Context* and you lay things out by sketching out regions (areas) first on each page then refined the details (*Regional*) within each region. 

Use *Model*/*Collection* wisely, try not to involve them before relating to any *Marionette.xView*. That is to say, fetch/persist data through the unified *Data API* (CRUD in RESTful format). Unless you want a dynamic view, do **NOT** use *Model*/*Collection* to store and operate on the data. Focus on UI/UX and make the data interfacing with server as thin as possible.