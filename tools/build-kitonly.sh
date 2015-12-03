#!/bin/bash
cd ./build
#3. build starter-kit (folders, theme, tools, bower.json, package.json)
node run.js -C starter-kit -G ../../implementation/static/resource/default/download/stagejs-starter-kit.tar.gz 'dist/kit'
#----------------------------
#4. build documentation/demo site
node run.js -C site 'dist/site'
#----------------------------
exit 0