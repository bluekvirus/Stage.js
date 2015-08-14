Application.page('Demo', {
    //debug: true,
    className: 'wrapper container',
    template: [
        '<div region="center" data-effect="fade"></div>',
    ],
    onNavigateTo: function(path){
    	path = path || 'Trees';
        var View = app.get(this.name + '.' + path) || app.get('AccessDenied');
        this.getRegion('center').show(new View());
    }

});