#Web Application Client Side Common Libs#

##Usage##
1. Install using bower ```bower install```
2. Install build tool support ```npm install```
3. prepare the lib map ```bower list --path > map.json```
4. fix lib map in ```map-fix.json```
5. Build some of the libs ```node buildify.js all```

Then select from ```/bower_components```

Note that the build script here is not to build the whole project like the build package in client. It is used only for merging contents of some of the libs pulled by bower.