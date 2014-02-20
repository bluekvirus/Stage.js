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
;(function(){

	var _themeRoller = function(theme){
	    $('#theme-roller').attr('href', 'themes/'+theme+'/css/main.css');
	    Application.currentTheme = theme;
	};	

	//Can expose the api to the Application
	//To be considered...
	Application.Util.rollTheme = function(theme){
		//TODO: re-render after theme re-apply.
		_themeRoller(theme);
	}

})();