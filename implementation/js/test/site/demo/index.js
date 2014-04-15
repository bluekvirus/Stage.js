Application.page('Demo', {
    //debug: true,
    template: [
        '<div region="center"></div>',
    ],
    onNavigateTo: function(subPath){
        this.layout.center.trigger('region:load-view', subPath);
    }

});