Stage.js
===================
<img src="http://img.shields.io/bower/v/stage.js.svg?style=flat" alt="Current Version"></img> <img src="http://img.shields.io/badge/supports-Cordova-3B4854.svg?style=flat" alt="Supports Cordova"></img> <img src="http://img.shields.io/badge/supports-ASGI-44B78B.svg?style=flat" alt="Supports ASGI"></img>

[Change Log](CHANGELOG.md) - What's changed?

To get version, type `app.stagejs` in the console. Example output:
```
app.stagejs (1.10.x-<commits> build <timestamp>)
```
You can compare this version number with the one you see on the [documentation site](http://bluekvirus.github.io/Stage.js/#navigate/Document) and see if an upgrade is recommended.

**Announcement**: v1 api spec will be published soon with updated doc/demo site. There is also an `-ng` branch development. A preview is available here at ([-ng plan](#whats-next)). Please note that v1 will **NOT be abandoned** even if `-ng` is released, they are implemented with different tech direction and code organization, but same exposed apis.

> <sup>\*</sup>The v1 branch serves as a benchmark for creating tests for features/apis and for feedback gathering. We have now successfully released 6 web/cloud products offering intuitive control panels, complex monitoring dashboards, online/offline reports and excellent user interactions with full localization support. More will come. 

This project produces **Stage.js** - an infrastructure for building modern web application client with different contexts (e.g a data-heavy administration app). In other words, we solve this problem for you:

<img src="implementation/static/resource/default/diagram/Diagram-1.png" alt="UI/UX Problems" class="center-block"></img>


Quick Start
------------
<a href="https://www.npmjs.org/package/stage-devtools"><img src="http://img.shields.io/npm/v/stage-devtools.svg?style=flat-square" alt="DevTools Version"></img></a> 

Use the devtools to get started quickly.
```
1. Prep

npm -g install stage-devtools
stagejs env

2. Start

mkdir <project dir>
cd <project dir>
stagejs init
stagejs theme
stagejs serve [--port <number>]
```
You can now start developing your app with Stage.js. Read the [command-line devtool](https://www.npmjs.com/package/stage-devtools) for more.


How-to
------
Again, as an application developer you are encouraged read this [documentation](http://bluekvirus.github.io/Stage.js/#navigate/Document)


Contribute to framework
-----------------------
Fork/Clone the project and tweak the code locally, then contribute by making a pull request so you can push the change in.

### Prepare
After cloning the project, you should go to `/tools` and run these commands:
```
0. Check your development environment (yes, you can still use the cli tool in this step)

stagejs env

1. Prepare npm packages

npm install

2. Prepare bower packages

./lib-prep.sh

3. Prepare doc site theme packs (under ./themeprep)

node run site

4. Fire up dev server (background logging by forever)

./start.sh [profile] [port]

5. Check dev server logs

forever logs

```
This should fire-up the development server. It will serve the `/implementation` folder as web root on the port define by `/tools/devserver/profile/default`. Please go check the content of this profile config file before starting. It has some nice middlewares and auto-change-detectors there you can switch on/off to make the development a lot easier.

### Develop, Demo & Test
Change code under `/implementation/js/src` to contribute your ideas to this framework.

Change the code under `/implementation/js/site` to test your ideas, it is the application for **Stage.js**'s documentation site and it also holds all the tests and demos.

Look closely at the `/implementation/index.html` file, it not only defines the loading sequence of all the js files but also defines which one goes to which build profile (framework, site) and bag target (all.js, stage.js) in the build process. `/implementation/starter-kit.html` goes into the starter-kit build as `index.html`. There is only 1 html file for loading the js/css files (which is `index.html`) the reset of `*.html` are templates and are loaded by the js view objects upon application runtime. This is the way of the single-page applications.

### Modify base theme in framework
`/implementation/themes/default` is the base theme package used whenever developer use `stagejs theme <name>`. Although it is often not necessary to modify this base theme. You can still improve it if you have a better idea or more UI components added into the framework that need styling. 

Follow instructions in the `/less/main.less`. You can easily switch to use other themes based on Bootstrap 3 or quickly build up your own. (check out themes offered by [bootswatch](http://bootswatch.com/))

You can start a new theme by using the theme-prep tool under `/implementation/tools/themeprep`. Note that this is the same as using the command-line tool `stagejs theme <name>` in your own projects. But since this is the framework project itself, the command-line tool can not be of assistance here. Chicken'n'Egg thing.

As in your own projects, themes will be automatically watched and recompiled each time your *.less file changes.

**Important**: If you see any of the `*.less` file contains `@import url("...")` it is better to remove them before you compile the theme. Try to bring that piece to local code base. (e.g Host the web-font yourself)

**Note**: All `@import url("...")` lines which contains string `fonts` will be removed. If you don't know how to bring google webfonts to local, use [google-webfonts-helper](https://github.com/majodev/google-webfonts-helper).

### Build everything
```
0. Change the version numbers

CHANGELOG.md
tools/libprep/bower.json
(README.md, HOWTO.md are updated automatically.)

1. Update libs & bower release version

tools/lib-prep.sh

2. Build framework, starter-kit & doc site

tools/build.sh tag
```


What's in `-ng`?
------------
[:crystal_ball: Preview current progress](https://github.com/bluekvirus/Stage.js-ng/tree/master/libs/vendor/stagejsv2).

`-ng` Roadmap:
* Build a lightweight framework core from scratch; (:heavy_check_mark:)
* Handshake (Full-Async) mode for view init/data/nesting; (:heavy_check_mark:)
* Remove theming/templating deps on Bootstrap (easy to hook your own); (:heavy_check_mark:)
* Port custom-made DevOps process pipeline onto Gulp; (:heavy_check_mark:)
* Optional AMD support; (:heavy_check_mark:)
* Optional ECMAScript6 (2015-2016) support; (:heavy_check_mark:)
* Optional reactive view building; (two-way bindings, like MVVM) (:heavy_check_mark:)
* WebRTC integration for peer-to-peer data/stream sharing; (in progress)
* Give View action listeners a choice to go background (Web Worker) (:heavy_check_mark:));
* Introduce state machine into Views (app.ee(), (:heavy_check_mark:));
* Local filter/sort/pagination in Views (v1 has remote version only, (:heavy_check_mark:));


License
-------
Copyright 2013 - 2017 Tim Lauv. 
Under the [MIT](http://opensource.org/licenses/MIT) License.

