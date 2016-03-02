 /**
 * This is the export script for exporting static stuff from /tools/devserver
 *
 * Options
 * -------
 * 1. -D --data [dist], export data mockups (into JSON) from /devserver/data to [dist](default: ./exported)
 *
 * @author Patrick Zhu
 * @created 2016.03.01
 * 
 */
var program = require('commander'),
	_ = require('underscore'),
	fs = require('fs-extra'),
	path = require('path'),
	Mock = require('mockjs'),
	colors = require('colors'),
	/*function for recursively traverse the given folder*/
	walk = function(dir, current) {
	    var results = [],
	    	list = fs.readdirSync(dir),
	    	relative;
	    //check whether list empty
	    if(!list.length)
	    	return results;
	    //go through each element
	    list.forEach(function(file) {
	        file = path.join(dir, file);
	        var stat = fs.statSync(file);
	        if (stat && stat.isDirectory()){//element is directory, dive in
	        	relative = path.relative(path.join(__dirname, 'data'), file);
	        	//make dir for exporting
	        	fs.ensureDirSync(path.join(current, relative));
	        	results = results.concat(walk(file, path.join(current, relative)));
	        }
	        else//simple file element
	        	results.push(file);
	    });
	    return results;
	};

//setup parameters 
program
  .version('1.0.1')
  .option('-D, --data [output folder]', 'output data folder', path.join('.', 'exported', 'data'))
  .parse(process.argv);

//make export folder, if it does not exist
fs.ensureDirSync(program.data);

//read all the files
_.each(walk(path.join(__dirname, 'data'), program.data), function(data, index){
	var temp = require(data),
		relative = path.relative(path.join(__dirname, 'data'), data);//take out the relative
	//check whether mock data or not
	if( path.extname(relative) === '.js' ){//mock js file
		//replace .mock.js with .json
		fs.writeFile(path.join(program.data, relative.replace(/(\.mock\.js)/, '.json')), JSON.stringify(Mock.mock(temp), null, '\t'), function(err){
			if(err){
				return console.log(err);
			}
			console.log('[', 'exported'.green, '-', 'mock', ']', data);
		});
	}else{
		fs.writeFile(path.join(program.data, relative), JSON.stringify(temp, null, '\t'), function(err){
			if(err){
				return console.log(err);
			}
			console.log('[', 'exported'.green, '-', 'copy'.grey, ']', data);
		});
	}
});

