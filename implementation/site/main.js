NProgress.configure({showSpinner: false});

;(function(app){

    app.setup({

        //You can override other production config vars if wanted.
        //fullScreen: true,
        template: '@site.html',
        contextRegion: 'center',
        defaultContext: 'Home',
        baseAjaxURI: '',
        viewSrcs: 'site'

    }).run();

    //Ajax Progress -- Configure NProgress as global progress indicator.
    if(window.NProgress){
        app.onAjaxStart = function() {
            NProgress.start();
        };
        app.onAjaxStop = function() {
            NProgress.done();
        };  
    }    

})(Application);