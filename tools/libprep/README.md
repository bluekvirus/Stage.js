#Web Application Client Side Common Libs#

##Usage##
1. Install using bower ```bower install```
2. prepare the lib map ```bower list --path --json > map.json```
3. fix lib map in ```map-fix.json```
4. Build some of the libs ```node run.js all```

Note that the run script here is used for merging `dependencies.js`. Also it helps generate `bower.json` for stage.js bower package and `starter-kit.bower.json`.

##bower.json##
The `bower.json` here is the real bower control of this project. The `bower.json` you saw in the root folder is generated from this one.

* devDependencies - dep libs for generating `js/lib/dependencies.*`
* themeDependencies - libs to add to starter-kit.bower.json: dependencies
* monitored - libs to add to starter-kit.bower.json: open-source-libs
* dependencies - libs used in this project (test/documentation site)

You can see that this project not only generate the framework, starter-kit and also the test/documentation site.

Note that the `bower.json` in the root folder (the one that used to register stage.js to bower) doesn't contain the `themeDependencies` as `dependencies`, they are only contained in the starter-kit's bower.json since only starter-kit has the theme build tool.