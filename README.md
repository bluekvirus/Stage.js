The Framework
===
The client side app framework is still under active development, so the current upgrade process demands a bit efforts.

Upgrade
---
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
---
(if you don't need to upgrade to pick up new app structure and tools, can simply update these files only)
```
scripts/
	base.js (base.js.gz)
	infrastructure.js
```

Plan
---
We will improve the update/upgrade process in future development.


Spawn Projects from current code base
---
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
---
...


Trouble Shooting
===

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