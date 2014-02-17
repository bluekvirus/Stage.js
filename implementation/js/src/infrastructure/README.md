Project Structure
=================
1. Library Overridden & Enhancement
2. Infrastructure


Library Overridden & Enhancement
--------------------------------
per lib


Infrastructure
--------------

###Core

####Data (APIs)
This is the data service/remote api interfacing registry

####Contexts
This is the context module registry/factory; (a context module is also instrumented with a .module() method for sub module registration)
Pure factory of sub-modules of a specific context (e.g the admin factory) should be put in that context's definition file. (invoked by app.Context.[your context].create())

####Parts (Editors, Widgets)
This is the widget(display, interaction)/editor(input, config) registry; (note that there are two registries, one for each and they are both registries of factories)

###Utils

###Main (Container)