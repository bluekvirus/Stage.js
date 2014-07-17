Application.page('Demo', {
    //debug: true,
    template: [
        '<div region="center"></div>',
    ],
    navRegion: 'center',
    onNavigationEnd: function(){
        Application.trigger('app:navigate', 'Demo/Editors');
    },
    onNavigateTo: function(path){
        console.log('Not Found:', path);
    }

});