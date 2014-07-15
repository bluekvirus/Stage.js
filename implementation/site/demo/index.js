Application.page('Demo', {
    //debug: true,
    template: [
        '<div region="center"></div>',
    ],
    navRegion: 'center',
    onNavigationEnd: function(){
        Application.trigger('app:navigate', {subpath: 'Editors'});
    },
    onNavigateTo: function(path){
        if(path)
            console.log('Not Found:', path);
    }

});