NProgress.configure({showSpinner: false});

;(function(app){

    app.setup({

        //You can override other production config vars if wanted.
        //fullScreen: true,
        template: '@site.html',
        icings: {
            feedback: {bottom: '2em', left: 0, right: 0, height: '3em'}
        },
        navRegion: 'center',
        defaultView: 'Home',
        //websockets: ['/ws'],
        viewSrcs: 'site'

    });

    //Ajax Progress -- Configure NProgress as global progress indicator.
    app.addInitializer(function(){
        if(window.NProgress){
            app.onAjaxStart = function() {
                NProgress.start();
            };
            app.onAjaxStop = function() {
                NProgress.done();
            };  
        }
    });    

})(Application);