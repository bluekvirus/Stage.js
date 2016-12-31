/**
 * This is the theme assets preparation tool to:
 *
 * 1. Gather font files from bower_components into [theme]/fonts
 * 2. Process logo & icons & pics - merge them into [theme]/img/sprite.png & [theme]/img/img.less
 * 3. Process texture - collect them into [theme]/img/img.less too (textures can't be put into sprite!)
 * 4. Build *.less into /css/main.css
 * 5. Create a new theme based on theme 'default'
 *
 * Usage
 * -----
 * Refreshing the /css, /fonts & /img folder content of a certain theme with the latest changes. 
 * or
 * Create a new theme based on theme 'default'.
 *
 * Theme structures, one based on the other, in sequence:
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
 * @author Tim Lauv
 * @created 2014.07.21
 * @updated 2014.07.31
 * @updated 2016.12.18 (Patrick.Zhu)
 * 
 */

var program = require('commander'),
_ = require('underscore'),
fs = require('fs-extra'),
path = require('path'),
hammer = require('../shared/hammer.js'),
lessc = require('../shared/less-css.js'),
colors = require('colors'),
nsg = require('node-sprite-generator'),
glob = require('glob'),
os = require('os');
_.string = require('underscore.string');


////////////Temp Solution(transit to stage-devtools)/////////////
var implFolder = '../../implementation';
/////////////////////////////////////////////////////////////////

program
	.version('0.1.0')
	.usage('[options] <theme name> or ls')
	.option('-B --base <path>', 'implementation base folder, default to ' + implFolder, implFolder)
	.option('-F --fonts [package,package,...]', 'Bower packages to collect /fonts from, default to bootstrap, open-sans-fontface and fontawesome', function(v){
		return v.split(',').map(function(p){
			return _.string.trim(p);
		});
	}, ['bootstrap', 'open-sans-fontface', 'fontawesome'])
	.option('-S --sprites [folder,folder,...]', '/img/? folders to include in the sprite.png, default to icons, logo, pics', function(v){
		return v.split(',').map(function(f){
			return _.string.trim(f);
		});
	}, ['icon', 'logo', 'pic'])
	.option('-M --main <path>', 'default path for the main less file', 'main.less')
	.parse(process.argv);

//check target theme name, default to 'project' (transit to stage-devtools)
var theme = program.args[0] || 'project';
var themesBase = path.join(_.string.startsWith(program.base, path.sep)?'':__dirname, program.base, 'themes');
var libFolder = path.join(themesBase, '..', 'bower_components');
var themeFolder = path.join(themesBase, theme);
var baseTheme = 'default',
baseThemeFolder = path.join(themesBase, baseTheme);

//allow listing of theme folders
if(theme === 'ls'){
	var tNames = _.map(fs.readdirSync(themesBase), function(t){
		t = path.join(themesBase, t);
		if(fs.statSync(t).isDirectory() && fs.existsSync(path.join(t, 'less')))
			return path.basename(t);
	});
	console.log('Available themes:'.yellow, _.compact(tNames).join(', '));
	return;
}

console.log('Preparing Theme:'.yellow, theme);
console.log("The path of the primary less file is set to ".yellow + "'" + program.main + "'");
if(!fs.existsSync(themeFolder)){
	console.log('Creating new theme from'.yellow, baseTheme, '==>', theme);
	if(!fs.existsSync(baseThemeFolder)) {
		console.log('[Error:] We can NOT create the new theme for you since the base theme'.red, baseTheme.yellow, 'can NOT be found'.red);
		return;
	}
	fs.ensureDirSync(themeFolder);
	fs.copySync(path.join(baseThemeFolder, 'less'), path.join(themeFolder, 'less'), {
		filter: function(name){
			if(_.string.endsWith(name, '/less/components.less') || _.string.endsWith(name, '/less/vars.less'))
				return false;
			return true;
		}
	});
}
else {
	console.log('Theme already there, creating _ref from'.yellow, baseTheme);
	//fs.copySync(path.join(baseThemeFolder, 'less'), path.join(themeFolder, 'less', '_ref'));
}


