Theme Notes 
===========
[folder name is the theme's name, can be loaded by ?theme=...(default: _default)]

1. less/ 
-------
(this is where you put all the less files)
	- main.less is the only one your need to compile.
	- import the bootstrap less at the begining of main.less.
	- import other less parts (widget/style overrides) in main.less.


2. fonts/ 
--------
(this is where the web fonts go)
	- use 'dfontsplitter' tool if you have .dfont font collection pack instead of .ttf files.
	- use any online/offline converter to produce .eot(IE) and .woff web font files.
	- add the @font-face css block into less or css files of your theme.
	- tool [http://everythingfonts.com/] - converter and @font-face generator.
	- e.g
	```
		@font-face {
		font-family: 'flexslider-icon';
			src:url('fonts/flexslider-icon.eot');
			src:url('fonts/flexslider-icon.eot?#iefix') format('embedded-opentype'),
				url('fonts/flexslider-icon.woff') format('woff'),
				url('fonts/flexslider-icon.ttf') format('truetype'),
				url('fonts/flexslider-icon.svg#flexslider-icon') format('svg');
			font-weight: normal;
			font-style: normal;
		}
	```

3. img/ 
------
(this is where the images go, only export the sprites and css when build)
	- use 'glue' and /tools/iconprep to resize and concat into css sprites (with .css or .less icon class files)


4. css/ 
---------
(this is where the compiled main.css goes).
You should also put 3rd-party css files in here.


WARNING
=======

A. Web page to PDF using Phantomjs or wkhtmltopdf
-------------------------------------------------

You need to remove 
```
color: #000 !important; // Black prints faster: h5bp.com/s
background: transparent !important;
```
From bootstrap/less/reset.less in order for the `<i>` css sprites and background colors to work.
```
// Printing
// -------------------------
// Source: https://github.com/h5bp/html5-boilerplate/blob/master/css/main.css

@media print {

  * {
    text-shadow: none !important;
    color: #000 !important; // Black prints faster: h5bp.com/s - remove this!
    background: transparent !important; - remove this!
    box-shadow: none !important;
  }
  ...
}
```