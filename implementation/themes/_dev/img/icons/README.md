use 'glue' and /tools/iconprep to resize and concat into css sprites (with .css or .less icon class files)
e.g
```
	under /tools/iconprep
	node resize.js -S 12,26 ../../app/themes/_default/img/icons
```
then
```
	glue ../../app/themes/_default/img/icons ../../app/themes/_default/img/iconsprites --recursive --html (--less) 
```
or (recommended)
```
	glue ../../app/themes/_default/img/icons  --recursive --less --html --css=../../app/themes/_default/less/ --img=../../app/themes/_default/img/
```		
=> produces 1 big sprite with test page.