//0. ensure theme folder structures
hammer.createFolderStructure({
	structure: {
		css: {},
		fonts: {},
		img: {
			icon: {},
			logo: {},
			pic: {},
			texture: {},
			'img.less': ''
		}
	},
	clear: false,
	output: themeFolder
}, function(){

	//1. collect /fonts from lib packages into base/[theme]/fonts
	var fontsFolder = path.join(themeFolder, 'fonts');
	_.each(program.fonts, function(name){
		fs.copySync(path.join(libFolder, name, 'fonts'), path.join(fontsFolder, name));
		console.log('[Font]'.yellow, name, '==>'.grey, fontsFolder + '/' + name);
	});

	//2.pre - you might want to resize the images in /logo, /icon and /pic under /img first
	//2. process the /img folder to produce sprite.png (logo, icons, pics) and img.less (+ texture)
	console.log('[Tip:'.yellow, 'You might want resize /img/icons folder content before making css-sprite here'.grey,']'.yellow);
	//2.1 make sprite.png and img.less
	console.log('[CSS Sprite]'.yellow, 'processing', program.sprites, 'and /texture under /img', '(.png files only)'.yellow);
	
	var iconClassPrefix = 'custom',
	imageFolder = path.join(themeFolder, 'img'),
	registry = [], //remember the sprite image elements
	lessFilePath = path.join(imageFolder, 'img.less');
	jsonFilePath = path.join(imageFolder, 'img.json');
	examplesFilePath = path.join(imageFolder, 'index.html');
	
	var imgFolderGlobs = _.map(program.sprites, function(folder){ return path.join(imageFolder, folder, '**/*.png'); });
	if(_.every(imgFolderGlobs, function(g){
		return glob.sync(g).length === 0;
	})){
		//jump to 3. build the /css/main.css from /less/main.less
		lessc(themeFolder, program.main);
		return;
	}

	var breakNameRegex = new RegExp('[\\' + path.sep + '@' + ']');
	nsg({
	    src: imgFolderGlobs,
	    spritePath: path.join(imageFolder, 'sprite.png'),
	    stylesheetPath: lessFilePath,
	    layout: 'packed', //> 0.9.0
	    layoutOptions: {
	        padding: 5
	    },
	    compositor: 'gm', //we use GraphicsMagick
	    stylesheet: 'css',
	    stylesheetOptions: {
	        prefix: iconClassPrefix,
	        spritePath: '../img/sprite.png',
	        nameMapping: function(fpath){
	        	// if(os.type() === 'Windows_NT')
	        	// 	fpath = fpath.split('/').join(path.sep);
	        	var name = fpath.replace(imageFolder, '').split(breakNameRegex).join('-');
	        	name = path.basename(name, '.png');
	        	registry.push(iconClassPrefix + name);
	        	console.log('found:', '[', name.grey, ']');
	        	return name;
	        },
	        //pixelRatio: 1
	    }
	}, function(err){
		if (err) throw err;
		else console.log('[CSS Sprite]'.yellow, 'done'.green, '==>'.grey, lessFilePath);

		//2.2 scan /texture and merge with img.less
		glob('**/*.png', {
			cwd: path.join(imageFolder, 'texture')
		}, function(err, files){
			_.each(files, function(t){
				//iconClassPrefix-texture {
				//	background-image: url('../img/texture/' + t);
				//}
				t = path.sep + t;
				var name = ['-texture', path.basename(t.split(breakNameRegex).join('-'), '.png')].join('');
				fs.appendFileSync(lessFilePath, [
					'','/*texture*/',
					['.', iconClassPrefix, name].join('') + ' {',
					'\tbackground-image: url(\'../img/texture' + t + '\');',
					'}'
				].join('\n'));
				registry.push(iconClassPrefix + name);
				console.log('found:', '[', name.grey, ']', '(texture)');
			});

			//2.3 produce img.json to describe img.less for demo purposes
			fs.writeFile(jsonFilePath, JSON.stringify(registry));

			//2.4 produce img.html to demo icon usage examples (a table)
			var html = '<head><link rel="stylesheet" type="text/css" href="img.less"></head>';
			html += '<body style="background: #DDD;"><h1>Sprite Icons & Textures</h1><table><tr style="text-align:left;"><th>CSS class</th><th>Preview</th><th>Usage <small>(i must be display:block/inline)</small></th></tr>';
			_.each(registry, function(icon){
				html += '<tr><td>' + icon + '</td><td style="padding:0.5em;"><i style="display:block;' + (/-texture-/.test(icon)?'width: 200px; height: 64px;':'') + '" class="' + icon + '"></td><td>' + _.escape('<i class="'+ icon +'"></i>') + '</td></tr>';
			});
			html += '</table></body>';
			fs.writeFile(examplesFilePath, html);

			//3. build the /css/main.css from /less/main.less
			lessc(themeFolder, program.main);
		});			
	});
});