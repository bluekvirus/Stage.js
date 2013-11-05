The Framework
=============
The client side app framework is still under active development, so the current upgrade process demands a bit efforts.

Upgrade
-------
(make sure you save these when upgrading the client app framework)
```
1. scripts/
    a. config.js
	b. modules/
		(yours only)
	c. widgets/
		(yours only)
	d. try/

2. index.html

3. static & themes/
	(yours only)
```

Update 
------
(if you don't need to upgrade to pick up new app structure and tools, can simply update these files only)
```
scripts/
	base.js (base.js.gz)
	infrastructure.js
```

Plan
----
We will improve the update/upgrade process in future development.


Include other js libs
---------------------
The default base.js contains selected libs for the project, if you would like to introduce more cd into `/app/libs`
then `bower install && npm install` - you need to know how to use bower tho.
include the lib your need in `index.html` from `bower_components`

###buildify.js
This is for building and combining required libs into a base-lib.js (before combined into the base.js with project specifics by `/tools/spawn`).
Check its content for sample usage. If you don't want the base.js we prepared for you, this is where to start from scratch.


Build for production use
------------------------
Use `/tools/build` you need to check the config file `config/app.js` (though, default should be good and ready)
`node build.js app` will build your client app into `/tools/build/dist/app`
Use attribute `non-core="true"` in the `<script>` tag within your index.html, if you don't want some scripts to be built into the big all-in-one js.


Prepare icon css sprites or svg paths
-------------------------------------
see `/app/themes/_default/README.md`


Spawn Projects from current code base
-------------------------------------
Config `/tools/spawn`
```
config/ - has the folder structure settings for newly spawned projects.
indices/ - has the index.html files used for each of the spawned project.
```
then `node spawn.js [your config name]`

Warning::

1. If the app framework changes, please re-check the indices and configs before spawning new projects from the current code base.

2. You can **NOT** spawn from a spawned project, it will only have the build tool (and the dev support tools e.g the iconprep tool).


Note 0.8.1 web client app framework 
-----------------------------------
...


Trouble Shooting
================

gitlab_ci fix: 
--------------
###1. Allow guest ssh to clone repo in build
(since we might have changed the host name during gitlab installation.)

`sudo su - gitlab_ci -c "ssh-keygen -R [your host name or ip, e.g: 172.22.4.24]"`

or

`sudo su - gitlab_ci -c "ssh git@[your host name or ip, e.g: 172.22.4.24]"`

and then accept to add host to known hosts.

###2. build script format
`cmd1 && cmd2 && cmd3 && ... && cmd4 &`

Do **NOT** hang the build script, use `&` if needs be or avoid at all times.