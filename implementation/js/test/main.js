;Application.setup({

    /**
     * ================
     * Development ONLY
     * ================
     */
    
    //CROSSDOMAIN [Warning: Crossdomain Authentication]
    //If you ever need crossdomain development, we recommend that you TURN OFF local server's auth layer/middleware. 
    crossdomain: {
        //enabled: true,
        protocol: '', //https or not? default: '' -> http
        host: '127.0.0.1', 
        port: '5000',
        username: 'admin',
        password: '123'
        /*----------------*/
    },

    //You can override other production config vars if wanted.
    fullScreen: true

}).run();


;(function(){

    Application.create('Context', {
        //don't name so this is the default context.
        layout: [
            '<div region="abc"></div>',
            '<div region="efg"></div>'
        ],

    });

    Application.create('Context', {
        name: 'Login',
        layout: [
            '<div region="2"></div>',
            '<div region="3"></div>'
        ],

    }); 

})();