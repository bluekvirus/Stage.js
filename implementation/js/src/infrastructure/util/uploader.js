/**
 * Application universal uploader
 *
 * Usage
 * -----
 * app.upload(url, {data:{...}, fieldname: 'files', multiple: false})
 *
 * @author Tim Lauv
 * @created 2017.03.16
 */
;(function(app){

	function uploader(url, options){
		options = options || {};

		//create hidden file input
	    var $drone = $('#hidden-uploader-input');
	    if($drone.length > 0){
	    }else{
	        $('body').append(
	        	'<input id="hidden-uploader-input" style="display:none;" type="file" name="files">'
    		);
	        $drone = $('#hidden-uploader-input');
	        $drone.fileupload();
	    }

	    //change options (fixing options.data error (jQuery.FileUploader BUG??))
	    var extraData = options.formData || options.data;
	    options.headers = options.headers || {};
	    options.headers[app.config.csrftoken.header] = app.cookie.get(app.config.csrftoken.cookie) || 'NOTOKEN';

	    //Caveat: do NOT use _.without() in place of _.omit() as it will return an array...
		$drone.fileupload('option', _.extend(_.omit(options, 'data'), {
			url: url, 
			formData: extraData, 
			paramName: options.paramName || options.fieldname, 
		}));
		if(options.multiple)
			$drone.attr('multiple', 'true');
		else
			$drone.removeAttr('multiple');

	    return $drone.click();
	}

	app.Util.upload = uploader;

})(Application);