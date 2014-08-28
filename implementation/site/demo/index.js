Application.page('Demo', {
    //debug: true,
    className: 'wrapper container',
    template: [
        '<div region="center"></div>',
    ],
    navRegion: 'center',
    onNavigateTo: function(path){
        if(path)
            console.log('Not Found:', path);
        else
            Application.trigger('app:navigate', 'Demo/Editors');
    }

});