/**
 * This is the extension manager, used to extend the 'module' 
 * (or 'widget' maybe) component in a way that doesn't affect the generated
 * ones.
 *
 * Use 'Extender.module('name', {...})' to override or extend certain module.
 *
 * *Note* that given the design principle behind 'widget's, extensions done
 * to these components can use the .extend() method in place whenever needed
 * instead of using this extension manager to put modification to the definitions.
 *
 * @author Tim.Liu
 * @update 2013.03.26
 */

(function(app){

	var module = app.module('Extend');
	/**
	 * Get deep nested property by a 'string key'.
	 * e.g. A.B.c.def.g or A[2].b.c[3].d
	 */
	var _getByKeyStr = function(obj, keyStr){
	    keyStr = keyStr.replace(/\[(\w+)\]/g, '.$1'); // convert indexes to properties
	    keyStr = keyStr.replace(/^\./, '');           // strip a leading dot

	    var objTrace = keyStr.split('.');
	    var target = obj;
	    while (objTrace.length) {
	        var i = objTrace.shift();
	        if (i in target) { //recurse down the attr path.
	            target = target[i];
	        } else {
	            return;
	        }
	    }
	    return target;
	}		

	module.module = function(name, options){
		_.each(options, function(val, key){
			var target = _getByKeyStr(app[name], key);
			if(target){
				//extend its prototype.
				_.extend(target.prototype, val);
			}else{
				//the last bit of key is not yet initialized
				//which means the key is an option key inside 
				//a component's definition in this module.
				//We do NOT bother developers with the component
				//name here, we will try to hookup with the 'nearest'
				//one.
				var listOfParentObjs = key.split('.');
				var tails = [];
				try{
					while(!target && listOfParentObjs.length > 0){
						tails.unshift(listOfParentObjs.pop());
						key = listOfParentObjs.join('.')+'.prototype.'+tails.join('.');
						target = _getByKeyStr(app[name], key);	
					}
					if(tails.length <= 0) throw new Error('!');
					_.extend(target, val);
				}catch(e){
					app.error('Extender Error', name, ' when overriding ', key);
				}
				
				
			}
		});
	};

})(Application);