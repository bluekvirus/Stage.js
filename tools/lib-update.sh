#!/bin/bash
cd ./libprep
#1. update
bower update
bower list --path --json > map.json
#2. re-pack, re-vision --> deps.js and bower.json for dist
node run.js all
