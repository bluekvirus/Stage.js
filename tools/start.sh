#!/bin/bash

forever start -c nodemon ./devserver/run.js --exitcrash

echo 'devserver started'
