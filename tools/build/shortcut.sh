#!/bin/bash
# $1 version number
# $2 output folder
#if [ -z $1 ]; then echo "You should at least follow the cmd with a version number (e.g 1.0.0.rc1)"; exit 1; fi
#output=$2
#if [ -z $output ]; then output="dist"; fi
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