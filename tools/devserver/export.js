  /**
 * This is the export script for exporting the data in /tools/devserver/data to the destination folder specified by user(default ./exports).
 * 
 * --If the original data is mock data, this script runs the mocking script and export a .json file instead.
 *
 */
var program = require('commander'),
	_ = require('underscore'),
	fs = require('fs-extra'),
	path = require('path'),
	Mock = require('mockjs'),
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
	        	if(!fs.existsSync(path.join(current, relative)))
	        		fs.mkdir(path.join(current, relative));
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
  .option('-D, --data [output folder]', 'Add options for data folder', path.join(__dirname, 'export'))
  .parse(process.argv);

//make export folder, if it does not exist
if( !fs.existsSync(program.data) )
	fs.mkdir(program.data);

//read all the files
_.each(walk(path.join(__dirname, 'data'), program.data), function(data, index){
	var temp = require(data),
		relative = path.relative(path.join(__dirname, 'data'), data);//take out the relative
	//check whether mock data or not
	if( path.extname(relative) === '.js' ){//mock js file
		//replace .mock.js with .json
		fs.writeFile(path.join(program.data, relative.replace(/(\.mock\.js)/, '.json')), JSON.stringify(Mock.mock(temp)), function(err){
			if(err){
				return console.log(err);
			}
			console.log(data + ' has been exported.');
		});
	}else{
		fs.writeFile(path.join(program.data, relative), JSON.stringify(temp), function(err){
			if(err){
				return console.log(err);
			}
			console.log(data + ' has been exported.');
		});
	}
});

