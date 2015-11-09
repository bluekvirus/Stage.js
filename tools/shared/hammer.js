/**
 * This is the structure hammer that is shared between tools to create folder structures
 * according to a js object as structure blueprint.
 *
 * =======
 * Options
 * =======
 * required:
 * 		structure - folder blueprint 
 *   	src.root - input base
 *    	output - output folder
 * optional:
 * 		cachedFiles - in memory file content
 *
 * @author Tim Lauv
 * @created 2013.09.25
 */

var buildify = require('buildify'),
_ = require('underscore'),
path = require('path'),
fs = require('fs-extra'),
merge = require('merge-dirs'),
gzip = require('../shared/gzip'),
colors = require('colors');


module.exports = {

	//create structure with pre-processed in memory files.
	createFolderStructure: function(options, done) {

		options = _.extend({
			structure: {}, //see config
			src: {
				root: '.'
			},
			cachedFiles: {},
			clear: true
		}, options);

		var targets = [];
		var baseDir = options.output;

		//prepare the structure description map
		_.each(options.structure, function(content, key){
			targets.push({
				path: path.join(baseDir, key),
				content: content,
				key: key
			});
		});
		
		//use iteration - bfs to create/copy/dump the files/folders
		function iterator(done){
			if(targets.length > 0) {
				var currentTarget = targets.shift();
				if(_.isBoolean(currentTarget.content)){
					//true/false - dump from cached files
					if(options.cachedFiles[currentTarget.key]){
						buildify().setContent(options.cachedFiles[currentTarget.key]).save(currentTarget.path);
						if(currentTarget.content) //if boolean says true, we gzip it.
							gzip.compress(currentTarget.path);
					}else {
						console.log(currentTarget.key, 'not found in cache'.red);
					}
					iterator(done);
				}else {

					//copy worker
					function copy(p, cb){
						var srcPath = path.join(options.src.root, p);
						fs.copy(srcPath, currentTarget.path, function(error){
							if(!error) console.log(srcPath, '==>'.grey, currentTarget.path, '[OK]'.green);
							else console.log(srcPath, '==>'.grey, currentTarget.path, '[ERROR:'.red, error, ']'.red);
							if(cb)
								cb(currentTarget.path);
						});
					}

					if(_.isString(currentTarget.content)){
						//'' create blank file, '...' path string - copy
						if(currentTarget.content === ''){
							fs.ensureFile(currentTarget.path, function(error){
								if(!error) console.log(currentTarget.path, '+'.grey, '[OK]'.green);
								else console.log(currentTarget.path, '+'.grey, '[ERROR:'.red, error, ']'.red);
								iterator(done);
							});
						}
						else
							copy(currentTarget.content, function(){
								iterator(done);
							});

					}else if(_.isArray(currentTarget.content)){
						//multiple string - merge
						copy(currentTarget.content.shift(), function(distPath){
							_.each(currentTarget.content, function(p, index){
								merge(path.join(options.src.root, p), distPath);
								console.log(p, '+=>'.grey, distPath, '[OK]'.green);
							});
							iterator(done);
						});

						
					}else if(_.isObject(currentTarget.content)){
						//{} and {...} create folder and keep the bfs going
						fs.ensureDir(currentTarget.path, function(error){
							if(!error) {
								console.log(currentTarget.path, '{+}'.grey, '[OK]'.green);
								_.each(currentTarget.content, function(subContent, subKey){
									targets.push({
										path: path.join(currentTarget.path, subKey),
										content: subContent,
										key: subKey
									});
								});						
							}
							else console.log(currentTarget.path, '{+}'.grey, '[ERROR:'.red, error,']'.red);
							iterator(done);
						});
					}					
				}
			}else 
				done();
		}

		//clear base dir.
		if(options.clear) {
			fs.removeSync(baseDir);
			console.log('Output Dir Cleared:'.green, baseDir);
		}
		console.log('Creating Folders & Files...'.yellow);
		
		//create baseDir again and create the folder structure.
		fs.ensureDir(baseDir, function(err){
			if(err) console.log('ERROR:'.red, err);
			else iterator(done);
		});
		
	}	

};