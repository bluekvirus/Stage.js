Stage.js
===================
<img src="http://img.shields.io/bower/v/stage.js.svg?style=flat" alt="Current Version"></img> <img src="http://img.shields.io/badge/supports-Cordova-3B4854.svg?style=flat" alt="Supports Cordova"></img>

[Change Log](CHANGELOG.md) -
```
app.stagejs ==> 1.7.7-814 build 1421895707471
```

**Announcement**: Please note that next release (v1.7.8) will be the last stable release of the 1.x branch. The coming 1.7.8 release is also an LTS* (long term support - 18-month) version of this framework. We are now working on the 2.x branch site and development preparation. A complete feature listing in terms of user stories will be available soon. [Preview the plan](#whats-next)

*LTS - Given that ECMAScript6 is coming and our goal of making a lightweight, time-saving and most importantly **easy** framework for both desktop web and hybrid application development. Further improvements and simplifications will be made directly into the v2 codebase through es6 without disturbing the v1.7 branch. 
The LTS version also serves as a benchmark for creating tests and for feature-list and feedback gathering. We have now successfully released 2 security products with complex configure panels/dashboards and excellent user flows & localizations through the v1.7 branch. More will come after we improve & finalize the charting and testing workflow in v2. 

This project produces **Stage.js** - an infrastructure for building modern web application client with many contexts (e.g a data-heavy administration app). In other words, we solve this problem for you:

<img src="implementation/static/resource/default/diagram/Diagram-1.png" alt="UI/UX Problems" class="center-block"></img>


Quick Start
------------
<a href="https://www.npmjs.org/package/stage-devtools"><img src="http://img.shields.io/npm/v/stage-devtools.svg?style=flat-square" alt="DevTools Version"></img></a> 

Use the devtools to get started quickly.
```
npm -g install stage-devtools
mkdir project
cd project
stagejs init
stagejs serve [--port <number>]
```
You can now start developing your app with Stage.js. Read the [documentation](http://bluekvirus.github.io/Stage.js/#navigate/Document) for more.


Documentation
-------------
Again, as an application developer you are encouraged read this [documentation](http://bluekvirus.github.io/Stage.js/#navigate/Document)


What's next?
------------
2.0.0 Roadmap:
* Merge Context, Regional, Widget, Editor and Canvas to be generic named Views;
* Refine the navigation and layout region concepts;
* Introduce state into views;
* Give view action listeners a choice to go background;
* Remove deps on Marionette.js, jQuery UI Core to have a lightweight core;
* Websocket support for messaging/notification through Primus;
* Support progressive & reactive app building concept; (but no two-way binding)
* Breaking basic editors implementation;
* Simpler server stack through Loopback;
* Pipelining dev process through Brunch;
* Test automation through Mocha + Chai (BDD);
* ...

optional:
* local filter/sorter mech into list views; 
* local pagination mech into list views (in addition to the remote one we already have);
* Datagrid+ : select-all header/cell, details row;
* Editor+ : Spinner/Range, Switches, DnD Listing;


Contribute
----------
Fork/Clone the project and tweak the code locally, then contribute by making a pull request so you can push the change in.

###Prepare
After cloning the project, you should go to `/tools` and run these commands:
```
//1. prepare bower packages
//under /tools/libprep
bower install
bower update
node run all

//2. prepare default theme pack
//under /tools/themeprep
node run default
node run site

//3. prepare npm packages
//under /tools
npm install

//4. fire up dev server
//under /tools
[sudo] npm start
```
This should fire-up the development server. It will serve the `/implementation` folder as web root on the port define by `/tools/devserver/profile/default`. Please go check the content of this profile config file before starting. It has some nice middlewares and auto-change-detectors there you can switch on/off to make the development a lot easier.

###Develop, Demo & Tryout
Change code under `/implementation/js/src` to test and contribute your ideas to this framework.

The `/implementation` folder is also the product intro & download page of **Stage.js** releases. You can go change the code under `/implementation/site`, it is the application for **Stage.js**'s documentation site.

Look closely to the `/implementation/index.html` file, it not only defines the loading sequence of all the src files but also defines which one goes to which build target in the build process.

###Modify theme
Please go check the `/implementation/themes/default` basic theme package and follow instructions in the `/less/main.less` over there. You can easily switch to use other base themes offered by [bootswatch](http://bootswatch.com/) (based on Bootstrap 3) to quickly build up your own.

You can always refresh existing theme or start a new one by using the theme-prep tool under `/implementation/tools/themeprep`.

###Commit Info
Use the following `git` command to see some brief info about repo commits
```
git log --abbrev-commit --pretty=oneline -n 5
git rev-list HEAD --count
```


Distribute
----------
###Build
```
//0. change version numbers
a. CHANGELOG.md and libprep/bower.json
b. README.md, HOWTO.md (optional, can be through http://shields.io/)

//1. update libs through tools/libprep/
bower update
node run all

//2. [optional] update themes through tools/themeprep/
node run 
node run site

//3. build all distributions through tools/build
./shortcut.sh
```

###Deploy
See in `tools/build/dist` and `dist` for details. The shortcut command also builds the project site (as its github page).


License
-------
Copyright 2013 - 2015 Tim (Zhiyuan) Liu. 
Under the [MIT](http://opensource.org/licenses/MIT) License.

