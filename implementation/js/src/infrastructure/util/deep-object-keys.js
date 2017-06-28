/**
 * app.extract('keypath', from); 
 * 		1). extracts a pair of key:value from an object based on the keypath('a.b.1.c.....') given by user;
 * 
 * app.pack({keypathObj}, to); 
 * 		1). sets a key in an object to the intended value based on the keypath&value pair({'a.b.1.d....': val1, 'x.y.z...': val2}) given by user;
 * 	 	2). a number in the key path will be treated as an array index unless the previous key in the 'keypath' has already been defined;
 * 	 	3). values of keys along the keypath will be overwritten unless they accommodate the keypath structure given by user;
 *
 * @author Tim Lauv, Patrick Zhu
 * @created 2017.06.22
 */

;(function(app){

	app.Util.deepObjectKeys = {

		//selectn (dotted.key.path.val.extraction from any obj)
		extract: function(keypath, from){
			return selectn(keypath, from);
		},

		//pack, opposite to extract
		pack: function(keypathObj/*{keypath: vale, ...}*/, to){

			//guard to see if keypathObj is an plain object
			if(!to || !_.isObject(to))
				throw Error('DEV::Application::Util::pack(): the second argument should be an object, which includes a plain object, an array and a function!');

			//sort the keys in keypathObj since browers do not necessarily sort the object by the order of keys
			var sortedKeys = _.sortBy(_.keys(keypathObj)); //_.sortBy sorts in natural alphabetical order(number is less than letter), if not specified.

			//traverse all the keypaths and modified the object accordingly
			_.each(sortedKeys, function(key){

				//get the value from original keypathObj
				var val = keypathObj[key],
				//key path array
					keypathArr = key.split('.'),
				//make a reference
					tempObj = to; 

				//loop through keys, until there is no more element in the array
				while(keypathArr.length > 1){
					//1). current key does not exist insert a new key based on the type of the next key OR
					//2). current key only has a single value but keypath is deeper
					if(
						!tempObj[keypathArr[0]] || 
						(tempObj[keypathArr[0]] && !_.isObject(tempObj[keypathArr[0]]) && keypathArr[1])
					){
						//no need to check next key if this is the last one
						if(keypathArr.length > 1){
							//check whether the next key can be parsed as an Interger
							if(!parseInt(keypathArr[1]))//cannot parse(parseInt returns NaN(falsy) when it cannot parse), object
								tempObj[keypathArr[0]] = {};
							else//can parse, array
								tempObj[keypathArr[0]] = [];
						}
					}
					//refer tempObj to the new layer
					tempObj = tempObj[keypathArr[0]];
					//through out the current key
					keypathArr.shift();
				}

				//assign the value
				tempObj[keypathArr[0]] = val;

			});

			//return the target object
			return to;
		}

	};

})(Application);