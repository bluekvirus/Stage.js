Build & Deploy Pro.js Project Site
==================================
Whenever a change needs to be published, do the following:

Steps
-----
1. Build Pro.js Framework
```
node build.js -C framework -G ../../implementation/static/resource/default/download/projs.1.0.0rc.tar.gz dist
```
[change the build number if needs be]


2. Build Pro.js Project Site
```
node build.js dist
```


3. Serve dist through a web server

Shell Script
------------
Here is a shell script to do it all. 
```
#!/bin/bash
# $1 version number
# $2 output folder
if [ -z $1 ]; then echo "You should at least follow the cmd with a version number (e.g 1.0.0.rc1)"; exit 1; fi
output=$2
if [ -z $output ]; then output="dist"; fi
node build.js -C framework -G ../../implementation/static/resource/default/download/projs.$1.tar.gz $output
node build.js $output
exit 0
```

The above script is saved into `./shortcut.sh`