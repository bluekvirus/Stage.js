Core Modules
============
A core module should only be a registry, factory or a mix of the two for basic elements of app building. There are 3 core modules atm:

1. contexts.js
--------------
This is the context module registry/factory; (a context module is also instrumented with a .module() method for sub module registration)

2. data-units.js
----------------
This is the model/collection registry/factory; (for easier server entity integration, with server data route config)

3. parts.js
-----------
This is the widget(display, interaction)/editor(input, config) registry; (note that there are two registries, one for each and they are both registries of factories)


By Design
=========
Pure factory of sub-modules of a specific context (e.g the admin factory) should be put in that context's definition file. (invoked by app.Context.[your context].create())