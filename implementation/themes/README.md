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