#!/bin/bash

forever start --uid stagejsv1dev --watchDirectory ./devserver -w -a ./devserver/run.js

echo 'devserver started'
