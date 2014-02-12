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
	    $('#theme-roller').attr('href', 'themes/'+theme+'/styles/main.css');
	    $.ajax({
	    	url: 'themes/'+theme+'/layout.html',
	    	async: false,
	    	success: function(layout){
	    		$('.application-container').replaceWith($(layout).i18n({search: true}));
	    		Application.currentTheme = theme;
	    	},
	    	error: function(msg){
	    		if(theme!=='_default')
	    			_themeRoller('_default');
	    		Application.error('::Theme Error::','<span class="label">', theme, '</span> is not available...switching back to default theme.');
	    	}
	    });
	};	

	var theme = URI(window.location.toString()).search(true).theme || '_default';
	//1st time upload app loading.
	_themeRoller(theme);

	//Can expose the api to the Application
	//To be considered...
	/*Application.rollTheme = function(theme){
		TODO:: re-render after theme re-apply.
		_themeRoller(theme);
	}*/

})();