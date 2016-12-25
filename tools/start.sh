#!/bin/bash

forever start --uid "stagejsv1dev" --watchDirectory ./devserver -w -a ./devserver/run.js

echo 'Server started through forever, with --uid stagejsv1dev and auto change reload.'
