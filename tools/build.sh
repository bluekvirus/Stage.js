#!/bin/bash
cd ./build
#prepare version number with build number (commit count @HEAD -- current branch)
node tag.js
#build framework
node run.js -C framework-only -G ../../implementation/static/resource/default/download/stagejs-edge.tar.gz 'dist/framework'
rm -rf ../../dist
mv dist/framework ../../dist
#remove duplicated info files
rm ../../dist/*.md
rm ../../dist/LICENSE
#----------------------------
node run.js -C starter-kit -G ../../implementation/static/resource/default/download/stagejs-starter-kit.tar.gz 'dist/kit'
node run.js -C site 'dist/site'
exit 0