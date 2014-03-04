The Framework
=============
ProJS.Client - an infrastructure for building modern web application with many contexts


Version
-------
1.0.0-rc1


Quick Start
-----------




Include other js libs
---------------------
The default libs.js contains selected libs for the project, if you would like to introduce more cd into `/app/libs`
then `bower install && npm install` - you need to know how to use bower tho.
include the lib your need in `index.html` from `bower_components`


Upgrade/Update
--------------
Download and replace `js/all.js` to update the infrastructure;
Use `bower update` to update other monitored libs you need;


Build for production use
------------------------
Use `/tools/build` you need to check the config file `config/app.js` (though, default should be good and ready)
`node build.js app` will build your client app into `/tools/build/dist/app`
Use attribute `non-core="true"` in the `<script>` tag within your index.html, if you don't want some scripts to be built into the big all-in-one js.


