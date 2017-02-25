#!/bin/bash

forever start --uid "stagejsv1dev" --watch --watchDirectory ./devserver --append "./devserver/run.js" "default" "$@"

echo 'Server started through forever, with --uid stagejsv1dev and auto change reload.'
