/**
 * ============================
 * Theme detector/roller
 *
 *
 * @author Tim.Liu
 * @created 2013.04.01
 * @updated 2013.11.08
 * ============================
 */
;(function(app){

	var _themeRoller = function(theme){
		if(!theme) return;
		
	    $('#theme-roller').attr('href', 'themes/'+theme+'/css/main.css');
	    app.currentTheme = theme;
	};	

	//Can expose the api to the Application
	//To be considered...
	app.Util.rollTheme = function(theme){
		//TODO: re-render after theme re-apply.
		_themeRoller(theme);
	}

})(Application);