#Web Application Client Side Common Libs#

##Usage##
1. Install using bower ```bower install```
2. prepare the lib map ```bower list --path --json > map.json```
3. fix lib map in ```map-fix.json```
4. Build some of the libs ```node run.js all```

Then select from ```/bower_components```

Note that the build script here is not to build the whole project like the build package in client. It is used only for merging contents of some of the libs pulled by bower.