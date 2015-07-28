#!/bin/bash

cd ./libprep
bower update
# bower list --path --json > map.json
node run.js all
