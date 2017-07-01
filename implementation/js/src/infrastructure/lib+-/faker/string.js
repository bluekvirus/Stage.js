/**
 * Custom random string generating function for faker/app.mock
 * -------------------------------------------------------------
 * Usage: faker.string(style, length, prefix)
 * 		1). style can be "upper", "lower" or undefined
 * 		2). legnth can be an arbitrary number or undefined
 * 		3). prefix is a string other than "upper" or "lower"
 *  
 * @author Patrick Zhu
 * @created 2017.06.30
 */

(function(faker){

	//mimic Mock.Random.string, with upper/lower case argument, length argument and prefix argument
	faker.string = function(style, length, prefix){
		//no style only length and prefix
		if(_.isNumber(style)){
			prefix = length;
			length = style;
			style = undefined;
		}
		//style is string but does not equal to upper or lower, then treat it as prefix
		else if(_.isString(style)){
			if(style !== "upper" && style !== "lower"){
				prefix = style;
				style = undefined;
				length = undefined;
			}
		}

		//length is string, then treat it as prefix
		if(_.isString(length)){
			prefix = length;
			length = undefined;
		}

		//check whether length is defined or not
		if(!length){
			length = parseInt(Math.random() * 20) + 1; //make sure length is at least one
		}

		var uppers = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
			lowers = 'abcdefghijklmnopqrstuvwxyz',
			all = uppers + lowers,
			str = '' + (prefix ? prefix : ''),
			i;

		//generate string based on length and style
		for(i = 0; i < length; i += 1){
			if(style === "upper"){
				//upper case
				str += uppers.charAt(parseInt(Math.random() * uppers.length));
			}else if(style === "lower"){
				//lower case
				str += lowers.charAt(parseInt(Math.random() * lowers.length));
			}else{
				//no style
				str += all.charAt(parseInt(Math.random() * all.length));
			}
		}

		return str;
	};

})(faker);