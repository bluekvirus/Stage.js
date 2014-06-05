Application.page('Demo', {
    //debug: true,
    template: [
        '<div region="center"></div>',
    ],
    onNavigateTo: function(subPath){
    	if(!subPath)
    		Application.trigger('app:navigate', {module: 'Editors'});
    	else
        	this.center.trigger('region:load-view', subPath);
    }

});