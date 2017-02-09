#!/bin/bash
cd ./build

echo ' '
if [ $1 = "tag" ]; then
#1. prepare version number with build number (commit count @HEAD -- current branch)
	node tag.js
fi
#----------------------------
#2. build framework and edge pack
node run.js -C framework-only -G ../../implementation/static/resource/default/download/stagejs-edge.tar.gz 'dist/framework'
rm -R ../../dist
mv dist/framework ../../dist
#remove duplicated info files
rm ../../dist/*.md
rm ../../dist/LICENSE
#----------------------------
#3. build starter-kit (folders, theme, tools, bower.json, package.json)
node run.js -C starter-kit -G ../../implementation/static/resource/default/download/stagejs-starter-kit.tar.gz 'dist/kit'
#----------------------------
#4. build documentation/demo site
node run.js -C site 'dist/site'
#----------------------------

#echo back the build tag before exit
node tag.js --echo
echo ' '
exit 0