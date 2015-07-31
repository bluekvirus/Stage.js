#!/bin/bash

forever start --uid stagejsv1dev -a -c nodemon ./devserver/run.js --exitcrash

echo 'devserver started'
