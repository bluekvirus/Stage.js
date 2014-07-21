/**
 * This is the theme assets preparation tool to:
 *
 * 1. Gather font files from bower_components into [theme]/fonts
 * 2. Process logo & icons & pics - merge them into [theme]/img/sprite.png & [theme]/less/img.less
 * 3. Process texture - collect them into [theme]/less/img.less too (textures can't be put into sprite?)
 * 4. Build *.less into /css/main.css
 *
 * Usage
 * -----
 * Refreshing the /css, /fonts & /img folder content of a certain theme with the latest changes. 
 *
 * Note
 * ----
 * Use ./helpers/resize.js to resize the logo/icon or even pics before running this preparation sequence.
 *
 * Theme structures, one based on the other, in sequence:
 * 
 * Theme Assets
 * ------------
 * * Fonts
 * * Texture
 * * Pics
 * * Icons
 * * Logo
 *
 * Theme Base (Vars)
 * ----------
 * * Colors
 * * Sizes (border, border-radius, font, shadow)
 * * Gaps (padding/margin)
 *
 * Theme Elements (Reuse vars as much as possible)
 * --------------
 * * Containers (wrapper, header, footer)
 * * Components
 *
 * Make sure you follow the sequence when changing theme designs.
 *
 * @author Tim.Liu
 * @created 2014.07.21
 * 
 */

var program = require('commander'),
_ = require('underscore'),
fs = require('fs-extra'),
path = require('path'),
hammer = require('../shared/hammer.js'),
lessc = require('../shared/less-css.js'),
colors = require('colors');
_.string = require('underscore.string');

program
	.version('0.1.0')
	.usage('[options] <theme name>')
	.option('-B --base <path>', 'themes base folder, default to ../../implementation/themes/', '../../implementation/themes/')
	.option('-L --lib <path>', 'library base folder, default to ../../implementation/bower_components/', '../../implementation/bower_components/')
	.option('-F --fonts [names]', 'font packages to collect /fonts from, default to [bootstrap, fontawesome, open-sans-fontface]', ['bootstrap', 'fontawesome', 'open-sans-fontface'])
	.parse(process.argv);

//check target theme name, default to 'default'
var theme = program.args[0];
if(!theme) {
	theme = 'default';
}
var themeFolder = path.join(__dirname, program.base, theme);
console.log('Preparing Theme:'.yellow, theme);

//0. ensure theme folder structures
hammer.createFolderStructure({
	structure: {
		css: {},
		fonts: {},
		img: {
			icons: {},
			logo: {},
			pics: {},
			texture: {}
		}
	},
	clear: false,
	output: themeFolder
}, function(){

	//1. collect /fonts from lib packages into base/[theme]/fonts
	var fontsFolder = path.join(themeFolder, 'fonts');
	_.each(program.fonts, function(name){
		fs.copySync(path.join(__dirname, program.lib, name, 'fonts'), path.join(fontsFolder, name));
		console.log('[Font]'.yellow, name, '==>'.grey, fontsFolder + '/' + name);
	});

	//2.pre - you might what to use the ./helpers/resize.js to resize the images in /logo, /icons and /pics of /img
	//2. process the /img folder to produce sprite.png (logo, icons, pics) and img.less (+ texture)
	

	//3. build the /css/main.css from /less/main.less
	lessc(themeFolder);


});
 
