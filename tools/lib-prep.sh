#!/bin/bash
cd ./libprep
#0. prep 2 bower.json
node run.js prep-bower
#1. update
bower update
#2. re-pack, re-vision --> deps.js and bower.json for dist
node run.js fix-libs
#3. move lib/addon default css into /themes/default/css/addon-defaults.css
node run.js collect-css
