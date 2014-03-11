Pro.js
======
*An infrastructure for building modern web application with many contexts.*


Current Version
---------------
**@1.0.0-rc1**


Quick Start
-----------
###What's in the package

####Project structure
```
/design
	/assets
	/docs
/implementation -- your web root
	/js
	/themes
	index.html
/tools
	/build -- minify and concatenate your js files by scanning index.html
```

####Let's start
You start developing using *Pro.js* by creating a `main.js` (you are free to choose whatever the name you like) 
and include it in `/implementation/index.html` below the `<!--Main.js-->` comment line.

```
<script src="js/all.min.js"></script>
...  
<!--Main.js-->
<script type="text/javascript" src="js/main.js"></script>
...
```
**Note:** You can swap `all.min.js` with `all.js` in `/implementation/index.html` to have better debug information during development.

Minimun `main.js` script looks like this
```
;(function(app){
	
	app.setup().run();

})(Application);
```

###Mental preparation

###Development steps

###Unified API entry point

###Create a new theme



Include other js libs
---------------------
The default `all.js` contains minimum selected libs for your project [read the list], if you would like to introduce more, use `bower` and the `bower.json` file included.
Go into `/implementation/js/libs/tracked` and run `bower install` to grab all the monitored 3rd-party libraries.

Include your libs after `all.js` (or `all.min.js`) in `/implementation/index.html`.


What's in `/web+`?
-----------------
It contains template 404/500 pages and robot.txt if you need them.


Build for production use
------------------------
Before you start building your app for deployment, go into `/tools` and run `npm install` to grab all necessary 3rd-party Node.js modules.
Use `/tools/build` you need to change the config file if you want to include more files e.g `/static/*` in deployment.


Upgrade/Update
--------------
Download and replace `js/all.js` to update the infrastructure;
Use `bower update` to update other monitored libs you need;


Appendix
--------
###A. Philosophy behind
see PHILOSOPHY.md

###B. Change log
see CHANGELOG.md