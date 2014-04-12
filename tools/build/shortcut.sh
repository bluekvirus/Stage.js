#!/bin/bash
# $1 version number
# $2 output folder
if [ -z $1 ]; then echo "You should at least follow the cmd with a version number (e.g 1.0.0.rc1)"; exit 1; fi
output=$2
if [ -z $output ]; then output="dist"; fi
node build.js -C starter-kit -G ../../implementation/static/resource/default/download/projs.$1.starter-kit.tar.gz $output
node build.js -C framework-only -G ../../implementation/static/resource/default/download/projs.$1.framework-only.tar.gz $output
node build.js $output
exit 0